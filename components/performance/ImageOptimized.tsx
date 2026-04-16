"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * ImageOptimized Component for imobWeb
 * State-of-the-art image loading with blur-to-low-res transition,
 * skeleton placeholders, and optimized metadata.
 */

interface ImageOptimizedProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallbackSrc?: string;
  containerClassName?: string;
  fill?: boolean;
}

export function ImageOptimized({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  fallbackSrc = "/images/property-placeholder.jpg",
  priority = false,
  fill = false,
  ...props
}: ImageOptimizedProps) {
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/20",
        isLoading && "animate-pulse",
        containerClassName
      )}
    >
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={cn(
          "duration-700 ease-in-out",
          isLoading ? "scale-105 blur-lg grayscale" : "scale-100 blur-0 grayscale-0",
          className
        )}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
        priority={priority}
        // Next.js 16/React 19 specialized loading
        loading={priority ? undefined : "lazy"}
        quality={props.quality || 85}
        {...props}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/10 backdrop-blur-sm">
          {/* Otimização visual durante o carregamento */}
        </div>
      )}
    </div>
  );
}
