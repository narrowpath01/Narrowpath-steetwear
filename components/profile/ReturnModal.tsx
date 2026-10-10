"use client";

import { useState } from "react";

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export default function ReturnModal({ isOpen, onClose, orderId }: ReturnModalProps) {
  const [returnReason, setReturnReason] = useState("");
  const [returnType, setReturnType] = useState("EXCHANGE");
  const [isDefective, setIsDefective] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(""); 
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Do not render anything if the modal is closed
  if (!isOpen) return null;

  const submitReturnRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReturn(true);
    
    try {
      const res = await fetch("/api/returns/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId, 
          reason: returnReason, 
          type: returnType, 
          isDefective, 
          mediaUrl 
        })
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert("Request submitted successfully for verification.");
        setReturnReason(""); setMediaUrl(""); setIsDefective(false);
        onClose(); // Close the modal on success
      }
    } catch (error) {
      console.error("Failed to submit", error);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-neutral-400 hover:text-black"
        >
          ✕
        </button>
        <h3 className="text-lg font-black uppercase tracking-widest mb-2">Request Return / Exchange</h3>
        <p className="text-[11px] text-neutral-500 mb-4 leading-normal">
          5-Day Easy Exchange / Return for Plain & Printed tees. (Customized merchandise is non-returnable).
        </p>
        <form onSubmit={submitReturnRequest} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Request Type</label>
            <select 
              value={returnType} 
              onChange={(e) => setReturnType(e.target.value)} 
              className="w-full border border-neutral-300 rounded-lg p-3 text-sm focus:border-black outline-none"
            >
              <option value="EXCHANGE">Exchange</option>
              <option value="REFUND">Refund</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Reason for Return</label>
            <textarea 
              required 
              value={returnReason} 
              onChange={(e) => setReturnReason(e.target.value)} 
              className="w-full border border-neutral-300 rounded-lg p-3 text-sm focus:border-black outline-none h-24 resize-none" 
              placeholder="Explain why you are returning this item..." 
            />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="defective" 
              checked={isDefective} 
              onChange={(e) => setIsDefective(e.target.checked)} 
              className="w-4 h-4 text-black border-neutral-300 rounded focus:ring-black"
            />
            <label htmlFor="defective" className="text-sm font-medium">Item arrived defective</label>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Evidence URL (Temp)</label>
            <input 
              required 
              type="url" 
              value={mediaUrl} 
              onChange={(e) => setMediaUrl(e.target.value)} 
              className="w-full border border-neutral-300 rounded-lg p-3 text-sm focus:border-black outline-none" 
              placeholder="Paste link here..." 
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmittingReturn} 
            className="w-full bg-black text-white rounded-full p-3.5 text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isSubmittingReturn ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}