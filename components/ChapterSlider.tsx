"use client";

import { useEffect, useRef, useState } from "react";

type Slide =
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "video";
      src: string;
      caption?: string;
    };

function SlideRenderer({
  slide,
  isActive,
}: {
  slide: Slide;
  isActive: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (slide.type !== "video") return;

    const video = videoRef.current;
    if (!video) return;

    const shouldPlay = isActive && !isPaused;

    if (shouldPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [isActive, isPaused, slide.type, slide.src]);

  useEffect(() => {
    if (!isActive) {
      setIsPaused(false);
    }
  }, [isActive]);

  if (slide.type === "image") {
    return (
      <div className="w-full flex flex-col items-center gap-3">
        <div className="w-full flex items-center justify-center overflow-hidden bg-white md:rounded-2xl">
          <img
            src={slide.src}
            alt={slide.alt}
            className="w-full max-h-[70vh] md:max-h-[62vh] object-contain select-none"
            draggable={false}
            loading="lazy"
          />
        </div>

        {slide.caption && (
          <p className="px-4 text-center text-sm text-black/60">
            {slide.caption}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div
        className="relative w-full flex items-center justify-center overflow-hidden bg-transparent md:rounded-2xl"
        onClick={() => setIsPaused((prev) => !prev)}
      >
        <video
          ref={videoRef}
          src={slide.src}
          muted
          playsInline
          loop
          preload={isActive ? "auto" : "metadata"}
          className="w-full max-h-[70vh] md:max-h-[62vh] object-contain bg-transparent"
        />

        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/50 px-4 py-3 text-lg text-white">
              ▶
            </div>
          </div>
        )}
      </div>

      {slide.caption && (
        <p className="px-4 text-center text-sm text-black/60">
          {slide.caption}
        </p>
      )}
    </div>
  );
}

type ChapterSliderProps = {
  title: string;
  slides: Slide[];
};

export default function ChapterSlider({
  title,
  slides,
}: ChapterSliderProps) {
  const [index, setIndex] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const hasPrev = index > 0;
  const hasNext = index < slides.length - 1;

  const goPrev = () => {
    if (hasPrev) setIndex((prev) => prev - 1);
  };

  const goNext = () => {
    if (hasNext) setIndex((prev) => prev + 1);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startX === null) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;

    if ((!hasPrev && diff > 0) || (!hasNext && diff < 0)) {
      setDragX(diff * 0.55);
      return;
    }

    setDragX(diff);
  };

  const handleTouchEnd = () => {
    const threshold = 60;

    if (dragX < -threshold && hasNext) {
      setIndex((prev) => prev + 1);
    } else if (dragX > threshold && hasPrev) {
      setIndex((prev) => prev - 1);
    }

    setDragX(0);
    setStartX(null);
    setIsDragging(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasPrev, hasNext]);

  const trackStyle = {
    transform: `translateX(calc(${-index * 100}% + ${dragX}px))`,
    transition: isDragging
      ? "none"
      : "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return (
    <section className="bg-white text-black">
      <div className="px-4 pb-4 md:px-6">
        <div className="mb-3 flex items-center justify-between text-sm text-black/55">
          <span>{title}</span>
          <span>
            {index + 1} / {slides.length}
          </span>
        </div>

        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full bg-black transition-all"
            style={{ width: `${((index + 1) / slides.length) * 100}%` }}
          />
        </div>

        <div
          className="relative overflow-hidden touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {hasPrev && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black transition hover:bg-black/5 md:flex"
              aria-label="Image précédente"
            >
              ←
            </button>
          )}

          {hasNext && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black transition hover:bg-black/5 md:flex"
              aria-label="Image suivante"
            >
              →
            </button>
          )}

          <div className="flex w-full" style={trackStyle}>
            {slides.map((slide, i) => (
              <div
                key={i}
                className="flex w-full shrink-0 items-start justify-center"
              >
                <SlideRenderer slide={slide} isActive={i === index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}