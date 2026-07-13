"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
/** COMPONENTS */
import LoadingButton from "@/components/ui/loadingButton";

interface ButtonCheckoutProps {
  checkoutUrl?: string;
  disabled?: boolean;
}

export const ButtonCheckout = ({ checkoutUrl, disabled }: ButtonCheckoutProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleCheckout = () => {
    setIsPending(true);
    router.push("/checkout");
  };

  return (
    <LoadingButton
      onClick={handleCheckout}
      className="w-full rounded-none bg-background-secondary p-2.5 h-full transition-all hover:bg-background-tertiary"
      loading={isPending}
      disabled={disabled}
    >
      Continue
    </LoadingButton>
  );
};
