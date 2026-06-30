// app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Trigger your backend API to send Twilio/Email OTP here
    setStep("otp");
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Trigger NextAuth signIn('credentials', { contact, otp }) here
  };

  return (
    <main className="min-h-screen w-full bg-gray-50 text-black flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md flex flex-col items-center border border-neutral-200 rounded-3xl p-10 shadow-lg bg-white">
        
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
          NARROW PATH
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-8 text-center">
          {step === "phone" ? "Access the Underground" : `Enter code sent to ${contact}`}
        </p>

        {step === "phone" ? (
          <div className="w-full w-full">
            {/* Google OAuth Trigger - Standard Corporate Branding */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full bg-white text-[#3c4043] border border-[#dadce0] py-3 rounded-full font-medium text-sm hover:bg-[#f8f9fa] transition-colors mb-6 flex items-center justify-center gap-3 shadow-sm"
            >
              {/* Official Multi-colored Google G Logo */}
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center w-full mb-6">
              <div className="flex-1 border-t border-neutral-200"></div>
              <span className="px-3 text-neutral-400 text-xs font-bold uppercase tracking-widest">Or</span>
              <div className="flex-1 border-t border-neutral-200"></div>
            </div>

            {/* Phone / Email Form */}
            <form onSubmit={handleSendCode} className="flex flex-col gap-4 w-full">
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email or Phone Number"
                className="w-full border-2 border-neutral-200 rounded-md p-3 text-sm focus:outline-none focus:border-black transition-colors"
              />
              <button 
                type="submit" 
                className="w-full bg-black text-white font-bold uppercase tracking-widest text-sm py-3 rounded-full hover:bg-neutral-800 transition-colors mt-2"
              >
                Send Code
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-4 w-full">
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              className="w-full border-2 border-neutral-200 rounded-md p-3 text-2xl tracking-[1em] text-center focus:outline-none focus:border-black transition-colors"
            />
            <button 
              type="submit" 
              className="w-full bg-black text-white font-bold uppercase tracking-widest text-sm py-3 rounded-full hover:bg-neutral-800 transition-colors mt-2"
            >
              Verify & Sign In
            </button>
            <button 
              type="button" 
              onClick={() => setStep("phone")} 
              className="text-xs text-neutral-500 uppercase font-bold hover:text-black mt-2 underline underline-offset-4"
            >
              Back
            </button>
          </form>
        )}

        <Link href="/" className="text-xs uppercase font-bold text-neutral-400 hover:text-black underline underline-offset-4 mt-8">
          Return to Store
        </Link>
        
      </div>
    </main>
  );
}