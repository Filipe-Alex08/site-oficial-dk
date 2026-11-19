"use client";

import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

export type GalleryItem = { id: string; type: "image" | "video"; url: string; caption?: string | null };

const noopSubscribe = () => () => {};
const SWIPE_MIN = 50;

/**
 * Grade de fotos e vídeos da publicação com visualizador em tela cheia
 * (setas, teclado, deslize no celular, foco preso e devolvido a quem abriu).
 */
export default function MediaGallery({ items, title, poster, postText }: { items: GalleryItem[]; title: string; poster?: string | null; postText?: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  // O visualizador vai para o <body>, que não existe no servidor.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const open = index !== null;
  const count = items.length;

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback((delta: number) => setIndex((current) => current === null ? current : (current + delta + count) % count), [count]);

  useEffect(() => {
    if (!open) return;
    const opener = openerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      else if (event.key === "ArrowLeft" && count > 1) { event.preventDefault(); step(-1); }
      else if (event.key === "ArrowRight" && count > 1) { event.preventDefault(); step(1); }
      else if (event.key === "Tab") {
        const controls = Array.from(viewerRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), video[controls]') ?? []);
        if (!controls.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      opener?.focus({ preventScroll: true });
    };
  }, [open, count, close, step]);

  // Aquece a próxima foto para a troca não piscar.
  useEffect(() => {
    if (index === null || count < 2) return;
    const next = items[(index + 1) % count];
    if (next.type === "image") new Image().src = next.url;
  }, [index, items, count]);

  function onTouchEnd(clientX: number, clientY: number) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || count < 2) return;
    const dx = clientX - start.x;
    const dy = clientY - start.y;
    if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  }

  const current = index === null ? null : items[index];
  const layout = count === 1 ? "is-single" : count === 2 ? "is-pair" : "has-lead";

  return <>
    <div className={`media-gallery ${layout}`}>
      {items.map((item, itemIndex) => <button
        key={item.id}
        type="button"
        className="gallery-item"
        aria-haspopup="dialog"
        aria-label={`${item.type === "video" ? "Abrir vídeo" : "Ampliar foto"} ${itemIndex + 1} de ${count}${item.caption ? `: ${item.caption}` : ""}`}
        onClick={(event) => { openerRef.current = event.currentTarget; setIndex(itemIndex); }}
      >
        {item.type === "video"
          // O quadro vem do próprio arquivo (#t) quando a publicação não tem capa.
          ? <><video src={poster ? item.url : `${item.url}#t=0.1`} poster={poster || undefined} muted playsInline preload="metadata" aria-hidden="true" tabIndex={-1} /><span className="gallery-item-play" aria-hidden="true"><Play size={22} /></span></>
          // eslint-disable-next-line @next/next/no-img-element
          : <img src={item.url} alt="" loading="lazy" decoding="async" />}
      </button>)}
    </div>

    {mounted && current && createPortal(
      <div className="viewer" ref={viewerRef} role="dialog" aria-modal="true" aria-label={`Galeria: ${title}`}>
        <div className="viewer-bar">
          <p className="viewer-count" aria-live="polite">{(index ?? 0) + 1} / {count}</p>
          <button ref={closeRef} className="viewer-button" type="button" onClick={close} aria-label="Fechar galeria"><X size={22} aria-hidden="true" /></button>
        </div>
        <div
          className="viewer-stage"
          onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
          onTouchStart={(event) => { const touch = event.touches[0]; touchStart.current = { x: touch.clientX, y: touch.clientY }; }}
          onTouchEnd={(event) => { const touch = event.changedTouches[0]; onTouchEnd(touch.clientX, touch.clientY); }}
        >
          {current.type === "video"
            ? <video key={current.id} src={current.url} poster={poster || undefined} controls playsInline preload="metadata" aria-label={current.caption || `Vídeo ${(index ?? 0) + 1}`} />
            // eslint-disable-next-line @next/next/no-img-element
            : <img key={current.id} src={current.url} alt={current.caption || `Foto ${(index ?? 0) + 1} de ${title}`} />}
          {count > 1 && <>
            <button className="viewer-button viewer-nav is-prev" type="button" onClick={() => step(-1)} aria-label="Anterior"><ChevronLeft size={24} aria-hidden="true" /></button>
            <button className="viewer-button viewer-nav is-next" type="button" onClick={() => step(1)} aria-label="Próxima"><ChevronRight size={24} aria-hidden="true" /></button>
          </>}
        </div>
        <div className="viewer-foot">{current.caption && current.caption !== postText ? <p>{current.caption}</p> : null}</div>
      </div>,
      document.body,
    )}
  </>;
}
