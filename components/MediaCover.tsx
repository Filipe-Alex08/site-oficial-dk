"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

type Props = { title: string; coverUrl?: string | null; videoUrl?: string | null };

export default function MediaCover({ title, coverUrl, videoUrl }: Props) {
  const [coverFailed, setCoverFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  if (coverUrl && !coverFailed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={coverUrl} alt="" onError={() => setCoverFailed(true)} />;
  }

  if (videoUrl && !videoFailed) {
    return (
      <video
        src={videoUrl}
        muted
        playsInline
        autoPlay
        preload="auto"
        aria-label={`Frame do vídeo: ${title}`}
        onLoadedData={(event) => {
          const video = event.currentTarget;
          video.pause();
          if (video.duration > 0) video.currentTime = Math.min(0.1, video.duration);
        }}
        onError={() => setVideoFailed(true)}
      />
    );
  }

  return <div className="media-placeholder"><ImageIcon size={42} /><span>DK</span></div>;
}
