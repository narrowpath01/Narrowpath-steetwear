"use client";

import { useState, useEffect } from "react";

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
}

export default function AddressManager({ user }: { user: any }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fullName = user?.name || "";
  const [firstName, lastName] = fullName.split(" ");

  const [formData, setFormData] = useState({
    firstName: firstName || "", lastName: lastName || "", email: user?.email || "",
    street: "", city: "", state: "", pinCode: ""
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch('/api/user/addresses');
        if (res.ok) setAddresses(await res.json());
      } catch (error) {
        console.error("Failed to load addresses", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/user/addresses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(formData), 
      });
      if (!response.ok) throw new Error("Failed to save address");

      const savedAddress = await response.json();
      setAddresses((prev) => [savedAddress, ...prev]);
      setIsAddingAddress(false);
      setFormData({ ...formData, street: "", city: "", state: "", pinCode: "" });
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (idToDelete: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== idToDelete));
    try {
      await fetch(`/api/user/addresses?id=${idToDelete}`, { method: 'DELETE', credentials: 'include' });
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 mb-8 shadow-sm bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold">Addresses</h2>
        {!isAddingAddress && (
          <button onClick={() => setIsAddingAddress(true)} className="text-[#005bd3] hover:underline text-sm font-medium flex items-center gap-1 transition-all">
            <span className="text-lg leading-none">+</span> Add
          </button>
        )}
      </div> 

      {isAddingAddress ? (
        <form onSubmit={handleSaveAddress} className="bg-gray-50 p-6 rounded-lg border border-gray-200 grid grid-cols-2 gap-4">
          <input name="firstName" value={formData.firstName} onChange={handleFormChange} placeholder="First Name" required className="border border-gray-300 rounded p-3 text-sm focus:outline-black focus:border-black" />
          <input name="lastName" value={formData.lastName} onChange={handleFormChange} placeholder="Last Name" required className="border border-gray-300 rounded p-3 text-sm focus:outline-black focus:border-black" />
          <input name="street" value={formData.street} onChange={handleFormChange} placeholder="Street Address" required className="col-span-2 border border-gray-300 rounded p-3 text-sm focus:outline-black focus:border-black" />
          <input name="city" value={formData.city} onChange={handleFormChange} placeholder="City" required className="border border-gray-300 rounded p-3 text-sm focus:outline-black focus:border-black" />
          <div className="grid grid-cols-2 gap-4">
            <input name="state" value={formData.state} onChange={handleFormChange} placeholder="State" required className="border border-gray-300 rounded p-3 text-sm focus:outline-black focus:border-black" />
            <input name="pinCode" value={formData.pinCode} onChange={handleFormChange} placeholder="PIN Code" required className="border border-gray-300 rounded p-3 text-sm focus:outline-black focus:border-black" />
          </div>
          <div className="flex gap-2 col-span-2 mt-2">
            <button type="submit" disabled={isSaving} className={`bg-black text-white px-5 py-2 rounded-full text-sm font-medium transition-all ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}>
              {isSaving ? "Saving..." : "Save Address"}
            </button>
            <button type="button" onClick={() => setIsAddingAddress(false)} className="text-gray-500 px-5 py-2 text-sm hover:bg-gray-200 rounded-full transition-colors">Cancel</button>
          </div>
        </form>
      ) : isLoading ? (
        <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center gap-3 text-neutral-400 text-xs font-bold uppercase tracking-widest border border-gray-100 animate-pulse">
          Loading addresses...
        </div>
      ) : addresses.length > 0 ? (
        <div className="flex flex-col gap-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="p-4 border border-gray-100 rounded bg-gray-50 text-sm text-gray-700 flex justify-between items-start gap-4">
              <div>
                <p className="font-bold text-black">{addr.firstName} {addr.lastName}</p>
                <p>{addr.street}</p>
                <p>{addr.city}, {addr.state} {addr.pinCode}</p>
              </div>
              <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-full transition-colors flex-shrink-0 font-medium">
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3 text-gray-600 text-sm border border-gray-100">
          No addresses added
        </div>
      )}
    </div>
  );
}