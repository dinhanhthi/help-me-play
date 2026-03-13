"use client";

import { parseMediaUrl } from "@/lib/embed";
import { useI18n } from "@/lib/i18n/context";

interface MediaEmbedProps {
  url: string;
  title?: string;
}

export default function MediaEmbed({ url, title }: MediaEmbedProps) {
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
      <div className="relative w-full overflow-hidden rounded-xl border border-border" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          src={media.embedUrl}
          title={accessibleTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <video
        src={media.embedUrl}
        controls
        className="w-full rounded-xl border border-border"
        title={accessibleTitle}
      >
        <track kind="captions" />
      </video>
    );
  }

  return (
    <img
      src={media.embedUrl}
      alt={accessibleTitle}
      className="w-full rounded-xl border border-border"
    />
  );
}
