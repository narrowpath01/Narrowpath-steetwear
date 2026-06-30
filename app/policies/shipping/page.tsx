export default function ShippingPolicyPage() {
    return (
        // Added `px-4 md:px-8` to the outer wrapper to guarantee a gap outside the rounded box on all screen sizes.
        <div className="min-h-screen bg-white py-24 px-4 md:px-8">

            <div className="max-w-7xl mx-auto bg-white p-6 md:p-12 rounded-3xl border-l border-r border-neutral-300 shadow-sm">

                <h1 className="text-3xl font-black uppercase mb-8 text-black">Shipping Policy</h1>

                <div className="text-black space-y-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Last Updated: June 25, 2026</p>

                    <div>
                        <p className="text-sm">At Narrow Path, we are dedicated to ensuring that your orders reach you safely, securely, and in a timely manner. Please read our shipping policy carefully before placing an order.</p>
                    </div>

                    {/* 1. Order Processing */}
                    <div>
                        <h3 className="font-black uppercase text-sm">1. Order Processing</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li className="text-sm">
                                Orders are typically processed within <strong>1-3 business days</strong> after payment has been successfully confirmed.
                            </li>
                            <li className="text-sm">
                                Please note that orders are not processed, shipped, or delivered on Sundays or public holidays. During peak seasons, promotional events, or periods of high order volume, processing times may be extended.
                            </li>
                            <li className="text-sm">
                                Once your order has been dispatched, you will receive a confirmation email, SMS, or other notification containing your shipment tracking details.
                            </li>
                        </ul>
                    </div>

                    {/* 2. Shipping Coverage */}
                    <div>
                        <h3 className="font-black uppercase text-sm">2. Shipping Coverage</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li className="text-sm">
                                Narrow Path currently offers shipping throughout India.
                            </li>
                            <li className="text-sm">
                                At present, we do not offer international shipping. Should international delivery become available in the future, this policy will be updated accordingly.
                            </li>
                        </ul>
                    </div>

                    {/* 3. Shipping Fees */}
                    <div>
                        <h3 className="font-black uppercase text-sm">3. Shipping Fees</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li className="text-sm">
                                Any applicable shipping charges will be clearly displayed at checkout before your payment is completed.
                            </li>
                            <li className="text-sm">
                                From time to time, Narrow Path may offer free shipping promotions on qualifying orders. Details of such promotions will be communicated through our website or marketing channels.
                            </li>
                        </ul>
                    </div>

                    {/* 4. Delivery Timeframes */}
                    <div>
                        <h3 className="font-black uppercase text-sm">4. Delivery Timeframes</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li className="text-sm">
                                Delivery times vary based on the destination and courier service availability.
                            </li>
                            <li className="text-sm">
                                Estimated delivery timelines are as follows:
                                {/* list-[circle] changes the bullet style, pl-6 indents it further */}
                                <ul className="list-[circle] pl-6 mt-2 space-y-1 text-black">
                                    <li><strong>Metro Cities:</strong> 3-7 business days</li>
                                    <li><strong>Tier 2 & Tier 3 Cities:</strong> 5-10 business days</li>
                                    <li><strong>Remote or Rural Areas:</strong> 7-14 business days</li>
                                </ul>
                            </li>
                            <li className="text-sm">
                                These delivery estimates are provided for guidance only and should not be considered guaranteed delivery dates.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-black uppercase text-sm">5. Shipment Tracking</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li className="text-sm">
                                After your order has been shipped, tracking information will be provided via email, SMS, or WhatsApp, where applicable.                            </li>
                            <li className="text-sm">
                                Customers can use the tracking number provided to monitor their shipment directly through the courier partner's tracking system.                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-black uppercase text-sm">6. Delays in Delivery</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li className="text-sm">
                                While we make every effort to deliver orders within the estimated timeframe, delays may occasionally occur due to factors beyond our control, including but not limited to:
                                {/* list-[circle] changes the bullet style, pl-6 indents it further */}
                                <ul className="list-[circle] pl-6 mt-2 space-y-1 text-black">
                                    <li>Adverse weather conditions</li>
                                    <li>Public holidays and festivals</li>
                                    <li>Natural disasters</li>
                                    <li>Courier network disruptions</li>
                                    <li>Government regulations or restrictions</li>
                                    <li>Incomplete or incorrect shipping details</li>
                                </ul>
                            </li>
                            <li className="text-sm">
                                Narrow Path shall not be held liable for delays caused by third-party logistics providers or unforeseen circumstances.
                            </li>
                        </ul>
                    </div>


                    <div>
                        <h3 className="font-black uppercase text-sm">7. Customer Responsibility for Shipping Information</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li className="text-sm">
                                Customers are responsible for ensuring that all shipping information provided during checkout is accurate and complete.
                            </li>
                            <li className="text-sm">
                                If incorrect or incomplete details result in delivery failure, delays, or additional shipping costs, such charges may be the responsibility of the customer.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-black uppercase text-sm">8. Undelivered and Returned Shipments</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li className="text-sm">
                                Our courier partners may attempt delivery multiple times before returning a package.
                            </li>
                            <li className="text-sm">
                                If an order is returned to us due to:
                                {/* list-[circle] changes the bullet style, pl-6 indents it further */}
                                <ul className="list-[circle] pl-6 mt-2 space-y-1 text-black">
                                    <li>Customer unavailability</li>
                                    <li>Refusal to accept delivery</li>
                                    <li>Incorrect address information</li>
                                    <li>Failure to respond to courier communications</li>
                                </ul>
                                Then, the customer may be required to pay additional shipping charges for re-dispatching the order.
                            </li>
                        </ul>
                    </div>


                    <div>
                        <h3 className="font-black uppercase text-sm">9. Damaged, Missing, or Tampered Packages</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li className="text-sm">
                                If your package arrives damaged, tampered with, or contains missing items, please notify us within <strong>48 hours of delivery</strong>.
                            </li>
                            <li className="text-sm">
                                To help us investigate and resolve the issue, please provide:
                                <ul className="list-[circle] pl-6 mt-2 space-y-1 text-black">
                                    <li>Your order number</li>
                                    <li>Clear photographs of the package and products received</li>
                                    <li>A brief description of the issue</li>
                                </ul>
                            </li>
                            <li>Upon review, we will take appropriate steps to resolve the matter as quickly as possible.
                            </li>
                        </ul>
                    </div>


                    <div>
                        <h3 className="font-black uppercase text-sm">10. Transfer of Risk</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li className="text-sm">
                                Responsibility for the order transfers to the customer once the package has been handed over to the shipping carrier for delivery.
                            </li>
                            <li className="text-sm">
                                However, if a shipment is lost while in transit before reaching the customer, we will assist in coordinating with the courier partner to investigate and resolve the issue.
                            </li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h3 className="font-black uppercase text-sm">Contact Us</h3>
                        <p className="mt-2 mb-2">If you have any questions regarding shipping, delivery, or order tracking, please contact us:</p>
                        <div className="bg-neutral-50 p-4 border border-neutral-100 rounded-xl mb-4">
                            <p className="font-black uppercase">Narrow Path</p>
                            <p className="text-neutral-600 text-sm">Email: <a href="mailto:narrowpathtshirts@gmail.com" className="text-[#005bd3] hover:underline font-bold">narrowpathtshirts@gmail.com</a></p>
                        </div>
                        <p className="text-sm mt-4">Thank you for choosing Narrow Path. We appreciate your trust and remain committed to providing a reliable and seamless delivery experience.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}