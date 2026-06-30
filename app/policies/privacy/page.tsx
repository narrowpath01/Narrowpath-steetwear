export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto bg-white p-6 md:p-12 rounded-3xl border-l border-r border-neutral-300 shadow-sm text-black">
        <h1 className="text-3xl font-black uppercase mb-8 text-black tracking-widest">Privacy Policy</h1>

        <div className="text-black space-y-6 text-sm leading-relaxed">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Last Updated: June 29, 2026</p>

          <p>
            At Narrow Path, we believe that trust is earned through integrity, transparency, and respect. Protecting your personal information is not only a legal responsibility—it is an important part of our commitment to you.
          </p>
          <p>
            We do not sell, rent, or trade your personal information to third parties for profit. Any information we collect is used solely to provide our products and services, fulfill your orders, improve your experience, and support the ongoing growth of our brand.
          </p>
          <p>
            By using our website, you agree to the collection and use of information in accordance with this Privacy Policy.
          </p>

          <hr className="border-neutral-100 my-6" />

          {/* Section 1 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-4">1. INFORMATION WE COLLECT</h3>
            
            <div className="space-y-6 pl-2">
              <div>
                <h3 className="font-black uppercase text-sm mb-2">A. INFORMATION YOU PROVIDE DIRECTLY</h3>
                <p className="mb-2">When you interact with our website, place an order, create an account, or contact us, we may collect the following information:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Personal Identification Information:</strong> Name, email address, phone number, billing address, and shipping address.</li>
                  <li><strong>Payment Information:</strong> Payment details required to complete purchases. Payment transactions are securely processed through trusted third-party payment providers, and we do not store your complete card information.</li>
                  <li><strong>Account Information:</strong> Username, password, and account preferences.</li>
                  <li><strong>Communication Information:</strong> Any messages, inquiries, reviews, feedback, or correspondence you send to us.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-black uppercase text-sm mb-2">B. INFORMATION COLLECTED AUTOMATICALLY</h3>
                <p className="mb-2">When you visit our website, certain information may be collected automatically, including:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Browser type and version</li>
                  <li>Device type and operating system</li>
                  <li>IP address</li>
                  <li>Language preferences</li>
                  <li>Referral source</li>
                  <li>Pages visited and time spent on our website</li>
                  <li>General location information</li>
                  <li>Other technical and analytical data</li>
                </ul>
                <p className="mt-2">This information helps us understand how visitors use our website and enables us to improve performance and user experience.</p>
              </div>

              <div>
                <h3 className="font-black uppercase text-sm mb-2">C. COOKIES AND SIMILAR TECHNOLOGIES</h3>
                <p className="mb-2">We use cookies and similar tracking technologies to enhance your browsing experience and improve our website's functionality.</p>
                <p className="mb-2">Cookies help us:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Remember your preferences and settings</li>
                  <li>Keep your shopping cart active</li>
                  <li>Analyze website traffic and usage patterns</li>
                  <li>Improve website performance and security</li>
                </ul>
                <p className="mt-2">You may choose to disable cookies through your browser settings; however, certain features of the website may not function properly if cookies are disabled.</p>
              </div>
            </div>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 2 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">2. HOW WE USE YOUR INFORMATION</h3>
            <p className="mb-3">We use your information for the following purposes:</p>
            
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>ORDER PROCESSING AND FULFILLMENT:</strong>
                <ul className="list-circle pl-5 mt-1 space-y-0.5">
                  <li>Processing and confirming orders</li>
                  <li>Managing payments</li>
                  <li>Shipping products and providing delivery updates</li>
                  <li>Issuing invoices and transaction confirmations</li>
                </ul>
              </li>
              <li>
                <strong>CUSTOMER SUPPORT:</strong>
                <ul className="list-circle pl-5 mt-1 space-y-0.5">
                  <li>Responding to inquiries and support requests</li>
                  <li>Resolving complaints and service issues</li>
                </ul>
              </li>
              <li>
                <strong>PERSONALIZATION:</strong>
                <ul className="list-circle pl-5 mt-1 space-y-0.5">
                  <li>Understanding customer preferences</li>
                  <li>Providing relevant product recommendations</li>
                  <li>Improving your shopping experience</li>
                </ul>
              </li>
              <li>
                <strong>WEBSITE IMPROVEMENT:</strong>
                <ul className="list-circle pl-5 mt-1 space-y-0.5">
                  <li>Monitoring website performance</li>
                  <li>Analyzing visitor behavior</li>
                  <li>Enhancing website functionality and usability</li>
                </ul>
              </li>
              <li>
                <strong>MARKETING AND PROMOTIONS:</strong>
                <ul className="list-circle pl-5 mt-1 space-y-0.5">
                  <li>Sending newsletters, promotional offers, and updates</li>
                  <li>Informing you about new products and campaigns</li>
                </ul>
                <p className="text-xs text-neutral-500 mt-1">You may unsubscribe from marketing communications at any time by using the unsubscribe link included in our emails.</p>
              </li>
              <li>
                <strong>SECURITY AND FRAUD PREVENTION:</strong>
                <ul className="list-circle pl-5 mt-1 space-y-0.5">
                  <li>Detecting and preventing fraudulent activities</li>
                  <li>Protecting customer accounts</li>
                  <li>Maintaining the security of our website and systems</li>
                </ul>
              </li>
            </ul>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 3 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">3. HOW WE SHARE YOUR INFORMATION</h3>
            <p className="mb-2">We do not sell your personal information. We may share information only in the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>SERVICE PROVIDERS:</strong> We work with trusted third-party providers who assist us with payment processing, shipping and delivery services, website hosting and maintenance, email communications, and customer support. These partners receive only the information necessary to perform their services.
              </li>
              <li>
                <strong>LEGAL REQUIREMENTS:</strong> We may disclose information when required by law or when responding to lawful requests from government authorities, courts, or regulatory agencies.
              </li>
              <li>
                <strong>BUSINESS TRANSFERS:</strong> If Narrow Path undergoes a merger, acquisition, restructuring, or sale of assets, customer information may be transferred as part of the transaction.
              </li>
              <li>
                <strong>PROTECTION OF RIGHTS:</strong> We may disclose information when necessary to enforce our Terms and Conditions, protect our legal rights, prevent fraud or illegal activities, and ensure the safety of our customers and business operations.
              </li>
            </ul>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 4 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">4. DATA SECURITY</h3>
            <p className="mb-2">We take reasonable and appropriate measures to safeguard your personal information. Our security practices include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>SSL (Secure Socket Layer) encryption for data transmission</li>
              <li>Secure payment processing systems</li>
              <li>Restricted access to personal information</li>
              <li>Regular monitoring and security reviews</li>
              <li>Industry-standard security practices</li>
            </ul>
            <p className="mt-2 text-neutral-500 text-xs">
              While we strive to protect your information, no online transmission or storage method can be guaranteed to be completely secure. Therefore, we cannot guarantee absolute security.
            </p>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 5 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">5. YOUR PRIVACY RIGHTS</h3>
            <p className="mb-2">Depending on applicable laws, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Withdraw consent where applicable</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, please contact us using the details provided below.</p>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 6 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">6. CHILDREN'S PRIVACY</h3>
            <p>
              Our website and services are intended for individuals who are at least 18 years of age. We do not knowingly collect personal information from children under 18. If you believe a child has provided personal information to us, please contact us immediately so that we can take appropriate steps to remove such information.
            </p>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 7 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">7. THIRD-PARTY WEBSITES</h3>
            <p>
              Our website may contain links to third-party websites, services, or platforms. We are not responsible for the privacy practices, content, or policies of these external websites. We encourage users to review the privacy policies of any third-party websites they visit.
            </p>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 8 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">8. CHANGES TO THIS PRIVACY POLICY</h3>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or business operations. Any updates will be posted on this page along with the revised "Last Updated" date. Continued use of our website following any changes indicates acceptance of the updated Privacy Policy.
            </p>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 9 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">9. CONTACT US</h3>
            <p className="mb-2">If you have any questions, concerns, or requests regarding this Privacy Policy or the way we handle your personal information, please contact us:</p>
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