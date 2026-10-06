import type { Coupon } from "./useCoupons";
import type { Bundle, Currency } from "../utils/currency";

export const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SXh7mCmu8Hs4D2";

const BRAND_COLOR = "#c94a2b";
const LOGO_PATH = "/bitgrainlogo.png";

const BUNDLE_LABELS: Record<Bundle, string> = {
  "pro-license-10yr": "bitgrain pro, 10-year license",
};

export const bundleDescription = (bundle: Bundle, coupon: Coupon | null): string => {
  const base = BUNDLE_LABELS[bundle];
  return coupon ? `${base} (${coupon.code} - ${coupon.discountPercent}% OFF)` : base;
};

interface RazorpayHandle {
  open: () => void;
}

type RazorpayConstructor = new (opts: Record<string, unknown>) => RazorpayHandle;

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_SCRIPT_ID = "razorpay-checkout-script";

let razorpayLoader: Promise<RazorpayConstructor> | null = null;

const loadRazorpayScript = (): Promise<RazorpayConstructor> => {
  if (razorpayLoader) return razorpayLoader;
  razorpayLoader = new Promise<RazorpayConstructor>((resolve, reject) => {
    const existing = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
    if (existing) {
      resolve(existing);
      return;
    }

    const previousTag = document.getElementById(RAZORPAY_SCRIPT_ID) as HTMLScriptElement | null;
    const script = previousTag ?? document.createElement("script");
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;

    const handleLoad = (): void => {
      const ctor = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
      if (ctor) resolve(ctor);
      else reject(new Error("Razorpay failed to initialize"));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener(
      "error",
      () => {
        razorpayLoader = null;
        reject(new Error("Razorpay script failed to load"));
      },
      { once: true },
    );

    if (!previousTag) document.head.appendChild(script);
  });
  return razorpayLoader;
};

export const prefetchRazorpay = (): void => {
  void loadRazorpayScript().catch(() => undefined);
};

// orderId is required: a checkout opened without one is not tied to any payments row, so a
// successful charge can never be matched back to a user or granted a licence.
export interface RazorpayOrderParams {
  keyId: string;
  amount: number;
  currency: Currency;
  description: string;
  orderId: string;
  onPayment: (response: Record<string, string>) => Promise<void>;
}

export const openRazorpayOrder = async (params: RazorpayOrderParams): Promise<void> => {
  const Razorpay = await loadRazorpayScript();
  const options: Record<string, unknown> = {
    key: params.keyId,
    amount: params.amount,
    currency: params.currency,
    name: "bitgrain",
    description: params.description,
    image: LOGO_PATH,
    handler: params.onPayment,
    prefill: { name: "bitgrain user", email: "", contact: "" },
    theme: { color: BRAND_COLOR },
    order_id: params.orderId,
  };
  new Razorpay(options).open();
};
