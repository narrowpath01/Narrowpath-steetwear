"use client";

import React, { useState } from "react";

import { Order, ReturnRequest } from "./types";

interface ReturnRequestDrawerProps {
  order: Order;
  isOpen: boolean;
  onReturnSubmitted: (updatedOrder: Order) => void;
}

export default function ReturnRequestDrawer({ order, isOpen, onReturnSubmitted }: ReturnRequestDrawerProps) {
  const [returnType, setReturnType] = useState<"EXCHANGE" | "REFUND">("EXCHANGE");
  const [returnReason, setReturnReason] = useState(
    order.status !== "DELIVERED" ? "Cancel order / Request Refund" : "Size doesn't fit"
  );
  const [detailedReason, setDetailedReason] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isDefective, setIsDefective] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  if (!isOpen) return null;

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();

    const isDelivered = order.status === "DELIVERED";
    if (isDelivered && !mediaUrl) {
      alert("Please provide a photo or video evidence link (e.g. S3, UploadThing or Imgur link) to verify your claim.");
      return;
    }

    setSubmittingReturn(true);

    try {
      const fullReason = `${returnReason}${detailedReason ? `: ${detailedReason}` : ""}`;
      const res = await fetch("/api/returns/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          reason: fullReason,
          type: returnType,
          isDefective,
          mediaUrl: mediaUrl || "N/A",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Return/Exchange request submitted successfully!");
        
        // Trigger the callback with updated order structure
        const updatedRequest: ReturnRequest = {
          id: data.returnId || "temp",
          reason: fullReason,
          type: returnType,
          isDefective,
          mediaUrl,
          status: "PENDING_REVIEW",
        };

        onReturnSubmitted({
          ...order,
          returnRequest: updatedRequest,
        });

      } else {
        alert(data.error || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  const retReq = order.returnRequest;

  const isCustomItem = (item: any) => {
    const prod = item.variant?.product;
    return (
      prod?.collection?.toUpperCase() === "CUSTOM" ||
      prod?.handle?.toLowerCase().startsWith("custom") ||
      prod?.title?.toLowerCase().includes("custom") ||
      item.variant?.title?.toLowerCase().includes("custom")
    );
  };

  const isAllCustom = Boolean(order.items && order.items.length > 0 && order.items.every(isCustomItem));
  const hasSomeCustom = Boolean(order.items && order.items.some(isCustomItem));

  return (
    <div className="border-t border-neutral-200 bg-neutral-50/70 p-4 sm:p-6 transition-all duration-300">
      {retReq ? (
        /* SHOW EXISTING RETURN REQUEST */
        <div>
          <div className="flex justify-between items-center border-b border-neutral-200 pb-3 mb-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">Return / Exchange Details</h4>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider text-[10px] ${
                order.status === "REFUNDED"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : retReq.status === "APPROVED"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : retReq.status === "REJECTED"
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-orange-100 text-orange-700 border border-orange-200"
              }`}
            >
              {order.status === "REFUNDED"
                ? "REFUND INITIATED"
                : retReq.status === "REJECTED"
                ? "ORDER CANCELLED"
                : retReq.status.replace("_", " ")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-neutral-400 uppercase font-bold tracking-wider block mb-1">Request Type</span>
              <span className="font-extrabold uppercase text-neutral-800 bg-neutral-200/50 px-2 py-0.5 rounded">
                {retReq.type}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 uppercase font-bold tracking-wider block mb-1">Reason for Claim</span>
              <span className="font-bold text-neutral-800">{retReq.reason}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-neutral-400 uppercase font-bold tracking-wider block mb-1">Supportive Evidence</span>
              {retReq.mediaUrl && retReq.mediaUrl !== "N/A" && retReq.mediaUrl.trim() !== "" ? (
                <a
                  href={retReq.mediaUrl.startsWith("http") ? retReq.mediaUrl : `https://${retReq.mediaUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-extrabold text-neutral-800 hover:text-black underline flex items-center gap-1.5 w-fit"
                >
                  <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                  </svg>
                  View Photo/Video Attachment
                </a>
              ) : (
                <span className="text-neutral-500 font-bold">No attachment provided</span>
              )}
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-4 mt-6 text-xs leading-relaxed text-neutral-600">
            {order.status === "REFUNDED" && (
              <p className="text-blue-800 font-bold">
                ✓ Refund has been successfully initiated. The amount will be credited back to your account according to your bank's policies.
              </p>
            )}
            {order.status !== "REFUNDED" && retReq.status === "PENDING_REVIEW" && (
              <p>
                Our verification team is reviewing your claim and unboxing evidence. We enforce a strict quality check. If approved, we will manifest a return pickup from your registered address via Delhivery.
              </p>
            )}
            {order.status !== "REFUNDED" && retReq.status === "APPROVED" && (
              <p className="text-green-800 font-bold">
                ✓ Your request has been approved. A return pickup is being scheduled. We will process your exchange/refund once the item reaches our Delhi warehouse.
              </p>
            )}
            {order.status !== "REFUNDED" && retReq.status === "REJECTED" && (
              <p className="text-red-800 font-bold">
                ✕ Your claim request was declined by the administrator. The order return has been cancelled.
              </p>
            )}
          </div>
        </div>
      ) : isAllCustom ? (
        /* ALL ITEMS CUSTOM - NO RETURN ALLOWED */
        <div className="border border-amber-300 bg-amber-50 rounded-2xl p-6 text-center space-y-3">
          <div className="w-10 h-10 bg-amber-150 rounded-full flex items-center justify-center mx-auto text-amber-800 text-xl font-bold">
            ⚠️
          </div>
          <h4 className="text-xs font-black uppercase tracking-widest text-amber-900">
            Return / Exchange Unavailable (Custom Order)
          </h4>
          <p className="text-xs text-amber-950 font-medium leading-relaxed max-w-md mx-auto">
            This order consists of personalized custom merchandise made uniquely to your specifications (custom size, artwork, and prints). Per Narrow Path store policy, customized apparel is <strong>strictly non-returnable and non-exchangeable</strong>.
          </p>
          <div className="pt-1">
            <a
              href="https://wa.me/918796621740?text=Hi! I have a question regarding my custom order"
              target="_blank"
              rel="noreferrer"
              className="inline-block text-[11px] font-bold uppercase text-amber-900 underline hover:text-black"
            >
              Contact Support on WhatsApp
            </a>
          </div>
        </div>
      ) : order.status !== "DELIVERED" ? (
        /* ORDER NOT DELIVERED ERROR BLOCK */
        <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 text-center">
          <svg className="w-8 h-8 text-orange-500 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-xs font-extrabold text-orange-800 uppercase tracking-wider">Unavailable</p>
          <p className="text-[11px] text-orange-600 mt-1 max-w-md mx-auto leading-normal">
            Returns, cancellations, & exchanges are only active on delivered orders. Please ensure your package has been delivered before attempting a claim.
          </p>
        </div>
      ) : (
        /* SUBMISSION FORM */
        <form onSubmit={handleSubmitReturn} className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-200 pb-2">
            Submit Return / Exchange Request
          </h4>

          {hasSomeCustom && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg text-xs font-medium leading-normal">
              ⚠️ <strong>Note:</strong> Customized items in this order are non-returnable. You can only request an exchange or return for standard Plain and Printed tees.
            </div>
          )}

          <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-lg text-[11px] font-bold leading-normal">
            ⚠️ Shipping Policy Notice: As this order has already been shipped, you will be responsible for both the initial shipping fee and the return shipping fee (unless the item arrived defective or incorrect).
          </div>
          
          {/* Selector for EXCHANGE vs REFUND */}
          <div>
            <label className="text-[10px] text-neutral-400 uppercase font-black tracking-widest block mb-2">Request Type</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setReturnType("EXCHANGE")}
                className={`flex-1 py-3 px-4 text-xs font-bold uppercase rounded-lg border transition ${
                  returnType === "EXCHANGE"
                    ? "bg-black border-black text-white"
                    : "bg-white border-neutral-300 hover:border-black text-black"
                }`}
              >
                Exchange (Size / Replacement)
              </button>
              <button
                type="button"
                onClick={() => setReturnType("REFUND")}
                className={`flex-1 py-3 px-4 text-xs font-bold uppercase rounded-lg border transition ${
                  returnType === "REFUND"
                    ? "bg-black border-black text-white"
                    : "bg-white border-neutral-300 hover:border-black text-black"
                }`}
              >
                Refund (Store Return)
              </button>
            </div>
          </div>

          {/* Dropdown Reason */}
          <div>
            <label htmlFor="reason-select" className="text-[10px] text-neutral-400 uppercase font-black tracking-widest block mb-1">Reason for Claim</label>
            <select
              id="reason-select"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full text-xs font-bold uppercase border border-neutral-300 rounded-lg p-3 bg-white focus:border-black outline-none"
            >
              {order.status !== "DELIVERED" ? (
                <>
                  <option value="Cancel order / Request Refund">Cancel order / Request Refund</option>
                  <option value="Change size / Edit order details">Change size / Edit order details</option>
                  <option value="Change shipping address">Change shipping address</option>
                  <option value="Other">Other</option>
                </>
              ) : (
                <>
                  <option value="Size doesn't fit">Size doesn&apos;t fit</option>
                  <option value="Defective / Damaged product">Defective / Damaged product</option>
                  <option value="Wrong item sent">Wrong item sent</option>
                  <option value="Quality not as expected">Quality not as expected</option>
                  <option value="Other">Other</option>
                </>
              )}
            </select>
          </div>

          {/* Extra Details */}
          <div>
            <label htmlFor="extra-details" className="text-[10px] text-neutral-400 uppercase font-black tracking-widest block mb-1">Additional Details (Optional)</label>
            <textarea
              id="extra-details"
              rows={3}
              value={detailedReason}
              onChange={(e) => setDetailedReason(e.target.value)}
              placeholder="Please provide any additional comments about the issue..."
              className="w-full text-xs border border-neutral-300 rounded-lg p-3 outline-none focus:border-black resize-none"
            />
          </div>

          {/* Photo / Video evidence & Defect Checkbox (only for delivered orders) */}
          {order.status === "DELIVERED" ? (
            <>
              <div>
                <label htmlFor="media-url" className="text-[10px] text-neutral-400 uppercase font-black tracking-widest block mb-1">Photo/Video Evidence URL</label>
                <input
                  id="media-url"
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Paste your unboxing video or photo proof link here (S3, Imgur, etc.)"
                  className="w-full text-xs border border-neutral-300 rounded-lg p-3 outline-none focus:border-black"
                  required
                />
                <p className="text-[10px] text-neutral-400 mt-1 leading-normal">
                  * IMPORTANT: To enforce fairness and prevent abuse, we require photo/video evidence of any defects or wrong items before approving returns.
                </p>
              </div>

              {/* Checkbox: Is Defective */}
              <div className="flex items-start gap-2.5 bg-white p-3 rounded-lg border border-neutral-200">
                <input
                  id={`is-defective-${order.id}`}
                  type="checkbox"
                  checked={isDefective}
                  onChange={(e) => setIsDefective(e.target.checked)}
                  className="mt-0.5 rounded accent-black"
                />
                <label htmlFor={`is-defective-${order.id}`} className="text-[11px] text-neutral-600 cursor-pointer select-none">
                  <strong>This item arrived defective, damaged, or wrong.</strong>
                  <span className="block text-[10px] text-neutral-400 mt-0.5">
                    If checked and verified, return fees are waived. If unchecked, since the order is already shipped, you must pay both the initial and return shipping amounts.
                  </span>
                </label>
              </div>
            </>
          ) : null}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submittingReturn}
            className="w-full bg-black text-white text-xs font-black uppercase tracking-widest py-3.5 rounded-lg hover:bg-neutral-800 disabled:bg-neutral-400 transition"
          >
            {submittingReturn ? "Submitting Claim..." : "Submit Return Claim"}
          </button>
        </form>
      )}
    </div>
  );
}
