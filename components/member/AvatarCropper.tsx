"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus } from "lucide-react";

const VIEW = 280;
const OUTPUT = 512;
const MAX_ZOOM = 4;

type Point = { x: number; y: number };

export default function AvatarCropper({ file, onCancel, onConfirm }: { file: File; onCancel: () => void; onConfirm: (blob: Blob) => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pointers = useRef(new Map<number, Point>());
  const pinchDistance = useRef(0);
  const [src, setSrc] = useState("");
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const reader = new FileReader();
    reader.onload = () => { if (!cancelled) setSrc(String(reader.result)); };
    reader.onerror = () => { if (!cancelled) setFailed(true); };
    reader.readAsDataURL(file);
    return () => { cancelled = true; };
  }, [file]);

  const base = natural ? VIEW / Math.min(natural.w, natural.h) : 1;
  const scale = base * zoom;

  // Mantém a imagem sempre cobrindo todo o círculo.
  const clamp = useCallback(
    (point: Point, nextZoom: number): Point => {
      if (!natural) return point;
      const s = base * nextZoom;
      const maxX = Math.max(0, (natural.w * s - VIEW) / 2);
      const maxY = Math.max(0, (natural.h * s - VIEW) / 2);
      return { x: Math.min(maxX, Math.max(-maxX, point.x)), y: Math.min(maxY, Math.max(-maxY, point.y)) };
    },
    [natural, base],
  );

  const changeZoom = useCallback(
    (next: number) => {
      const value = Math.min(MAX_ZOOM, Math.max(1, next));
      setZoom(value);
      setOffset((current) => clamp(current, value));
    },
    [clamp],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onCancel]);

  // Listener nativo (não passivo) para o zoom com a roda do mouse não rolar a página.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      changeZoom(zoom * Math.exp(-event.deltaY * 0.0015));
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [changeZoom, zoom]);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchDistance.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const current = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, current);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDistance.current > 0) changeZoom(zoom * (distance / pinchDistance.current));
      pinchDistance.current = distance;
      return;
    }

    setOffset((value) => clamp({ x: value.x + current.x - previous.x, y: value.y + current.y - previous.y }, zoom));
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    pinchDistance.current = 0;
  }

  function onStageKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step = 12;
    const moves: Record<string, Point> = {
      ArrowLeft: { x: step, y: 0 },
      ArrowRight: { x: -step, y: 0 },
      ArrowUp: { x: 0, y: step },
      ArrowDown: { x: 0, y: -step },
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      setOffset((value) => clamp({ x: value.x + move.x, y: value.y + move.y }, zoom));
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      changeZoom(zoom * 1.1);
    } else if (event.key === "-") {
      event.preventDefault();
      changeZoom(zoom / 1.1);
    }
  }

  function confirm() {
    const image = imageRef.current;
    if (!image || !natural) return;
    setSaving(true);
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const context = canvas.getContext("2d");
    if (!context) {
      setSaving(false);
      return;
    }
    const sourceSize = VIEW / scale;
    const sourceX = natural.w / 2 + (-VIEW / 2 - offset.x) / scale;
    const sourceY = natural.h / 2 + (-VIEW / 2 - offset.y) / scale;
    context.fillStyle = "#000";
    context.fillRect(0, 0, OUTPUT, OUTPUT);
    context.imageSmoothingQuality = "high";
    context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, OUTPUT, OUTPUT);
    canvas.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
        else setSaving(false);
      },
      "image/jpeg",
      0.92,
    );
  }

  return createPortal(
    <div className="avatar-cropper-backdrop" role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget && !saving) onCancel(); }}>
      <div className="avatar-cropper" role="dialog" aria-modal="true" aria-label="Ajustar foto de perfil">
        <h2>Ajustar foto</h2>
        <div
          ref={stageRef}
          className="avatar-cropper-stage"
          style={{ width: VIEW, height: VIEW }}
          tabIndex={0}
          aria-label="Área de enquadramento da foto. Use as setas para mover e + ou - para o zoom."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onKeyDown={onStageKey}
        >
          {failed ? (
            <span className="avatar-cropper-error">Não foi possível abrir esta imagem.</span>
          ) : (
            src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imageRef}
                src={src}
                alt=""
                draggable={false}
                onLoad={(event) => setNatural({ w: event.currentTarget.naturalWidth, h: event.currentTarget.naturalHeight })}
                onError={() => setFailed(true)}
                style={natural ? { width: natural.w, height: natural.h, transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})` } : { visibility: "hidden" }}
              />
            )
          )}
          <div className="avatar-cropper-mask" aria-hidden="true" />
        </div>
        <div className="avatar-cropper-zoom">
          <button type="button" aria-label="Diminuir zoom" onClick={() => changeZoom(zoom / 1.2)} disabled={zoom <= 1}><Minus size={16} /></button>
          <input type="range" min={1} max={MAX_ZOOM} step={0.01} value={zoom} aria-label="Zoom" onChange={(event) => changeZoom(Number(event.target.value))} />
          <button type="button" aria-label="Aumentar zoom" onClick={() => changeZoom(zoom * 1.2)} disabled={zoom >= MAX_ZOOM}><Plus size={16} /></button>
        </div>
        <div className="avatar-cropper-actions">
          <button type="button" className="avatar-cropper-cancel" onClick={onCancel} disabled={saving}>Cancelar</button>
          <button type="button" className="avatar-cropper-save" onClick={confirm} disabled={saving || !natural || failed}>{saving ? "Salvando…" : "Salvar"}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
