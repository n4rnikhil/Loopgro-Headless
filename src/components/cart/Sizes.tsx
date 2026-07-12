"use client";

/** FUNCTIONALITY */
import { cn } from "@/lib/utils";
import { useImperativeHandle, useState, forwardRef, Ref } from "react";

export type SizesRef = {
  selectedSize: string;
};

interface SizesProps {
  productSizes: string[];
  compact?: boolean;
}

export const Sizes = forwardRef(
  ({ productSizes, compact = false }: SizesProps, ref: Ref<SizesRef>) => {
    const [selectedSize, setSelectedSize] = useState<string>(
      productSizes[0] || "Default"
    );

    useImperativeHandle(ref, () => ({
      selectedSize,
    }));

    const handleSizeClick = (size: string) => {
      setSelectedSize(size);
    };

    return (
      <div
        className={cn("grid gap-2", {
          "grid-cols-4 gap-2.5 justify-center": !compact,
          "flex flex-wrap gap-2": compact,
        })}
      >
        {productSizes.map((size) => {
          return (
            <button
              key={size}
              type="button"
              className={cn(
                "flex items-center justify-center border border-solid border-border-primary bg-background-primary rounded transition-colors hover:border-border-secondary",
                {
                  "bg-white text-black": selectedSize === size,
                  "px-1 py-1.5 text-xs": !compact,
                  "min-w-[3rem] px-2.5 py-1.5 text-[10px]": compact,
                },
              )}
              onClick={() => handleSizeClick(size)}
            >
              <span>{size}</span>
            </button>
          );
        })}
      </div>
    );
  },
);

Sizes.displayName = "Sizes";
