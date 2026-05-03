import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LiveKitRoom,
  VideoTrack,
  useTracks,
  useRoomContext,
  useConnectionState,
  useDataChannel,
} from "@livekit/components-react";
import { Track, ConnectionState, RoomEvent, DataPublishOptions } from "livekit-client";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Gift,
  Coins,
  Loader2,
  Send,
  Globe,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SendGiftModal } from "@/components/modals/SendGiftModal";
import { RatingModal } from "@/components/rating/RatingModal";
import { useTranslation, SUPPORTED_LANGUAGES } from "@/hooks/useTranslation";

interface CallInfo {
  callId: string;
  token: string;
  roomName: string;
  coinsPerMinute: number;
  receiver: {
    id: string;
    name: string;
    avatar_url: string | null;
    /** Preferred language code for auto-translation (from profiles.language) */
    language?: string;
  };
}

interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  translatedText?: string;
  timestamp: number;
  kind?: "chat" | "gift";
  giftEmoji?: string;
  giftName?: string;
  giftCoins?: number;
}

type DataPayload =
  | (ChatMessage & { v?: number; kind?: "chat" })
  | {
      v: number;
      kind: "gift";
      id: string;
      sender: string;
      senderName: string;
      giftName: string;
      giftEmoji: string;
      giftCoins: number;
      timestamp: number;
      /** Matches `gifts.id` when known — dedupes toast with Postgres realtime */
      giftDbId?: string;
    };

// Inner component that has access to room context
function CallRoom({
  callInfo,
  onCallEnd,
}: {
  callInfo: CallInfo;
  onCallEnd: (duration: number, coinsSpent: number) => void;
}) {
  const { user, profile, wallet } = useAuth();
  const room = useRoomContext();
  const connectionState = useConnectionState();

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [targetLang, setTargetLang] = useState(profile?.language || "en");
  const [autoTranslateIncoming, setAutoTranslateIncoming] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  /** Dedupe in-call gift toasts when both LiveKit data + Supabase realtime fire */
  const inCallGiftNotifyDedupeRef = useRef(new Set<string>());

  useEffect(() => {
    if (profile?.language) setTargetLang(profile.language);
  }, [profile?.language]);

  const coinsAccumulated = Math.ceil(elapsedSeconds / 60) * callInfo.coinsPerMinute;
  const walletBalance = wallet?.balance || 0;

  const { translate, isTranslating } = useTranslation({ targetLanguage: targetLang });

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.Microphone, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const remoteCameraTrack = tracks.find(
    (t) =>
      t.source === Track.Source.Camera &&
      t.participant.identity !== profile?.id
  );

  const localCameraTrack = tracks.find(
    (t) =>
      t.source === Track.Source.Camera &&
      t.participant.identity === profile?.id
  );

  // Timer
  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [connectionState]);

  // Auto-end on low balance
  useEffect(() => {
    if (walletBalance > 0 && coinsAccumulated >= walletBalance) {
      toast.warning("Your coin balance has run out. Ending call...");
      handleEndCall();
    }
  }, [coinsAccumulated, walletBalance]);

  // Listen for participant disconnect
  useEffect(() => {
    if (!room) return;

    const handleDisconnect = () => {
      toast.info("The other participant has left the call.");
      handleEndCall();
    };

    room.on(RoomEvent.ParticipantDisconnected, handleDisconnect);
    return () => {
      room.off(RoomEvent.ParticipantDisconnected, handleDisconnect);
    };
  }, [room]);

  // Auto-end call if user closes/refreshes the tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Fire-and-forget call to end-call via sendBeacon for reliability
      const url = `${import.meta.env.VITE_SUPABASE_URL || ""}/functions/v1/end-call`;
      const body = JSON.stringify({ callId: callInfo.callId });
      navigator.sendBeacon(url, body);
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [callInfo.callId]);

  // In-call gift notifications: Supabase realtime (requires `gifts` on publication supabase_realtime)
  useEffect(() => {
    if (!profile?.id) return;
    const peerId = callInfo.receiver.id;

    const channel = supabase
      .channel(`in-call-gifts-${callInfo.callId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "gifts",
          filter: `receiver_id=eq.${profile.id}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            sender_id: string;
            gift_name: string;
            coins_amount: number;
          };
          if (row.sender_id !== peerId) return;
          if (inCallGiftNotifyDedupeRef.current.has(row.id)) return;
          inCallGiftNotifyDedupeRef.current.add(row.id);
          toast.success("You received a gift!", {
            description: `${row.gift_name} · +${row.coins_amount} coins`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [callInfo.callId, callInfo.receiver.id, profile?.id]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Data channel for chat
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const onDataReceived = useCallback(
    (msg: { payload: Uint8Array }) => {
      try {
        const parsed = JSON.parse(decoder.decode(msg.payload)) as DataPayload;

        if ("kind" in parsed && parsed.kind === "gift") {
          const giftMsg: ChatMessage = {
            id: parsed.id,
            sender: parsed.sender,
            senderName: parsed.senderName,
            text: `Sent ${parsed.giftEmoji} ${parsed.giftName} (${parsed.giftCoins} coins)`,
            timestamp: parsed.timestamp,
            kind: "gift",
            giftEmoji: parsed.giftEmoji,
            giftName: parsed.giftName,
            giftCoins: parsed.giftCoins,
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === giftMsg.id)) return prev;
            return [...prev, giftMsg];
          });
          const dedupeKey = parsed.giftDbId || parsed.id;
          if (profile?.id && parsed.sender !== profile.id) {
            if (!inCallGiftNotifyDedupeRef.current.has(dedupeKey)) {
              inCallGiftNotifyDedupeRef.current.add(dedupeKey);
              toast.success("You received a gift!", {
                description: `${parsed.giftEmoji} ${parsed.giftName} · +${parsed.giftCoins} coins`,
              });
            }
          }
          return;
        }

        const chat = parsed as ChatMessage;
        setMessages((prev) => {
          if (prev.some((m) => m.id === chat.id)) return prev;
          return [...prev, chat];
        });

        if (
          autoTranslateIncoming &&
          profile?.id &&
          chat.sender !== profile.id &&
          chat.text?.trim()
        ) {
          translate(chat.text).then((res) => {
            if (!res?.translatedText) return;
            setMessages((prev) =>
              prev.map((m) => (m.id === chat.id ? { ...m, translatedText: res.translatedText } : m))
            );
          });
        }
      } catch {
        // ignore non-JSON data
      }
    },
    [autoTranslateIncoming, profile?.id, translate]
  );

  const { send: sendData } = useDataChannel("chat", onDataReceived);

  const handleSendMessage = () => {
    if (!chatInput.trim() || !profile) return;

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: profile.id,
      senderName: profile.name,
      text: chatInput.trim(),
      timestamp: Date.now(),
      kind: "chat",
    };

    setMessages((prev) => [...prev, msg]);
    sendData?.(encoder.encode(JSON.stringify({ v: 1, kind: "chat", ...msg })), {} as DataPublishOptions);
    setChatInput("");
  };

  const broadcastGiftOverDataChannel = (info: {
    giftName: string;
    giftEmoji: string;
    coins: number;
    giftDbId?: string;
  }) => {
    if (!profile) return;
    const payload: DataPayload = {
      v: 1,
      kind: "gift",
      id: crypto.randomUUID(),
      sender: profile.id,
      senderName: profile.name,
      giftName: info.giftName,
      giftEmoji: info.giftEmoji,
      giftCoins: info.coins,
      timestamp: Date.now(),
      ...(info.giftDbId ? { giftDbId: info.giftDbId } : {}),
    };
    sendData?.(encoder.encode(JSON.stringify(payload)), {} as DataPublishOptions);
  };

  const handleTranslate = async (msgId: string, text: string) => {
    const result = await translate(text);
    if (result) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, translatedText: result.translatedText } : m
        )
      );
    }
  };

  const handleEndCall = async () => {
    if (isEnding) return;
    setIsEnding(true);

    try {
      // Try edge function first
      let ended = false;
      try {
        const { data, error } = await supabase.functions.invoke("end-call", {
          body: { callId: callInfo.callId },
        });
        if (!error && data && !data.error) {
          onCallEnd(data.duration || elapsedSeconds, data.coinsSpent || coinsAccumulated);
          ended = true;
        }
      } catch {
        // Edge function failed — fall back to direct DB
      }

      if (!ended) {
        // Direct DB fallback: mark call as ended and settle coins
        const endTime = new Date();
        const coinsSpent = coinsAccumulated;

        await supabase
          .from("calls")
          .update({
            status: "ended",
            end_time: endTime.toISOString(),
            duration_seconds: elapsedSeconds,
            coins_spent: coinsSpent,
          })
          .eq("id", callInfo.callId);

        if (coinsSpent > 0 && user) {
          // Deduct from own wallet (RLS allows)
          const { data: myWallet } = await supabase
            .from("wallets")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (myWallet) {
            await supabase
              .from("wallets")
              .update({
                balance: myWallet.balance - coinsSpent,
                total_spent: myWallet.total_spent + coinsSpent,
                updated_at: endTime.toISOString(),
              })
              .eq("user_id", user.id);
          }

          // Record own transaction only (RLS blocks cross-user inserts)
          await supabase.from("transactions").insert({
            user_id: user.id,
            type: "call_deduction",
            coins: coinsSpent,
            amount: Math.round(coinsSpent / 6),
            status: "completed",
            related_user_id: callInfo.receiver.id,
            related_call_id: callInfo.callId,
            description: `Video call with ${callInfo.receiver.name} - ${Math.ceil(elapsedSeconds / 60)} min`,
          });

          // Creator's earnings credit will be handled by edge function in production
        }

        onCallEnd(elapsedSeconds, coinsSpent);
      }
    } catch (err) {
      console.error("End call error:", err);
      onCallEnd(elapsedSeconds, coinsAccumulated);
    }
  };

  const toggleMute = () => {
    room?.localParticipant.setMicrophoneEnabled(isMuted);
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    room?.localParticipant.setCameraEnabled(isCameraOff);
    setIsCameraOff(!isCameraOff);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const isCallerMale = profile?.gender === "male";

  if (connectionState === ConnectionState.Connecting) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Connecting to call...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center overflow-hidden">
            {callInfo.receiver.avatar_url ? (
              <img src={callInfo.receiver.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-white">
                {callInfo.receiver.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{callInfo.receiver.name}</p>
            <p className="text-white/60 text-xs">{formatTime(elapsedSeconds)}</p>
          </div>
        </div>

        {isCallerMale && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-bunny-gold/30">
            <Coins className="w-4 h-4 text-bunny-gold" />
            <span className="text-bunny-gold text-sm font-semibold">
              {coinsAccumulated}
            </span>
            <span className="text-white/40 text-xs">
              / {walletBalance.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video (full screen) */}
        {remoteCameraTrack?.publication?.track ? (
          <VideoTrack
            trackRef={remoteCameraTrack}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20">
            <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-5xl font-bold text-white">
                {callInfo.receiver.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Local Video (PIP) */}
        <div className="absolute bottom-24 right-4 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-black">
          {localCameraTrack?.publication?.track && !isCameraOff ? (
            <VideoTrack
              trackRef={localCameraTrack}
              className="w-full h-full object-cover mirror"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/30">
              <VideoOff className="w-6 h-6 text-white/50" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex items-center justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent">
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            isMuted ? "bg-red-500/80" : "bg-white/20 hover:bg-white/30"
          }`}
        >
          {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
        </button>

        <button
          onClick={toggleCamera}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            isCameraOff ? "bg-red-500/80" : "bg-white/20 hover:bg-white/30"
          }`}
        >
          {isCameraOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
        </button>

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            isChatOpen ? "bg-primary/80" : "bg-white/20 hover:bg-white/30"
          }`}
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>

        {isCallerMale && (
          <button
            onClick={() => setIsGiftOpen(true)}
            className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <Gift className="w-6 h-6 text-white" />
          </button>
        )}

        <button
          onClick={handleEndCall}
          disabled={isEnding}
          className="w-16 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
        >
          {isEnding ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <PhoneOff className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 bottom-0 w-80 max-w-[85vw] z-30 bg-background/95 backdrop-blur-lg border-l border-border/50 flex flex-col"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="font-semibold text-sm">Chat</h3>
              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={autoTranslateIncoming}
                    onChange={(e) => setAutoTranslateIncoming(e.target.checked)}
                    className="rounded border-border"
                  />
                  Auto-translate
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="text-xs bg-muted rounded-lg px-2 py-1 border-0 max-w-[140px]"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-muted rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Send a message to start chatting
                </p>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender === profile?.id;
                const isGift = msg.kind === "gift";
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <span className="text-xs text-muted-foreground mb-1">
                      {isMe ? "You" : msg.senderName}
                      {isGift && " · gift"}
                    </span>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                        isGift
                          ? "bg-pink-500/20 text-pink-100 border border-pink-400/30"
                          : isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                      }`}
                    >
                      {isGift ? (
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{msg.giftEmoji}</span>
                          <span>{msg.text}</span>
                        </span>
                      ) : (
                        msg.text
                      )}
                    </div>
                    {!isGift && msg.translatedText && (
                      <div className="max-w-[85%] px-3 py-1.5 mt-1 rounded-xl bg-muted/50 text-xs text-muted-foreground italic">
                        {msg.translatedText}
                      </div>
                    )}
                    {!isGift && !isMe && !msg.translatedText && (
                      <button
                        onClick={() => handleTranslate(msg.id, msg.text)}
                        disabled={isTranslating}
                        className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        <Globe className="w-3 h-3" />
                        Translate
                      </button>
                    )}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-border/50">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="h-10 rounded-xl text-sm"
                />
                <Button size="icon" variant="hero" className="h-10 w-10 flex-shrink-0" onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gift Modal */}
      {isCallerMale && (
        <SendGiftModal
          isOpen={isGiftOpen}
          onClose={() => setIsGiftOpen(false)}
          receiverId={callInfo.receiver.id}
          receiverName={callInfo.receiver.name}
          callId={callInfo.callId}
          onGiftSent={broadcastGiftOverDataChannel}
        />
      )}
    </div>
  );
}

// Waiting screen shown to the caller while the creator hasn't accepted yet
function CallWaitingScreen({
  callInfo,
  callId,
  onAccepted,
  onDeclined,
  onCancel,
}: {
  callInfo: CallInfo;
  callId: string;
  onAccepted: () => void;
  onDeclined: () => void;
  onCancel: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tick elapsed every second
  useEffect(() => {
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // Auto-cancel after 60 seconds
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      onDeclined();
    }, 60_000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [onDeclined]);

  // Realtime subscription on the call row
  useEffect(() => {
    const channel = supabase
      .channel(`call-status-${callId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "calls",
          filter: `id=eq.${callId}`,
        },
        (payload) => {
          const status = (payload.new as { status: string }).status;
          if (status === "active") onAccepted();
          else if (status === "declined" || status === "ended") onDeclined();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [callId, onAccepted, onDeclined]);

  const handleCancel = async () => {
    try {
      await supabase.functions.invoke("decline-call", { body: { callId } });
    } catch {
      // best-effort
    }
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center space-y-8"
      >
        {/* Avatar with pulsing ring */}
        <div className="relative mx-auto w-28 h-28">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full gradient-primary"
          />
          <div className="absolute inset-2 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {callInfo.receiver.avatar_url ? (
              <img
                src={callInfo.receiver.avatar_url}
                alt={callInfo.receiver.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-white">
                {callInfo.receiver.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold mb-1">
            Calling {callInfo.receiver.name}...
          </h2>
          <p className="text-muted-foreground text-sm">
            Waiting for response &middot; {elapsed}s
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Coins className="w-4 h-4 text-bunny-gold" />
          <span>{callInfo.coinsPerMinute} coins/min</span>
        </div>

        <Button
          variant="destructive"
          size="lg"
          className="rounded-full w-16 h-16 mx-auto"
          onClick={handleCancel}
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
        <p className="text-xs text-muted-foreground">Tap to cancel</p>
      </motion.div>
    </div>
  );
}

// Main page component
const CallPage = () => {
  const { id: callId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, refreshProfile } = useAuth();

  const [callInfo, setCallInfo] = useState<CallInfo | null>(
    (location.state as { callInfo?: CallInfo })?.callInfo || null
  );
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [callSummary, setCallSummary] = useState<{ duration: number; coinsSpent: number } | null>(null);
  const [showRating, setShowRating] = useState(false);

  const livekitUrl = import.meta.env.VITE_LIVEKIT_URL;

  // Creators who join via IncomingCallNotification already have an active call — skip waiting
  const isCreator = profile?.gender === "female";

  // If we don't have call info from navigation state, we can't join
  useEffect(() => {
    if (!callInfo && !callEnded) {
      toast.error("Call session not found. Please start a new call.");
      navigate(isCreator ? "/dashboard" : "/browse", { replace: true });
    }
  }, [callInfo, callEnded, navigate, isCreator]);

  const handleCallAccepted = useCallback(() => {
    setCallAccepted(true);
  }, []);

  const handleCallDeclined = useCallback(() => {
    toast.error("Call was declined or timed out.");
    navigate("/browse", { replace: true });
  }, [navigate]);

  const handleCallCancel = useCallback(() => {
    navigate("/browse", { replace: true });
  }, [navigate]);

  const handleCallEnd = async (duration: number, coinsSpent: number) => {
    setCallEnded(true);
    setCallSummary({ duration, coinsSpent });
    await refreshProfile();

    if (profile?.gender === "male") {
      setShowRating(true);
    }
  };

  const handleRatingDone = () => {
    setShowRating(false);
    navigate("/browse", { replace: true });
  };

  const handleSkipRating = () => {
    setShowRating(false);
    navigate("/browse", { replace: true });
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m === 0) return `${sec}s`;
    return `${m}m ${sec}s`;
  };

  // Post-call summary screen
  if (callEnded && callSummary) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto">
            {callInfo?.receiver.avatar_url ? (
              <img src={callInfo.receiver.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-3xl font-bold text-white">
                {callInfo?.receiver.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold mb-1">Call Ended</h2>
            <p className="text-muted-foreground">
              with {callInfo?.receiver.name}
            </p>
          </div>

          <div className="flex items-center justify-center gap-8">
            <div>
              <p className="text-2xl font-bold">{formatDuration(callSummary.duration)}</p>
              <p className="text-sm text-muted-foreground">Duration</p>
            </div>
            {profile?.gender === "male" && (
              <div>
                <p className="text-2xl font-bold text-bunny-gold flex items-center justify-center gap-1">
                  <Coins className="w-5 h-5" />
                  {callSummary.coinsSpent}
                </p>
                <p className="text-sm text-muted-foreground">Coins Spent</p>
              </div>
            )}
          </div>

          {!showRating && (
            <div className="space-y-3">
              {profile?.gender === "male" && (
                <Button variant="hero" className="w-full" onClick={() => setShowRating(true)}>
                  Rate Your Experience
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(profile?.gender === "female" ? "/dashboard" : "/browse", { replace: true })}
              >
                {profile?.gender === "female" ? "Back to Dashboard" : "Back to Browse"}
              </Button>
            </div>
          )}
        </motion.div>

        {/* Rating Modal */}
        {showRating && callInfo && (
          <RatingModal
            isOpen={showRating}
            onClose={handleSkipRating}
            callId={callInfo.callId}
            creatorName={callInfo.receiver.name}
            creatorAvatar={callInfo.receiver.avatar_url}
            onRatingSubmitted={handleRatingDone}
          />
        )}
      </div>
    );
  }

  if (!callInfo) return null;

  // Male caller: show waiting screen until the creator accepts
  if (!isCreator && !callAccepted) {
    return (
      <CallWaitingScreen
        callInfo={callInfo}
        callId={callInfo.callId}
        onAccepted={handleCallAccepted}
        onDeclined={handleCallDeclined}
        onCancel={handleCallCancel}
      />
    );
  }

  return (
    <LiveKitRoom
      serverUrl={livekitUrl}
      token={callInfo.token}
      connect={true}
      video={true}
      audio={true}
      onDisconnected={() => {
        if (!callEnded) {
          handleCallEnd(0, 0);
        }
      }}
    >
      <CallRoom callInfo={callInfo} onCallEnd={handleCallEnd} />
    </LiveKitRoom>
  );
};

export default CallPage;
