"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCartDetails, getLocalCartId, clearLocalCartId } from "@/hooks/cart";
import { createPaymentIntentAction, createShopifyOrderAction } from "@/app/actions";
import LoadingButton from "@/components/ui/loadingButton";
import Image from "next/image";

// Stripe Imports
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe Promise
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#ffffff",
      fontFamily: '"Geist Sans", sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "15px",
      "::placeholder": {
        color: "#6b7280",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
};

type CheckoutStep = "address" | "payment";

function CheckoutForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const stripe = useStripe();
  const elements = useElements();
  const { items, totalPrice, isLoading, refetch } = useCartDetails();

  const [step, setStep] = useState<CheckoutStep>("address");
  const [currentTotalPrice, setCurrentTotalPrice] = useState<number>(0);
  
  // Loader states
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Address Form States
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("United States");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");

  // Sync Cart
  useEffect(() => {
    refetch();
    document.title = "Checkout | Loopgro Store";
  }, [refetch]);

  useEffect(() => {
    if (totalPrice) {
      setCurrentTotalPrice(totalPrice);
    }
  }, [totalPrice]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <h1 className="text-3xl font-bold tracking-wider">YOUR CART IS EMPTY</h1>
        <p className="text-color-secondary text-sm">Add products to your cart before checking out.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 px-6 py-3 border border-white hover:bg-white hover:text-black transition-all font-semibold uppercase text-xs tracking-widest"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // Handle Address Step Submit
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName || !address1 || !city || !zip) {
      toast.error("Please fill in all required shipping fields.");
      return;
    }
    setStep("payment");
  };

  // Confirm Payment & Create Order
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      toast.error("Stripe Checkout has not initialized yet.");
      return;
    }

    setIsSubmittingPayment(true);

    try {
      // 1. Get PaymentIntent secret from server action
      const intentRes = await createPaymentIntentAction(currentTotalPrice);
      if (intentRes.error || !intentRes.clientSecret) {
        throw new Error(intentRes.error || "Failed to initiate Stripe payment intent.");
      }

      // 2. Extract Card Element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Credit card input not found on the page.");
      }

      // 3. Confirm card payment with Stripe client SDK
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intentRes.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${firstName} ${lastName}`,
              email: email,
              address: {
                line1: address1,
                city: city,
                state: province,
                postal_code: zip,
                country: "US",
              },
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || "Stripe authorization failed.");
      }

      if (paymentIntent?.status !== "succeeded") {
        throw new Error("Payment was not approved. Please try again.");
      }

      // 4. Create Order in Shopify Admin since payment succeeded!
      const cartId = getLocalCartId();
      if (!cartId) {
        throw new Error("Cart not found.");
      }

      const orderResult = await createShopifyOrderAction(cartId, {
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

      if (orderResult.success && orderResult.orderName) {
        toast.success("Payment succeeded! Order placed.");
        clearLocalCartId();
        queryClient.setQueryData(["shopify-cart"], {
          id: "",
          checkoutUrl: "",
          totalPrice: 0,
          totalQuantity: 0,
          items: [],
        });
        queryClient.invalidateQueries({ queryKey: ["shopify-cart"] });
        router.push(`/checkout/success?order=${encodeURIComponent(orderResult.orderName)}`);
      } else {
        throw new Error(orderResult.error || "Payment was processed, but order creation failed.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred during payment completion.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Checkout Progress Steps */}
      <div className="mb-12 border-b border-border-primary pb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight uppercase">Checkout</h1>
        <div className="flex items-center gap-4 text-xs font-bold tracking-widest uppercase text-color-secondary">
          <span className={step === "address" ? "text-white" : ""}>1. Address</span>
          <span className="text-neutral-600">/</span>
          <span className={step === "payment" ? "text-white" : ""}>2. Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Side: Step Forms */}
        <div className="lg:col-span-7">
          {step === "address" && (
            <form onSubmit={handleAddressSubmit} className="space-y-6">
              <div className="rounded-xl border border-solid border-border-primary bg-background-secondary/40 p-6 md:p-8 backdrop-blur-md">
                <h2 className="mb-6 text-xl font-bold tracking-wide uppercase">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">Email Address *</label>
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
                    <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">First Name *</label>
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
                    <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">Last Name *</label>
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
                    <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">Address Line 1 *</label>
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
                    <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">City *</label>
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
                    <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">State / Province</label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="California"
                      className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">Country *</label>
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
                    <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">Postal / ZIP Code *</label>
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
                    <label className="mb-2 block text-xs font-semibold text-color-secondary uppercase tracking-widest">Phone Number</label>
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
              <LoadingButton
                type="submit"
                loading={false}
                className="w-full rounded-xl bg-white hover:bg-gray-200 text-black py-4 font-bold uppercase text-sm tracking-widest transition-all"
              >
                Continue to Payment
              </LoadingButton>
            </form>
          )}

          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="rounded-xl border border-solid border-border-primary bg-background-secondary/40 p-6 md:p-8 backdrop-blur-md">
                <div className="mb-6 border-b border-border-primary pb-3 flex justify-between items-center">
                  <h2 className="text-xl font-bold tracking-wide uppercase">Payment</h2>
                  <span className="rounded bg-[#0a2540] text-[#635bff] px-2 py-0.5 text-xxs font-extrabold uppercase tracking-widest">Stripe Secure</span>
                </div>
                
                <div className="space-y-4">
                  <label className="block text-xs font-semibold text-color-secondary uppercase tracking-widest">Credit or Debit Card *</label>
                  <div className="w-full rounded-lg border border-solid border-border-primary bg-background-primary px-4 py-4 transition-colors focus-within:border-white">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                  <p className="text-xxs text-color-secondary">
                    Your payment information is tokenized and processed securely by Stripe. We do not store your credit card details.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep("address")}
                  className="w-1/3 rounded-xl border border-border-primary hover:border-white text-white py-4 font-bold uppercase text-xs tracking-widest transition-all"
                >
                  Back
                </button>
                <LoadingButton
                  type="submit"
                  loading={isSubmittingPayment}
                  className="w-2/3 rounded-xl bg-white hover:bg-gray-200 text-black py-4 font-bold uppercase text-sm tracking-widest transition-all shadow-lg"
                >
                  Pay & Place Order • {currentTotalPrice.toFixed(2)} EUR
                </LoadingButton>
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-xl border border-solid border-border-primary bg-background-secondary/20 p-6 md:p-8 backdrop-blur-md">
            <h2 className="mb-6 text-xl font-bold tracking-wide uppercase border-b border-border-primary pb-3">Order Summary</h2>
            <div className="divide-y divide-border-primary overflow-y-auto max-h-[350px] pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex py-4 first:pt-0 last:pb-0 items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border-primary bg-background-secondary">
                      {item.variant.img ? (
                        <Image src={item.variant.img} alt={item.product.name} fill className="object-cover" />
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
                <span>{currentTotalPrice.toFixed(2)} EUR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  if (!stripePromise) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-500 uppercase tracking-widest mb-4">Stripe Not Configured</h1>
        <p className="text-sm text-color-secondary max-w-md mx-auto mb-6">
          Please add your Stripe publishable key to the environment variables file to enable credit card payments:
        </p>
        <div className="bg-background-secondary border border-border-primary rounded-xl p-5 font-mono text-xs max-w-lg mx-auto text-left">
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_key_here"<br />
          STRIPE_SECRET_KEY="sk_test_your_key_here"
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
