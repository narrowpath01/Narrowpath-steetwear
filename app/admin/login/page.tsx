"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [authMethod, setAuthMethod] = useState<"password" | "phone">("password");

  // Password State
  const [email, setEmail] = useState("narrowpathtshirts@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Phone OTP State
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Admin Email + Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password: password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Check session status
      const res = await fetch("/api/admin/check-role");
      const check = await res.json();
      if (!check.isAdmin) {
        setError("Access Denied: This account is not granted administrator access.");
        setLoading(false);
        return;
      }

      window.location.href = callbackUrl;
    } catch (err: any) {
      setError(err.message || "Invalid administrator credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Phone OTP
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);

    const clean = phoneNumber.replace(/\D/g, "").slice(-10);
    if (clean.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: clean }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch verification code");

      if (data.message) {
        setInfoMessage(data.message);
      }
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "An error occurred during dispatch.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const clean = phoneNumber.replace(/\D/g, "").slice(-10);

    try {
      const result = await signIn("credentials", {
        contact: clean,
        otp: otp.trim(),
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      const adminCheck = await fetch("/api/admin/check-role");
      const adminData = await adminCheck.json();
      if (!adminData.isAdmin) {
        setError("Access Denied: This phone number does not have administrator clearance.");
        setLoading(false);
        return;
      }

      window.location.href = callbackUrl;
    } catch (err: any) {
      setError(err.message || "Invalid or expired authorization code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-6 sm:p-10 shadow-xl">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white font-black text-lg mb-4 tracking-tighter shadow">
          NP
        </div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-neutral-900">
          Operations Console
        </h1>
        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest font-mono">
          Authorized Personnel Only
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 mb-6 text-xs">
        <button
          type="button"
          onClick={() => {
            setAuthMethod("password");
            setError("");
          }}
          className={`py-2 rounded-lg font-semibold transition ${
            authMethod === "password"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          Email & Password
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMethod("phone");
            setError("");
          }}
          className={`py-2 rounded-lg font-semibold transition ${
            authMethod === "phone"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          WhatsApp OTP
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed font-medium">
          {error}
        </div>
      )}

      {infoMessage && authMethod === "phone" && step === "otp" && (
        <div className="mb-6 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          {infoMessage}
        </div>
      )}

      {authMethod === "password" ? (
        /* EMAIL & PASSWORD LOGIN FORM */
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Administrator Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. narrowpathtshirts@gmail.com"
              className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition font-mono"
              required
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Administrator Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-neutral-500 hover:text-neutral-900 font-medium"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter administrator password..."
              className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition font-mono"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-2.5 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed mt-2 shadow"
          >
            {loading ? "Authenticating..." : "Authorize Access"}
          </button>
        </form>
      ) : (
        /* PHONE OTP LOGIN FORM */
        step === "phone" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                Administrator Mobile Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-medium text-neutral-500">
                  +91
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9894781426"
                  maxLength={10}
                  className="w-full bg-white border border-neutral-300 rounded-lg pl-12 pr-4 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition font-mono"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.replace(/\D/g, "").length !== 10}
              className="w-full py-2.5 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed mt-2 shadow"
            >
              {loading ? "Dispatching..." : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                maxLength={6}
                className="w-full bg-white border border-neutral-300 rounded-lg px-4 py-2.5 text-center text-lg tracking-[0.5em] font-mono text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                required
                autoFocus
              />
              <p className="text-[11px] text-neutral-500 mt-2 text-center">
                Dispatched to +91 {phoneNumber.replace(/\D/g, "").slice(-10)}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.trim().length !== 6}
              className="w-full py-2.5 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed shadow"
            >
              {loading ? "Authenticating..." : "Authorize Access"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
              }}
              className="w-full text-xs text-neutral-600 hover:text-neutral-900 transition py-1 text-center font-medium"
            >
              ← Change Phone Number
            </button>
          </form>
        )
      )}

      {/* Google OAuth Option */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-white px-3 text-neutral-400 font-semibold tracking-wider">
            Or Sign In With
          </span>
        </div>
      </div>

      <button
        onClick={() => signIn("google", { callbackUrl: "/admin" })}
        className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2.5 shadow-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z"
          />
        </svg>
        <span>Google Administrator Account</span>
      </button>

      <div className="mt-8 pt-6 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500">
        <Link href="/" className="hover:text-neutral-900 transition font-medium">
          ← Return to Store
        </Link>
        <span className="font-mono text-neutral-400">Security Clearance</span>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-neutral-900 flex items-center justify-center p-4 sm:p-6 antialiased selection:bg-neutral-200">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 text-center text-xs text-neutral-500">
            Initializing security clearance...
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
