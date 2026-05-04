import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserGender = "male" | "female";
type RatingTier = "platinum" | "gold" | "silver" | "bronze" | "standard";

interface RatingBreakdown {
  five_stars: number;
  four_stars: number;
  three_stars: number;
  two_stars: number;
  one_star: number;
}

interface Profile {
  id: string;
  email: string;
  name: string;
  gender: UserGender;
  avatar_url: string | null;
  bio: string | null;
  country: string;
  language: string;
  is_online: boolean;
  is_verified: boolean;
  rating: number;
  total_ratings: number;
  rating_breakdown: RatingBreakdown | null;
  rating_tier: RatingTier;
  current_earnings_rate: number;
  created_at: string;
  updated_at: string;
}

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_purchased: number;
  total_spent: number;
}

interface Earnings {
  id: string;
  user_id: string;
  call_earnings: number;
  gift_earnings: number;
  total_earnings: number;
  withdrawn_amount: number;
  available_balance: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  wallet: Wallet | null;
  earnings: Earnings | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
    gender: UserGender,
    ageConfirmed21: boolean
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      // Parse rating_breakdown from JSON
      const rawBreakdown = profileData?.rating_breakdown as Record<string, number> | null;
      const parsedProfile: Profile = {
        ...profileData,
        rating_breakdown: rawBreakdown ? {
          five_stars: rawBreakdown.five_stars ?? 0,
          four_stars: rawBreakdown.four_stars ?? 0,
          three_stars: rawBreakdown.three_stars ?? 0,
          two_stars: rawBreakdown.two_stars ?? 0,
          one_star: rawBreakdown.one_star ?? 0,
        } : null,
        rating_tier: (profileData.rating_tier as RatingTier) || 'standard',
        current_earnings_rate: profileData.current_earnings_rate ?? 6,
      };

      setProfile(parsedProfile);

      // Fetch wallet
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!walletError && walletData) {
        setWallet(walletData as Wallet);
      }

      // Fetch earnings for female users
      if (profileData?.gender === "female") {
        const { data: earningsData, error: earningsError } = await supabase
          .from("earnings")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (!earningsError && earningsData) {
          setEarnings(earningsData as Earnings);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Real-time subscriptions for wallet and earnings
  useEffect(() => {
    if (!user) return;

    const walletChannel = supabase
      .channel(`wallet-rt-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wallets",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setWallet(payload.new as Wallet);
        }
      )
      .subscribe();

    const earningsChannel = supabase
      .channel(`earnings-rt-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "earnings",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setEarnings(payload.new as Earnings);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(walletChannel);
      supabase.removeChannel(earningsChannel);
    };
  }, [user]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer Supabase calls with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setWallet(null);
          setEarnings(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    gender: UserGender,
    ageConfirmed21: boolean
  ) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          gender,
          age_confirmed_21: ageConfirmed21,
        },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Set user offline before signing out
    if (user) {
      await supabase
        .from("profiles")
        .update({ is_online: false })
        .eq("id", user.id);
    }
    
    await supabase.auth.signOut();
    setProfile(null);
    setWallet(null);
    setEarnings(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        wallet,
        earnings,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
