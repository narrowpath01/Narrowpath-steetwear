"use client";

import { useState } from "react";

export default function ProfileSettings({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "User");
  const [email, setEmail] = useState(user?.email || "");

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // TODO: Send updated name AND email to your DB here
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 mb-6 shadow-sm bg-white">
      {isEditing ? (
        <form onSubmit={handleEditSubmit}>
          <div className="mb-4">
            <label className="text-gray-500 text-sm block mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-black focus:border-black" required />
          </div>
          <div className="mb-6">
            <label className="text-gray-500 text-sm block mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-black focus:border-black" required />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:opacity-80 transition-opacity">Save Changes</button>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 px-5 py-2 text-sm hover:bg-gray-100 rounded-full transition-colors">Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-gray-500 text-sm block mb-1">Name</span>
              <p className="text-base font-medium">{name}</p>
            </div>
            <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:opacity-70 transition-opacity text-sm font-medium">Edit</button>
          </div>
          <div>
            <span className="text-gray-500 text-sm block mb-1">Email</span>
            <p className="text-base">{email}</p>
          </div>
        </>
      )}
    </div>
  );
}