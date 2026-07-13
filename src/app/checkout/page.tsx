"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCartDetails, getLocalCartId, clearLocalCartId } from "@/hooks/cart";
import { submitCheckoutAction } from "@/app/actions";
import LoadingButton from "@/components/ui/loadingButton";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { items, totalPrice, isLoading, refetch } = useCartDetails();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("United States");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");

  // Mock Payment states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex min-height-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <h1 className="text-3xl font-bold tracking-wider">YOUR CART IS EMPTY</h1>
        <p className="text-color-secondary text-sm">Add some products to your cart before checking out.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-6 py-3 border border-white hover:bg-white hover:text-black transition-all font-semibold uppercase text-xs tracking-widest"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !firstName || !lastName || !address1 || !city || !zip) {
      toast.error("Please fill in all required shipping details.");
      return;
    }

    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      toast.error("Please fill in all credit card details.");
      return;
    }

    const cartId = getLocalCartId();
    if (!cartId) {
      toast.error("Cart not found. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitCheckoutAction(cartId, {
        email,
        firstName,
        lastName,
        address1,
        city,
        province,
        country,
        zip,
        phone,
      });

      if (result.success && result.orderName) {
        toast.success("Order placed successfully!");
        clearLocalCartId();
        // Reset query cache
        queryClient.setQueryData(["shopify-cart"], {
          id: "",
          checkoutUrl: "",
          totalPrice: 0,
          totalQuantity: 0,
          items: [],
        });
        queryClient.invalidateQueries({ queryKey: ["shopify-cart"] });
        
        router.push(`/checkout/success?order=${encodeURIComponent(result.orderName)}`);
      } else {
        toast.error(result.error || "Failed to process order. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight uppercase">Checkout</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Side - Forms */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
          {/* Shipping Address */}
          <div className="rounded-xl border border-solid border-border-primary bg-background-secondary/40 p-6 md:p-8 backdrop-blur-md">
            <h2 className="mb-6 text-xl font-bold tracking-wide uppercase border-b border-border-primary pb-3">
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  required
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  placeholder="123 Main St"
                  className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Los Angeles"
                  className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">
                  State / Province
                </label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="California"
                  className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United States"
                  className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">
                  Postal / ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="90001"
                  className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Method (Mock Simulator) */}
          <div className="rounded-xl border border-solid border-border-primary bg-background-secondary/40 p-6 md:p-8 backdrop-blur-md">
            <div className="mb-6 border-b border-border-primary pb-3 flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-wide uppercase">
                Payment Method
              </h2>
              <span className="rounded bg-[#1a3a22] text-[#4ade80] px-2 py-0.5 text-xxs font-extrabold uppercase tracking-widest">
                Mock Sandbox
              </span>
            </div>

            <p className="mb-6 text-xs text-color-secondary">
              This is a sandbox checkout simulation. You can use any test details (e.g. Card: 4242 4242 4242 4242).
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="md:col-span-3">
                <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">
                  Cardholder Name *
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white"
                />
              </div>

              <div className="md:col-span-3">
                <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">
                  Card Number *
                </label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => {
                    const formattedVal = e.target.value
                      .replace(/\s?/g, "")
                      .replace(/(\d{4})/g, "$1 ")
                      .trim();
                    setCardNumber(formattedVal);
                  }}
                  placeholder="4242 4242 4242 4242"
                  className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">
                  Expiration Date (MM/YY) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.length > 2) {
                      val = val.substring(0, 2) + "/" + val.substring(2, 4);
                    }
                    setCardExpiry(val);
                  }}
                  placeholder="12/28"
                  className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">
                  CVV *
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                  placeholder="123"
                  className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white"
                />
              </div>
            </div>
          </div>

          <LoadingButton
            type="submit"
            loading={isSubmitting}
            className="w-full rounded-xl bg-white hover:bg-gray-200 text-black py-4 font-bold uppercase text-sm tracking-widest transition-all shadow-lg"
          >
            Place Order • {totalPrice.toFixed(2)} EUR
          </LoadingButton>
        </form>

        {/* Right Side - Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-xl border border-solid border-border-primary bg-background-secondary/20 p-6 md:p-8 backdrop-blur-md">
            <h2 className="mb-6 text-xl font-bold tracking-wide uppercase border-b border-border-primary pb-3">
              Order Summary
            </h2>

            <div className="divide-y divide-border-primary overflow-y-auto max-h-[350px] pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex py-4 first:pt-0 last:pb-0 items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border-primary bg-background-secondary">
                      {item.variant.img ? (
                        <Image
                          src={item.variant.img}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-neutral-800" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold leading-snug line-clamp-1">{item.product.name}</h3>
                      <p className="text-xs text-color-secondary mt-0.5">
                        {item.variant.title !== "Default Title" ? item.variant.title : ""}
                      </p>
                      <p className="text-xs text-color-secondary mt-0.5">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{item.variant.price * item.quantity} EUR</span>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4 border-t border-border-primary pt-6 text-sm">
              <div className="flex justify-between text-color-secondary">
                <span>Subtotal</span>
                <span>{totalPrice.toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between text-color-secondary">
                <span>Shipping</span>
                <span className="text-[#4ade80] uppercase font-bold text-xs tracking-widest">Free</span>
              </div>
              <div className="flex justify-between text-color-secondary">
                <span>Estimated Tax</span>
                <span>0.00 EUR</span>
              </div>
              <div className="flex justify-between border-t border-border-primary pt-4 text-base font-bold text-white uppercase">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)} EUR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
