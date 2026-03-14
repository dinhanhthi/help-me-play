"use client";

import { parseMediaUrl } from "@/lib/embed";
import { useI18n } from "@/lib/i18n/context";

interface MediaEmbedProps {
  url: string;
  /** Original source URL before Cloudinary migration (shown as "Source" credit) */
  sourceUrl?: string;
  title?: string;
  /** GitHub edit URL for "Fix broken" link */
  editUrl?: string;
}

function getSourceDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    if (hostname.includes("ssb.wiki.gallery") || hostname.includes("ssbwiki.com")) return "SmashWiki";
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "YouTube";
    if (hostname.includes("vimeo.com")) return "Vimeo";
    if (hostname.includes("giphy.com")) return "Giphy";
    return hostname;
  } catch {
    return "";
  }
}

function MediaCredit({ url, editUrl }: { url: string; editUrl?: string }) {
  const { t } = useI18n();
  const source = getSourceDomain(url);

  return (
    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted">
      {source && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-60 transition-opacity hover:opacity-100 hover:underline underline-offset-4"
        >
          {t.media.source}
        </a>
      )}
      {source && editUrl && <span className="opacity-40">·</span>}
      {editUrl && (
        <a
          href={editUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-60 transition-opacity hover:opacity-100 hover:underline underline-offset-4"
        >
          {t.media.fixBroken}
        </a>
      )}
    </div>
  );
}

export default function MediaEmbed({ url, sourceUrl, title, editUrl }: MediaEmbedProps) {
  const { t } = useI18n();
  const media = parseMediaUrl(url);
  const accessibleTitle = title ?? t.media.embeddedMedia;

  if (media.provider === "invalid") {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-border bg-surface text-sm text-muted">
        {t.media.invalidUrl}
      </div>
    );
  }

  if (
    media.provider === "youtube" ||
    media.provider === "vimeo" ||
    media.provider === "dailymotion"
  ) {
    return (
      <div>
        <div className="relative w-full max-h-[250px] overflow-hidden rounded-xl" style={{ aspectRatio: "16 / 9" }}>
          <iframe
            src={media.embedUrl}
            title={accessibleTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation"
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <MediaCredit url={sourceUrl ?? url} editUrl={editUrl} />
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <div>
        <video
          src={media.embedUrl}
          controls
          className="w-full max-h-[250px] rounded-xl object-contain"
          title={accessibleTitle}
        >
          <track kind="captions" />
        </video>
        <MediaCredit url={sourceUrl ?? url} editUrl={editUrl} />
      </div>
    );
  }

  return (
    <div>
      <img
        src={media.embedUrl}
        alt={accessibleTitle}
        className="w-full max-h-[250px] rounded-xl object-contain"
      />
      <MediaCredit url={url} editUrl={editUrl} />
    </div>
  );
}
