import prisma from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

interface SuccessPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { id } = await searchParams;
  if (!id) redirect("/");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      address: true,
      items: {
        include: {
          variant: {
            include: { product: true }
          }
        }
      }
    }
  });

  if (!order) redirect("/");

  return (
    <div className="min-h-screen bg-neutral-50 text-black flex flex-col justify-center items-center px-4 py-24">
      <div className="max-w-xl w-full bg-white border border-neutral-200 rounded-3xl p-8 shadow-xl text-center">
        {/* Brand Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" aria-label="Narrow Path Home">
            <Image
              src="/logo-black.png"
              alt="Narrow Path"
              width={160}
              height={78}
              className="h-8 w-auto object-contain hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>

        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-black uppercase tracking-widest mb-2 text-black">Order Confirmed</h1>
        <p className="text-neutral-500 text-sm mb-8">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {/* Order Details Card */}
        <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-6 text-left mb-8 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-neutral-200/60">
            <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">Order ID</span>
            <span className="text-sm font-black text-black uppercase">#{order.id.slice(-8)}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-neutral-200/60">
            <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">Payment Status</span>
            <span className="text-xs uppercase font-black px-2 py-0.5 rounded bg-green-100 text-green-800">
              Prepaid (Paid)
            </span>
          </div>

          {order.awb ? (
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200/60">
              <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">Delhivery AWB</span>
              <span className="text-sm font-black text-[#005bd3] tracking-widest">{order.awb}</span>
            </div>
          ) : (
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200/60">
              <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">Logistics Status</span>
              <span className="text-xs font-bold text-neutral-500 uppercase">Processing Shipment...</span>
            </div>
          )}

          <div className="pb-3 border-b border-neutral-200/60">
            <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider block mb-2">Shipping Address</span>
            {order.address && (
              <p className="text-xs text-neutral-600 font-medium leading-relaxed uppercase">
                {order.address.firstName} {order.address.lastName}<br />
                {order.address.street}, {order.address.city}, {order.address.state} - {order.address.pinCode}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">Total Paid</span>
            <span className="text-base font-black text-black">INR {order.amount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/shop" 
            className="flex-1 bg-black text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-neutral-800 transition-colors text-center"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/profile" 
            className="flex-1 border border-neutral-300 text-neutral-700 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-neutral-50 transition-colors text-center"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
