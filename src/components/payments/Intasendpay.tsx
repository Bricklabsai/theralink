import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    IntaSend?: new (options: IntaSendOptions) => IntaSendInstance;
    setup?: () => void;
  }
}

interface IntaSendOptions {
  publicAPIKey: string;
  live: boolean;
}

interface IntaSendResult {
  status: string;
  reference: string;
  phone_number?: string;
  amount?: number;
  payment_method?: string;
  [key: string]: unknown;
}

interface IntaSendInstance {
  on: (
    event: "COMPLETE" | "FAILED" | "IN-PROGRESS",
    callback: (results: IntaSendResult) => void
  ) => void;
}

interface IntaSendPayProps {
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  onComplete: (res: IntaSendResult) => void;
  onFailed: (res: IntaSendResult) => void;
}

const IntasendPay: React.FC<IntaSendPayProps> = ({
  amount,
  email,
  firstName,
  lastName,
  onComplete,
  onFailed,
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.intasend.com/js/intasend-inline.js";
    script.async = true;

    script.onload = () => {
      if (window.IntaSend) {
        const inta = new window.IntaSend({
           publicAPIKey: import.meta.env.VITE_INTASEND_PUBLISHABLE_KEY,
          live: false,
        });
        
        inta.on("COMPLETE", onComplete);
        inta.on("FAILED", onFailed);
        inta.on("IN-PROGRESS", (results) => {
          console.log("Payment in progress status", results);
        });

        if (buttonRef.current) {
          // Setup after DOM is ready
          window.setup?.();
        }
      } else {
        console.error("IntaSend library did not load properly.");
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [onComplete, onFailed]);

  return (
    <div className="p-4 border rounded-md mt-4">
      <button
        ref={buttonRef}
        className="intaSendPayButton bg-primary text-white px-4 py-2 rounded"
        data-amount={amount}
        data-currency="KES"
        data-email={email}
        data-first_name={firstName}
        data-last_name={lastName}
        data-country="KE"
      >
        Pay Now
      </button>
    </div>
  );
};

export default IntasendPay;