"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderName = searchParams.get("order") || "#0000";

  useEffect(() => {
    document.title = "Order Confirmed | Loopgro Store";
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center rounded-2xl border border-solid border-border-primary bg-background-secondary/40 p-8 md:p-12 backdrop-blur-md shadow-2xl">
        <div className="rounded-full bg-[#1a3a22] p-4 text-[#4ade80] mb-6 animate-bounce">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight uppercase mb-2">
          Order Confirmed!
        </h1>
        <p className="text-color-secondary text-sm mb-6">
          Thank you for your purchase. Your payment was processed successfully.
        </p>

        <div className="w-full rounded-lg bg-background-primary border border-border-primary p-4 mb-8">
          <span className="block text-xs font-semibold text-color-secondary uppercase tracking-widest mb-1">
            Order Reference
          </span>
          <span className="text-lg font-bold text-white tracking-wider">
            {orderName}
          </span>
        </div>

        <p className="text-xs text-color-secondary leading-relaxed mb-8">
          A confirmation email will be sent to you shortly. If you have any questions, please contact our support.
        </p>

        <button
          onClick={() => router.push("/")}
          className="w-full rounded-xl bg-white hover:bg-gray-200 text-black py-4 font-bold uppercase text-xs tracking-widest transition-all shadow-md"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-height-[60vh] w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
