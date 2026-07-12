/** COMPONENTS */
import Image from "next/image";
/** FUNCTIONALITY */
import { cn } from "@/lib/utils";

interface ProductImageProps {
  image: string;
  name: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
  quality?: number;
  unoptimized?: boolean;
  blurDataURL?: string | null;
  className?: string;
}

export const ProductImage = ({
  image,
  name,
  width,
  height,
  priority,
  sizes,
  quality,
  unoptimized,
  blurDataURL,
  className,
}: ProductImageProps) => {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {image ? (
        <Image
          fill
          src={image}
          alt={name}
          priority={priority}
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL ?? undefined}
          quality={quality}
          unoptimized={unoptimized}
          sizes={sizes}
          className={cn("object-cover brightness-90", className)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-xs">
          No Image
        </div>
      )}
    </div>
  );
};
