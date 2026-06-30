"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";

interface AddressForm {
  id?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
}

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { data: session, status } = useSession();
  const { items, totalPrice } = useCartStore();

  const [formData, setFormData] = useState<AddressForm>({
    firstName: "", lastName: "", phoneNumber: "", email: "", street: "", city: "", state: "", pinCode: ""
  });
  
  const [selectedDropdownId, setSelectedDropdownId] = useState("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<AddressForm[]>([]);

  // Pincode Verification State
  const [isPinServiceable, setIsPinServiceable] = useState<boolean | null>(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingFee, setShippingFee] = useState<number>(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  // Payment Method is PREPAID only
  const paymentMethod = "PREPAID";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    const fetchRealAddresses = async () => {
      if (status === "authenticated" && session?.user) {
        setIsLoadingAddresses(true); 
        try {
          const res = await fetch('/api/user/addresses');
          if (res.ok) {
            const data = await res.json();
            setSavedAddresses(data);
          }
        } catch (error) {
          console.error("Failed to load addresses", error);
        } finally {
          setIsLoadingAddresses(false);
        }
      } else {
        setIsLoadingAddresses(false);
      }
    };
    fetchRealAddresses();
  }, [session, status]);

  const verifyCheckoutPin = async (pin: string, method: "PREPAID" = "PREPAID") => {
    if (pin.length === 6 && !isNaN(Number(pin))) {
      setCheckingPin(true);
      setCalculatingShipping(true); 
      setShippingFee(0); 
      
      try {
        // 1. Check Serviceability
        const res = await fetch(`/api/shipping/serviceability?pin=${pin}`);
        const data = await res.json();
        
        if (data.serviceable) {
          setIsPinServiceable(true);
          
          // 2. Calculate Cost
          const estimatedWeight = items.reduce((acc, item) => acc + (500 * item.quantity), 0);
          
          const feeRes = await fetch('/api/shipping/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ destPin: pin, weightGrams: estimatedWeight, paymentType: method })
          });
          
          const feeData = await feeRes.json();
          setShippingFee(feeData.fee || 0);
          
        } else {
          setIsPinServiceable(false);
        }
      } catch {
        setIsPinServiceable(false);
      } finally {
        setCheckingPin(false);
        setCalculatingShipping(false);
      }
    } else {
      setIsPinServiceable(null);
      setShippingFee(0);
    }
  };



  const handleSelectSavedAddress = (id: string) => {
    setSelectedDropdownId(id);

    if (!id) {
      setFormData({ firstName: "", lastName: "", phoneNumber: "", email: "", street: "", city: "", state: "", pinCode: "" });
      setIsPinServiceable(null);
      return;
    }

    const selected = savedAddresses.find((addr) => addr.id === id);
    if (selected) {
      setFormData({
        id: selected.id,
        firstName: selected.firstName,
        lastName: selected.lastName,
        phoneNumber: selected.phoneNumber || "",
        email: selected.email,
        street: selected.street,
        city: selected.city,
        state: selected.state,
        pinCode: selected.pinCode
      });
      verifyCheckoutPin(selected.pinCode, paymentMethod);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedForm = { ...formData, [e.target.name]: e.target.value, id: undefined };
    setFormData(updatedForm);
    if (e.target.name === "pinCode") {
      verifyCheckoutPin(e.target.value, paymentMethod);
    }
  };

  if (!isMounted) return null;

  const handlePayment = async () => {
    if (!formData.firstName || !formData.street || !formData.city || !formData.pinCode || !formData.phoneNumber) {
      alert("Don't skip steps. Fill out the entire shipping form.");
      return;
    }

    setIsProcessing(true);

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      // 1. Ask our backend to create a Razorpay Order
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items, 
          addressData: formData 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. Initialize the Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: data.amount,
        currency: "INR",
        name: "Narrow Path",
        description: "Access the Underground",
        order_id: data.orderId,
        handler: async function (response: any) {
          // 3. Send payment signature to backend for verification
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: data.dbOrderId 
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment successful!");
            window.location.href = `/order/success?id=${data.dbOrderId}`;
          } else {
            alert("Payment verification failed. If money was deducted, it will be refunded.");
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phoneNumber,
        },
        theme: {
          color: "#000000",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      console.error("Checkout failed:", error);
      alert(error.message || "Something broke during checkout.");
    } finally {
      setIsProcessing(false);
    }
  };



  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-black">
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-12 lg:pt-32 lg:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">

        {/* LEFT COLUMN: Shipping Information */}
        <div className="flex flex-col h-full">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 text-black flex-1 flex flex-col">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-6 text-black">Shipping Information</h2>

           {/* SAVED ADDRESSES SECTION */}
            {(() => {
              if (status === "unauthenticated") return null;

              const isFetching = status === "loading" || isLoadingAddresses;
              const selectedAddress = savedAddresses.find(a => a.id === selectedDropdownId);

              return (
                <div className="relative mb-2">
                  <label className="text-neutral-500 text-xs font-bold tracking-widest uppercase mb-3 block">
                    Use a saved address
                  </label>
                  
                  <div className="relative">
                    <button
                      type="button"
                      disabled={isFetching || savedAddresses.length === 0}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full text-left border rounded-xl p-4 text-sm focus:outline-none transition-all flex justify-between items-center ${
                        isDropdownOpen ? "border-black ring-1 ring-black" : "border-neutral-300"
                      } ${(isFetching || savedAddresses.length === 0) ? "cursor-not-allowed opacity-60 bg-neutral-50" : "bg-white hover:border-neutral-400"}`}
                    >
                      <span className={`truncate pr-4 ${!selectedAddress ? "text-neutral-400" : "text-black font-medium"}`}>
                        {isFetching
                          ? "Fetching your addresses..."
                          : savedAddresses.length === 0
                          ? "No saved addresses found"
                          : selectedAddress
                          ? `${selectedAddress.street}, ${selectedAddress.city} - ${selectedAddress.pinCode}`
                          : "Select a saved address..."}
                      </span>

                      {isFetching ? (
                        <svg className="animate-spin w-4 h-4 text-neutral-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className={`w-4 h-4 text-neutral-500 transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {isDropdownOpen && !isFetching && savedAddresses.length > 0 && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                        <div className="absolute z-20 w-full mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                          <ul className="max-h-72 overflow-y-auto py-2">
                            {savedAddresses.map((addr) => (
                              <li
                                key={addr.id}
                                onClick={() => {
                                  handleSelectSavedAddress(addr.id!);
                                  setIsDropdownOpen(false);
                                }}
                                className={`px-5 py-4 cursor-pointer transition-colors border-b border-neutral-50 last:border-0 ${
                                  selectedDropdownId === addr.id
                                    ? "bg-black text-white"
                                    : "text-black hover:bg-neutral-50"
                                }`}
                              >
                                <span className="block font-bold text-sm">{addr.firstName} {addr.lastName}</span>
                                <span className={`block text-xs mt-1 leading-relaxed ${selectedDropdownId === addr.id ? "text-neutral-300" : "text-neutral-500"}`}>
                                  {addr.street}<br/>
                                  {addr.city}, {addr.state} - {addr.pinCode}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center w-full my-8">
                    <div className="flex-1 border-t border-neutral-200"></div>
                    <span className="px-4 text-neutral-400 text-xs font-bold uppercase tracking-widest">Or</span>
                    <div className="flex-1 border-t border-neutral-200"></div>
                  </div>
                </div>
              );
            })()}

            {/* Form Heading */}
            <label className="text-gray-500 text-sm block mb-4 font-medium tracking-wide uppercase">
              Enter Shipping Details
            </label>

            {/* The Form Fields */}
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="border border-neutral-300 bg-white text-black placeholder-neutral-400 rounded-lg p-3 text-sm focus:outline-none focus:border-black" />
              <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="border border-neutral-300 bg-white text-black placeholder-neutral-400 rounded-lg p-3 text-sm focus:outline-none focus:border-black" />
              <input name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} placeholder="Phone Number" className="col-span-1 sm:col-span-2 border border-neutral-300 bg-white text-black placeholder-neutral-400 rounded-lg p-3 text-sm focus:outline-none focus:border-black" />
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="col-span-1 sm:col-span-2 border border-neutral-300 bg-white text-black placeholder-neutral-400 rounded-lg p-3 text-sm focus:outline-none focus:border-black" />
              <input name="street" value={formData.street} onChange={handleChange} placeholder="Street Address" className="col-span-1 sm:col-span-2 border border-neutral-300 bg-white text-black placeholder-neutral-400 rounded-lg p-3 text-sm focus:outline-none focus:border-black" />
              <input name="city" value={formData.city} onChange={handleChange} placeholder="City" className="col-span-1 border border-neutral-300 bg-white text-black placeholder-neutral-400 rounded-lg p-3 text-sm focus:outline-none focus:border-black" />
              <input name="state" value={formData.state} onChange={handleChange} placeholder="State" className="col-span-1 border border-neutral-300 bg-white text-black placeholder-neutral-400 rounded-lg p-3 text-sm focus:outline-none focus:border-black" />
              
              <div className="flex flex-col gap-1 col-span-1 sm:col-span-2 mt-2">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1">
                  Delivery Area / PIN Code
                </label>
                <input name="pinCode" maxLength={6} value={formData.pinCode} onChange={handleChange} placeholder="Enter 6-digit PIN Code" className="border border-neutral-300 bg-white text-black placeholder-neutral-400 rounded-lg p-3 text-sm focus:outline-none focus:border-black w-full" />
                
                {checkingPin && <span className="text-xs text-neutral-400 animate-pulse uppercase tracking-wider font-bold mt-1">Verifying area...</span>}
                {isPinServiceable === false && !checkingPin && (
                  <span className="text-xs text-red-500 font-bold uppercase tracking-wider mt-1">Delhivery does not service this region</span>
                )}
                {isPinServiceable === true && !checkingPin && (
                  <span className="text-xs text-green-600 font-bold uppercase tracking-wider mt-1">Delivery available to this region!</span>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Payment */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 text-black flex flex-col h-full mt-0">
          <h2 className="text-lg font-bold uppercase tracking-widest mb-8 text-black">Order Summary</h2>

          <div className="flex flex-col gap-6 mb-8 border-b border-neutral-100 pb-8">
            {items.map((item) => {
              const imageUrl = item.variant?.product?.images?.[0]?.url;
              const title = item.variant?.product?.title || "Unknown Item";
              const size = item.variant?.title || "N/A";
              const price = item.variant?.price || 0;

              return (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative w-16 h-20 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-neutral-200" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm uppercase text-black">{title}</h3>
                    <p className="text-xs text-neutral-500 uppercase mt-1">Size: {size}</p>
                    <p className="text-xs text-neutral-500 uppercase mt-1">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-sm text-black">INR {price * item.quantity}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-4 text-sm mb-6">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span className="text-black font-medium">INR {totalPrice()}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Shipping</span>
              <span className="text-black font-medium">
                {calculatingShipping ? "Calculating..." : shippingFee === 0 ? "Enter PIN Code" : `INR ${shippingFee}`}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-lg font-black uppercase border-t border-neutral-200 pt-6 text-black mb-8">
            <span>Total</span>
            <span>INR {totalPrice() + shippingFee}</span>
          </div>

          <button 
            onClick={handlePayment}
            disabled={isPinServiceable === false || checkingPin || calculatingShipping || !formData.pinCode || isProcessing}
            className="w-full bg-black text-white py-5 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed mt-auto"
          >
            {isProcessing ? "Processing..." : 
             checkingPin || calculatingShipping ? "Calculating..." : 
             isPinServiceable === false ? "Area Unserviceable" : 
             "Pay Now"}
          </button>
        </div>

      </div>
    </div>
  );
}