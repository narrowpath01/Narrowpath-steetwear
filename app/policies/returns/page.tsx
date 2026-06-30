export default function ExchangeRefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto bg-white p-6 md:p-12 rounded-3xl border-l border-r border-neutral-300 shadow-sm text-black">
        <h1 className="text-3xl font-black uppercase mb-8 text-black tracking-widest">Exchange & Refund Policy</h1>

        <div className="text-black space-y-6 text-sm leading-relaxed text-justify">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Last Updated: June 29, 2026</p>

          <p>
            At Narrow Path, we want you to be completely satisfied with your purchase. If something isn't quite right, we're here to help.
          </p>

          <hr className="border-neutral-100 my-6" />

          {/* 1. EXCHANGE POLICY */}
          <div>
            <h3 className="font-black uppercase text-sm">1. EXCHANGE POLICY</h3>
            <p className="mt-2">You may request an exchange within <strong>5 days</strong> of receiving your order.</p>
          </div>

          {/* 2. EXCHANGE ELIGIBILITY */}
          <div>
            <h3 className="font-black uppercase text-sm">2. EXCHANGE ELIGIBILITY</h3>
            <p className="mt-2 mb-2">To qualify for an exchange, the item must:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Be unworn, unused, and unwashed.</li>
              <li>Be free from stains, damage, or alterations.</li>
              <li>Have all original tags attached.</li>
              <li>Be returned in its original packaging.</li>
            </ul>
            <p className="text-neutral-500 text-xs mt-2">Failure to meet the above conditions may result in the exchange request being declined.</p>
          </div>

          {/* 3. EXCHANGE SHIPPING CHARGES */}
          <div>
            <h3 className="font-black uppercase text-sm">3. EXCHANGE SHIPPING CHARGES</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>For size changes or product exchanges requested by the customer, the customer is responsible for <strong>50% of the return shipping cost</strong>.</li>
              <li>We encourage customers to carefully review product details, sizing charts, and order information before placing an order.</li>
            </ul>
          </div>

          {/* 4. DEFECTIVE OR INCORRECT ITEMS */}
          <div>
            <h3 className="font-black uppercase text-sm">4. DEFECTIVE OR INCORRECT ITEMS</h3>
            <p className="mt-2">
              If you receive a defective, damaged, or incorrect item, Narrow Path will arrange a reverse pickup at no additional cost. All shipping expenses related to such cases will be borne by us.
            </p>
          </div>

          {/* 5. EXCHANGE PROCESS */}
          <div>
            <h3 className="font-black uppercase text-sm">5. EXCHANGE PROCESS</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Once the returned item is received and inspected, we will notify you of the approval or rejection of your exchange request within <strong>3-5 business days</strong>.</li>
              <li>If approved, you may exchange the item for a different size or another product of equal value, subject to availability.</li>
            </ul>
          </div>

          {/* 6. PARTIAL EXCHANGE ELIGIBILITY */}
          <div>
            <h3 className="font-black uppercase text-sm">6. PARTIAL EXCHANGE ELIGIBILITY</h3>
            <p className="mt-2 mb-2">In certain cases, we may offer only a partial credit or deny the exchange if the returned item shows signs of:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use or wear</li>
              <li>Missing tags</li>
              <li>Damage not caused by Narrow Path</li>
              <li>Missing original packaging</li>
            </ul>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* 7. INCORRECT PRODUCT CLAIMS */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="font-black uppercase text-sm text-red-600">7. INCORRECT PRODUCT CLAIMS</h3>
            <p>
              If you receive an item that differs from what was ordered, please contact us within <strong>48 hours</strong> of delivery.
            </p>
            <p className="font-bold">To investigate and resolve the issue, customers may be required to provide:</p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium">
              <li>An <strong>unedited unboxing video</strong> showing the sealed package being opened.</li>
              <li><strong>Clear photographs</strong> of the received product and packaging.</li>
              <li>The <strong>order number</strong> and <strong>shipping label details</strong>.</li>
            </ul>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Narrow Path reserves the right to verify all claims using dispatch records, packing evidence, and courier information. Claims submitted without sufficient supporting evidence may not qualify for a replacement, exchange, or refund.
            </p>
            <p>
              If our investigation confirms that an incorrect item was delivered, we will arrange a replacement or refund at no additional cost to the customer.
            </p>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* 8. REFUND POLICY */}
          <div>
            <h3 className="font-black uppercase text-sm">8. REFUND POLICY</h3>
            <p className="mt-2">You may request a refund within <strong>7 days</strong> of receiving your order.</p>
          </div>

          {/* 9. REFUND ELIGIBILITY */}
          <div>
            <h3 className="font-black uppercase text-sm">9. REFUND ELIGIBILITY</h3>
            <p className="mt-2 mb-2">To qualify for a refund, the item must:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Be unworn, unused, and unwashed.</li>
              <li>Be free from stains, damage, or alterations.</li>
              <li>Have all original tags attached.</li>
              <li>Be returned in its original packaging.</li>
            </ul>
            <p className="text-neutral-500 text-xs mt-2">Failure to meet these conditions may result in the refund request being rejected.</p>
          </div>

          {/* 10. NON-REFUNDABLE SITUATIONS */}
          <div>
            <h3 className="font-black uppercase text-sm">10. NON-REFUNDABLE SITUATIONS</h3>
            <p className="mt-2 mb-2">Refund requests may be declined if:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The returned product does not meet the eligibility requirements listed above.</li>
              <li>The product has been used, washed, altered, or damaged after delivery.</li>
              <li>Original tags or packaging are missing.</li>
            </ul>
          </div>

          {/* 11. DEFECTIVE OR INCORRECT PRODUCTS */}
          <div>
            <h3 className="font-black uppercase text-sm">11. DEFECTIVE OR INCORRECT PRODUCTS</h3>
            <p className="mt-2">
              If you receive a defective, damaged, or incorrect item, please contact us within <strong>3 days</strong> of delivery. Upon verification, we will arrange a return pickup and process a full refund or replacement at no additional cost to you.
            </p>
          </div>

          {/* 12. REFUND PROCESS */}
          <div>
            <h3 className="font-black uppercase text-sm">12. REFUND PROCESS</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>After receiving and inspecting the returned item, we will notify you of the approval or rejection of your refund request within <strong>3–5 business days</strong>.</li>
              <li>If approved, refunds will be processed to the original payment method within <strong>7 business days</strong>.</li>
            </ul>
          </div>

          {/* 13. CASH ON DELIVERY (COD) ORDERS */}
          <div>
            <h3 className="font-black uppercase text-sm">13. CASH ON DELIVERY (COD) ORDERS</h3>
            <div className="mt-2">
              For orders paid via Cash on Delivery (COD), approved refund amounts will be issued as:
              <ul className="list-circle pl-5 mt-1 space-y-1">
                <li>Store credit/wallet balance (if available on the platform), or</li>
                <li>Bank transfer upon submission of valid account details, at our discretion.</li>
              </ul>
            </div>
          </div>

          {/* 14. PARTIAL REFUNDS */}
          <div>
            <h3 className="font-black uppercase text-sm">14. PARTIAL REFUNDS</h3>
            <p className="mt-2 mb-2">Partial refunds may be granted in certain circumstances, including but not limited to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Items returned with missing tags</li>
              <li>Products showing signs of wear or improper handling</li>
              <li>Damage not caused by Narrow Path</li>
              <li>Returns received without original packaging</li>
            </ul>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* CONTACT US */}
          <div>
            <h3 className="font-black uppercase text-sm">CONTACT US</h3>
            <p className="mt-2 mb-2">If you have any questions regarding exchanges, returns, or refunds, please contact us:</p>
            <div className="bg-neutral-50 p-4 border border-neutral-100 rounded-xl">
              <p className="font-black uppercase">Narrow Path</p>
              <p className="text-neutral-600">Email: <a href="mailto:narrowpathtshirts@gmail.com" className="text-[#005bd3] hover:underline font-bold">narrowpathtshirts@gmail.com</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
