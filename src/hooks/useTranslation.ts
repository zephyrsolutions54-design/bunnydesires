import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

interface UseTranslationOptions {
  targetLanguage: string;
  sourceLanguage?: string;
}

export function useTranslation({ targetLanguage, sourceLanguage }: UseTranslationOptions) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(
    async (text: string): Promise<TranslationResult | null> => {
      if (!text.trim()) {
        return null;
      }

      setIsTranslating(true);
      setError(null);

      try {
        const { data, error: functionError } = await supabase.functions.invoke("translate", {
          body: {
            text,
            targetLanguage,
            sourceLanguage,
          },
        });

        if (functionError) {
          throw new Error(functionError.message);
        }

        if (data.error) {
          throw new Error(data.error);
        }

        return data as TranslationResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Translation failed";
        setError(errorMessage);
        console.error("Translation error:", err);
        return null;
      } finally {
        setIsTranslating(false);
      }
    },
    [targetLanguage, sourceLanguage]
  );

  const translateBatch = useCallback(
    async (texts: string[]): Promise<(TranslationResult | null)[]> => {
      setIsTranslating(true);
      setError(null);

      try {
        const results = await Promise.all(
          texts.map(async (text) => {
            if (!text.trim()) return null;

            const { data, error: functionError } = await supabase.functions.invoke("translate", {
              body: {
                text,
                targetLanguage,
                sourceLanguage,
              },
            });

            if (functionError || data.error) {
              console.error("Batch translation error for:", text);
              return null;
            }

            return data as TranslationResult;
          })
        );

        return results;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Batch translation failed";
        setError(errorMessage);
        console.error("Batch translation error:", err);
        return [];
      } finally {
        setIsTranslating(false);
      }
    },
    [targetLanguage, sourceLanguage]
  );

  return {
    translate,
    translateBatch,
    isTranslating,
    error,
  };
}

// Supported languages for the platform
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];
