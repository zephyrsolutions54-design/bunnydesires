import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
}

const SITE_NAME = "Bunny Desires";
const DEFAULT_DESCRIPTION =
  "Connect globally through video chat with real-time translation. Meet amazing people, send virtual gifts, and build meaningful connections worldwide.";
const BASE_URL = "https://bunnydesires.com";

export function SEOHead({ title, description, path }: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Global Video Chat & Connections`;
  const desc = description || DEFAULT_DESCRIPTION;
  const url = path ? `${BASE_URL}${path}` : BASE_URL;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", desc);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
  }, [fullTitle, desc, url]);

  return null;
}
