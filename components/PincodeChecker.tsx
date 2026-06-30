"use client";

import { useState } from "react";

export default function PincodeChecker() {
  const [pinCode, setPinCode] = useState("");
  const [checkingPin, setCheckingPin] = useState(false);
  const [isPinServiceable, setIsPinServiceable] = useState<boolean | null>(null);

  const verifyPin = async (pin: string) => {
    if (pin.length === 6 && !isNaN(Number(pin))) {
      setCheckingPin(true);
      try {
        const res = await fetch(`/api/shipping/serviceability?pin=${pin}`);
        const data = await res.json();
        setIsPinServiceable(!!data.serviceable);
      } catch {
        setIsPinServiceable(false);
      } finally {
        setCheckingPin(false);
      }
    } else {
      setIsPinServiceable(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPinCode(val);
    
    // Automatically verify when they hit 6 digits
    if (val.length === 6) {
      verifyPin(val);
    } else {
      setIsPinServiceable(null);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-neutral-200 text-black mt-8">
      <label className="text-gray-500 text-sm block mb-3 font-bold tracking-wide uppercase">
        Check Delivery Availability
      </label>
      <div className="flex flex-col gap-2">
        <input 
          type="text"
          maxLength={6}
          value={pinCode} 
          onChange={handleChange} 
          placeholder="Enter 6-digit PIN Code" 
          className="border border-neutral-300 bg-white text-black placeholder-neutral-400 rounded-lg p-3 text-sm focus:outline-none focus:border-black w-full transition-colors" 
        />

        {checkingPin && (
          <span className="text-xs text-neutral-500 animate-pulse uppercase tracking-wider font-bold mt-1">
            Verifying pincode...
          </span>
        )}
        
        {isPinServiceable === false && !checkingPin && (
          <span className="text-xs text-red-500 font-bold uppercase tracking-wider mt-1">
            Delhivery does not service this region
          </span>
        )}
        
        {isPinServiceable === true && !checkingPin && (
          <span className="text-xs text-green-600 font-bold uppercase tracking-wider mt-1">
            Delivery available to this region!
          </span>
        )}
      </div>
    </div>
  );
}