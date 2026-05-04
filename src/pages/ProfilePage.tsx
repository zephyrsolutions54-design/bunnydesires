import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  ArrowLeft,
  User,
  Globe,
  Languages,
  Camera,
  Loader2,
  Save,
  MapPin,
  LogOut,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const countries = [
  "India", "Brazil", "Japan", "Spain", "Ukraine", "Germany",
  "USA", "UK", "France", "Italy", "South Korea", "Russia",
  "Mexico", "Canada", "Australia",
];

const languages = [
  "English", "Hindi", "Spanish", "Portuguese", "Japanese",
  "German", "French", "Italian", "Korean", "Chinese",
  "Russian", "Arabic", "Ukrainian",
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { profile, signOut, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    country: profile?.country || "",
    language: profile?.language || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB.");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast.success("Avatar updated!");
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    if (formData.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name.trim(),
          bio: formData.bio.trim() || null,
          country: formData.country || null,
          language: formData.language || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", {
        body: {},
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      await signOut();
      toast.success("Your account has been deleted.");
      setDeleteDialogOpen(false);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Delete account error:", err);
      const raw =
        err instanceof Error ? err.message : typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message) : "";
      const unreachable =
        raw.includes("Failed to send a request") ||
        raw.includes("FunctionsFetchError") ||
        (typeof err === "object" && err !== null && "name" in err && (err as { name: string }).name === "FunctionsFetchError");

      if (unreachable) {
        if (import.meta.env.DEV) {
          toast.error(
            "delete-account Edge Function is not reachable. Deploy it: supabase functions deploy delete-account (requires Owner/Admin on the Supabase org.)"
          );
        } else {
          toast.error("Account deletion is temporarily unavailable. Please try again later or contact support.");
        }
      } else {
        toast.error(raw || "Could not delete account. Try again or contact support.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const backPath = profile?.gender === "female" ? "/dashboard" : "/browse";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-primary fill-primary" />
              <span className="font-display font-bold text-lg text-gradient hidden sm:inline">
                Bunny Desires
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Link */}
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="font-display text-3xl font-bold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground mb-8">
            Update your profile information to attract more connections.
          </p>

          {/* Avatar Section */}
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 mb-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-primary-foreground" />
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              <div>
                <h3 className="font-semibold text-lg">{profile?.name}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="text-sm text-primary hover:underline mt-1"
                >
                  {isUploading ? "Uploading..." : "Change photo"}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your display name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10 h-12 rounded-xl"
                  maxLength={50}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell others about yourself..."
                value={formData.bio}
                onChange={handleInputChange}
                className="rounded-xl min-h-[100px] resize-none"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.bio.length}/300
              </p>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                >
                  <option value="">Select your country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Primary Language</Label>
              <div className="relative">
                <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                >
                  <option value="">Select your language</option>
                  {languages.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save Button */}
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card border border-destructive/30 mt-6">
            <h2 className="font-semibold text-lg text-destructive mb-1">Delete account</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently remove your profile, wallet, and login. This cannot be undone.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete my account
            </Button>
          </div>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  All of your data will be permanently deleted, including your profile, messages, and
                  wallet balance. You will not be able to recover this account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteAccount();
                  }}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                      Deleting…
                    </>
                  ) : (
                    "Yes, delete my account"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;
