"use client";

import { useState, useEffect, useRef } from "react";
import { parseMediaUrl } from "@/lib/embed";
import { useI18n } from "@/lib/i18n/context";

function MediaSkeleton() {
  return (
    <div className="flex h-[250px] shrink-0 w-full items-center justify-center rounded-xl bg-surface">
      <div className="flex flex-col items-center gap-2 text-muted">
        <svg
          className="h-8 w-8 animate-pulse"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      </div>
    </div>
  );
}

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
    if (hostname.includes("ssb.wiki.gallery") || hostname.includes("ssbwiki.com"))
      return "SmashWiki";
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
    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
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

  return (
    <MediaContent
      media={media}
      accessibleTitle={accessibleTitle}
      url={url}
      sourceUrl={sourceUrl}
      editUrl={editUrl}
    />
  );
}

function MediaContent({
  media,
  accessibleTitle,
  url,
  sourceUrl,
  editUrl,
}: {
  media: ReturnType<typeof parseMediaUrl>;
  accessibleTitle: string;
  url: string;
  sourceUrl?: string;
  editUrl?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if img/video is already loaded from cache after mount
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
    if (videoRef.current && videoRef.current.readyState >= 2) setLoaded(true);
  }, []);

  if (
    media.provider === "youtube" ||
    media.provider === "vimeo" ||
    media.provider === "dailymotion"
  ) {
    return (
      <div className="flex flex-col gap-0.5 items-center justify-center">
        <div
          className="relative max-h-[250px] overflow-hidden rounded-xl w-full"
          style={{ aspectRatio: "16 / 9" }}
        >
          {!loaded && <MediaSkeleton />}
          <iframe
            src={media.embedUrl}
            title={accessibleTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation"
            className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
          />
        </div>
        <MediaCredit url={sourceUrl ?? url} editUrl={editUrl} />
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <div className="flex flex-col gap-0.5 items-center justify-center">
        <div className="relative max-h-[250px] overflow-hidden rounded-xl w-full">
          {!loaded && <MediaSkeleton />}
          <video
            ref={videoRef}
            src={media.embedUrl}
            controls
            className={`w-full max-h-[250px] object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "absolute inset-0 opacity-0"}`}
            title={accessibleTitle}
            onLoadedData={() => setLoaded(true)}
          >
            <track kind="captions" />
          </video>
        </div>
        <MediaCredit url={sourceUrl ?? url} editUrl={editUrl} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 items-center justify-center">
      <div className="relative max-h-[250px] overflow-hidden rounded-xl w-full">
        {!loaded && <MediaSkeleton />}
        <img
          ref={imgRef}
          src={media.embedUrl}
          alt={accessibleTitle}
          className={`w-full max-h-[250px] object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "absolute inset-0 opacity-0"}`}
          onLoad={() => setLoaded(true)}
        />
      </div>
      <MediaCredit url={url} editUrl={editUrl} />
    </div>
  );
}
