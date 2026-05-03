import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, MessageCircle, Send, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useDirectMessageThread, useMessageThreadList } from "@/hooks/useDirectMessageThread";
import { useTranslation, SUPPORTED_LANGUAGES } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function MessagesPage() {
  const { partnerId } = useParams<{ partnerId?: string }>();
  const navigate = useNavigate();

  if (!partnerId) {
    return <MessagesInbox onOpenThread={(id) => navigate(`/messages/${id}`)} />;
  }

  return <MessagesThreadView partnerId={partnerId} onBack={() => navigate("/messages")} />;
}

function MessagesInbox({ onOpenThread }: { onOpenThread: (id: string) => void }) {
  const { threads, loading } = useMessageThreadList();
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Messages" description="Chat with creators and fans with live translation." path="/messages" />
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to={profile?.gender === "female" ? "/dashboard" : "/browse"}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="font-display font-bold text-lg">Messages</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-lg">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : threads.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            No conversations yet. Message someone from Browse or your dashboard.
          </p>
        ) : (
          <div className="space-y-2">
            {threads.map((t) => (
              <button
                key={t.partnerId}
                onClick={() => onOpenThread(t.partnerId)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-card hover:bg-muted/40 text-left transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {t.partnerAvatar ? (
                    <img src={t.partnerAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary">{t.partnerName.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{t.partnerName}</p>
                  <p className="text-sm text-muted-foreground truncate">{t.lastBody}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{formatTime(t.lastAt)}</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function MessagesThreadView({
  partnerId,
  onBack,
}: {
  partnerId: string;
  onBack: () => void;
}) {
  const { user, profile } = useAuth();
  const { messages, loading, sendMessage } = useDirectMessageThread(partnerId);
  const [partnerName, setPartnerName] = useState("Chat");
  const [partnerAvatar, setPartnerAvatar] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [targetLang, setTargetLang] = useState(profile?.language || "en");
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const endRef = useRef<HTMLDivElement>(null);

  const { translate, isTranslating } = useTranslation({ targetLanguage: targetLang });

  useEffect(() => {
    if (profile?.language) setTargetLang(profile.language);
  }, [profile?.language]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("name, avatar_url").eq("id", partnerId).single();
      if (data) {
        setPartnerName(data.name);
        setPartnerAvatar(data.avatar_url);
      }
    })();
  }, [partnerId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, translations]);

  useEffect(() => {
    if (!autoTranslate || !user) return;

    const pending = messages.filter((m) => m.sender_id !== user.id && !translations[m.id]);
    if (pending.length === 0) return;

    let cancelled = false;
    (async () => {
      for (const m of pending) {
        if (cancelled) break;
        const res = await translate(m.body);
        if (!cancelled && res?.translatedText) {
          setTranslations((prev) => ({ ...prev, [m.id]: res.translatedText }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [messages, autoTranslate, user, translate, translations]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    const { error } = await sendMessage(input.trim());
    if (error) {
      toast.error(error.message || "Failed to send");
    } else {
      setInput("");
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title={`Chat — ${partnerName}`} description="Direct messages with translation." path={`/messages/${partnerId}`} />
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur shrink-0">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
              {partnerAvatar ? (
                <img src={partnerAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <MessageCircle className="w-4 h-4 text-primary" />
              )}
            </div>
            <span className="font-semibold truncate">{partnerName}</span>
          </div>
        </div>
      </header>

      <div className="border-b border-border/50 px-4 py-2 flex flex-wrap items-center gap-3 bg-muted/20">
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={autoTranslate}
            onChange={(e) => setAutoTranslate(e.target.checked)}
            className="rounded"
          />
          Auto-translate incoming
        </label>
        <div className="flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={targetLang}
            onChange={(e) => {
              setTargetLang(e.target.value);
              setTranslations({});
            }}
            className="text-xs bg-background rounded-lg px-2 py-1 border border-border"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto container mx-auto px-4 py-4 max-w-lg w-full">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            {messages.map((m) => {
              const isMe = m.sender_id === user?.id;
              const translated = translations[m.id];
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <span className="text-xs text-muted-foreground mb-0.5">{isMe ? "You" : partnerName}</span>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                      isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {m.body}
                  </div>
                  {!isMe && translated && (
                    <div className="max-w-[85%] px-3 py-1.5 mt-1 rounded-xl bg-muted/60 text-xs text-muted-foreground italic">
                      {translated}
                    </div>
                  )}
                  <span className="text-[10px] text-muted-foreground mt-0.5">{formatTime(m.created_at)}</span>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </main>

      <div className="sticky bottom-0 border-t border-border bg-background p-3 shrink-0">
        <div className="container mx-auto max-w-lg flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={sending || isTranslating}
            className="rounded-xl"
          />
          <Button size="icon" variant="hero" className="shrink-0" onClick={handleSend} disabled={sending || !input.trim()}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
