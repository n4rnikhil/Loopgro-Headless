"use client";

import { useState } from "react";
/** FUNCTIONALITY */
import { toast } from "sonner";
/** COMPONENTS */
import LoadingButton from "@/components/ui/loadingButton";

interface ButtonCheckoutProps {
  checkoutUrl?: string;
  disabled?: boolean;
}

export const ButtonCheckout = ({ checkoutUrl, disabled }: ButtonCheckoutProps) => {
  const [isPending, setIsPending] = useState(false);

  const handleCheckout = () => {
    if (!checkoutUrl) {
      toast.error("Checkout URL is not available. Please try again.");
      return;
    }

    setIsPending(true);
    window.location.assign(checkoutUrl);
  };

  return (
    <LoadingButton
      onClick={handleCheckout}
      className="w-full rounded-none bg-background-secondary p-2.5 h-full transition-all hover:bg-background-tertiary"
      loading={isPending}
      disabled={disabled || !checkoutUrl}
    >
      Continue
    </LoadingButton>
  );
};
