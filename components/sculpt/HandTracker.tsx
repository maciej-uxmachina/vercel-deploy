"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  onSculptGesture: (x: number, y: number) => void;
  onRotateGesture: (dx: number, dy: number) => void;
  onPinchStart: () => void;
}

const THUMB_TIP = 4, INDEX_TIP = 8;
const FINGER_TIPS = [8, 12, 16, 20];
const FINGER_MCPS = [5, 9, 13, 17];
const PINCH_THRESHOLD = 0.10;

type GestureState = 'none' | 'pinch' | 'open';

interface Landmark { x: number; y: number; z: number; }

function landmarkDist(a: Landmark, b: Landmark) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function isOpenHand(lm: Landmark[]): boolean {
  return FINGER_TIPS.every((tip, i) => lm[tip].y < lm[FINGER_MCPS[i]].y);
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function HandTracker({ onSculptGesture, onRotateGesture, onPinchStart }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [gesture, setGesture] = useState<GestureState>('none');

  const onSculptRef = useRef(onSculptGesture);
  const onRotateRef = useRef(onRotateGesture);
  const onPinchStartRef = useRef(onPinchStart);
  onSculptRef.current = onSculptGesture;
  onRotateRef.current = onRotateGesture;
  onPinchStartRef.current = onPinchStart;

  const prevPalmRef = useRef<{ x: number; y: number } | null>(null);
  const wasPinchingRef = useRef(false);
  const animFrameRef = useRef(0);

  useEffect(() => {
    let active = true;
    let stream: MediaStream | null = null;

    (async () => {
      try {
        // Load hands.js as a global script — it registers window.Hands via Closure exports
        await loadScript("/mediapipe/hands.js");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const HandsClass = (window as any).Hands;
        if (!HandsClass) throw new Error("window.Hands not found after script load");

        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (!videoRef.current || !active) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        if (!active) return;

        const hands = new HandsClass({
          locateFile: (f: string) => `/mediapipe/${f}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results: { multiHandLandmarks?: Landmark[][] }) => {
          if (!active) return;

          if (!results.multiHandLandmarks?.length) {
            wasPinchingRef.current = false;
            prevPalmRef.current = null;
            setGesture('none');
            return;
          }

          const lm = results.multiHandLandmarks[0];
          const pinchDist = landmarkDist(lm[THUMB_TIP], lm[INDEX_TIP]);
          const isPinching = pinchDist < PINCH_THRESHOLD;
          const isOpen = isOpenHand(lm);

          if (isPinching) {
            setGesture('pinch');
            if (!wasPinchingRef.current) {
              onPinchStartRef.current();
            }
            wasPinchingRef.current = true;
            prevPalmRef.current = null;
            const mx = (lm[THUMB_TIP].x + lm[INDEX_TIP].x) / 2;
            const my = (lm[THUMB_TIP].y + lm[INDEX_TIP].y) / 2;
            onSculptRef.current(mx, my);
          } else {
            wasPinchingRef.current = false;
            if (isOpen) {
              setGesture('open');
              const palm = lm[0];
              if (prevPalmRef.current) {
                onRotateRef.current(palm.x - prevPalmRef.current.x, palm.y - prevPalmRef.current.y);
              }
              prevPalmRef.current = { x: palm.x, y: palm.y };
            } else {
              setGesture('none');
              prevPalmRef.current = null;
            }
          }
        });

        async function detect() {
          if (!active || !videoRef.current) return;
          if (videoRef.current.readyState >= 2) {
            try { await hands.send({ image: videoRef.current }); } catch { /* skip frame */ }
          }
          animFrameRef.current = requestAnimationFrame(detect);
        }

        setStatus('ready');
        detect();
      } catch (err) {
        console.error("HandTracker error:", err);
        setStatus('error');
      }
    })();

    return () => {
      active = false;
      cancelAnimationFrame(animFrameRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const gestureLabel =
    gesture === 'pinch' ? '✊ Sculpting' :
    gesture === 'open'  ? '🖐 Rotating'  : '— No gesture';

  const gestureBg =
    gesture === 'pinch' ? 'bg-amber-500/90 text-stone-950' :
    gesture === 'open'  ? 'bg-blue-500/90 text-white'      : 'bg-black/60 text-stone-400';

  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 items-end">
      <div className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${gestureBg}`}>
        {status === 'loading' ? '⏳ Loading model…' :
         status === 'error'   ? '⚠ Camera / model error' : gestureLabel}
      </div>

      <div className="relative rounded-xl overflow-hidden border border-stone-700 shadow-xl" style={{ width: 160, height: 120 }}>
        <video ref={videoRef} muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
        {gesture === 'pinch' && (
          <div className="absolute inset-0 rounded-xl ring-2 ring-amber-400 pointer-events-none" />
        )}
      </div>
    </div>
  );
}
