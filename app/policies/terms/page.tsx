export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto bg-white p-6 md:p-12 rounded-3xl border-l border-r border-neutral-300 shadow-sm text-black">
        <h1 className="text-3xl font-black uppercase mb-8 text-black tracking-widest">Terms of Service</h1>

        <div className="text-black space-y-6 text-sm leading-relaxed text-justify">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Last Updated: June 29, 2026</p>

          <p>
            Welcome to Narrow Path. By accessing our website, browsing our content, or placing an order, you agree to be bound by these Terms of Service. Please read them carefully before using our website.
          </p>

          <hr className="border-neutral-100 my-6" />

          {/* Section 1 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">1. GENERAL TERMS</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>By using this website, you confirm that you are at least 18 years of age or are using the website under the supervision and consent of a parent or legal guardian.</li>
              <li>Narrow Path reserves the right to refuse service, cancel orders, limit purchases, suspend accounts, or restrict access to our website at our sole discretion.</li>
              <li>We strive to display our products as accurately as possible. However, actual colors, prints, and product appearances may vary slightly due to screen settings, lighting, and manufacturing variations.</li>
            </ul>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 2 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">2. PRICING AND PAYMENTS</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>All prices displayed on our website are listed in Indian Rupees (INR) and include applicable taxes unless otherwise stated.</li>
              <li>We currently accept payments through credit cards, debit cards, UPI, and other payment methods displayed at checkout.</li>
              <li>All payments are securely processed through trusted third-party payment gateways. Narrow Path does not store your complete payment card information.</li>
              <li>While we make every effort to ensure accurate pricing, we reserve the right to correct pricing errors, update product information, or cancel orders affected by such errors.</li>
            </ul>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 3 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">3. ORDERS AND CANCELLATIONS</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>An order confirmation email acknowledges that we have received your order request. It does not constitute acceptance of the order.</li>
              <li>We reserve the right to:
                <ul className="list-circle pl-5 mt-1 space-y-0.5">
                  <li>Refuse or cancel any order</li>
                  <li>Limit quantities purchased</li>
                  <li>Reject orders suspected of fraud or unauthorized activity</li>
                </ul>
              </li>
              <li>If an order is cancelled after payment has been received, a refund will be processed in accordance with our Refund Policy.</li>
            </ul>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 4 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">4. SHIPPING AND DELIVERY</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Estimated delivery dates provided on our website are for guidance only and are not guaranteed.</li>
              <li>Delivery times may be affected by factors beyond our control, including courier delays, weather conditions, public holidays, operational disruptions, and government restrictions.</li>
              <li>Narrow Path shall not be liable for delays caused by shipping carriers or unforeseen circumstances.</li>
              <li>Ownership and risk of loss transfer to the customer once the order is handed over to the shipping provider.</li>
            </ul>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 5 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">5. EXCHANGE AND REFUNDS</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Exchanges and refunds are governed by our separate Refund and Exchange Policy. Standard catalog Plain and Printed t-shirts are eligible for exchanges within 5 days of delivery.</li>
              <li><strong>Customized & Personalized Goods:</strong> Any garment created or personalized by the customer through our Custom Studio (custom text, uploaded graphics, custom colors, or selected sizes) is bespoke and strictly non-returnable, non-exchangeable, and non-refundable once produced or shipped.</li>
              <li>Unless an item is defective, damaged, incorrect, or affected by an error on our part, customers are responsible for return shipping costs on elective exchanges.</li>
              <li>Please review our separate Refund and Exchange Policy for detailed eligibility requirements and procedures.</li>
            </ul>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 6 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">6. INTELLECTUAL PROPERTY RIGHTS</h3>
            <p className="mb-2">All content available on this website, including but not limited to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Logos</li>
              <li>Brand names</li>
              <li>Product designs</li>
              <li>Artwork</li>
              <li>Graphics</li>
              <li>Images</li>
              <li>Text</li>
              <li>Website content</li>
            </ul>
            <p className="mt-2">is the exclusive property of Narrow Path and is protected by applicable intellectual property laws.</p>
            <p>No content from this website may be copied, reproduced, modified, distributed, or used for commercial purposes without prior written consent from Narrow Path.</p>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 7 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">7. USER ACCOUNTS</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>If you create an account with us, you are responsible for maintaining the confidentiality of your login credentials and for all activities conducted through your account.</li>
              <li>You agree to:
                <ul className="list-circle pl-5 mt-1 space-y-0.5">
                  <li>Provide accurate and complete information</li>
                  <li>Keep your account information updated</li>
                  <li>Notify us immediately of any unauthorized account activity</li>
                </ul>
              </li>
              <li>Narrow Path reserves the right to suspend, restrict, or terminate accounts that violate these Terms of Service or engage in fraudulent, abusive, or unlawful activities.</li>
            </ul>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 8 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">8. LIMITATION OF LIABILITY</h3>
            <p className="mb-2">To the maximum extent permitted by law, Narrow Path shall not be liable for any indirect, incidental, consequential, special, or punitive damages arising from:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use of our website</li>
              <li>Purchase or use of our products</li>
              <li>Website interruptions or technical issues</li>
              <li>Delays in delivery</li>
            </ul>
            <p className="mt-2">All products and services are provided on an "as available" and "as is" basis.</p>
            <p>In any event, our total liability shall not exceed the amount paid by the customer for the specific product giving rise to the claim.</p>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 9 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">9. THIRD-PARTY WEBSITES AND CONTENT</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Our website may contain links to third-party websites, platforms, or social media services, including Facebook, Instagram, and other external resources.</li>
              <li>These links are provided solely for user convenience. Narrow Path does not control, endorse, or assume responsibility for the content, privacy practices, policies, or operations of third-party websites.</li>
              <li>We are also not responsible for any user-generated content shared on external platforms relating to our brand.</li>
            </ul>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 10 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">10. GOVERNING LAW AND JURISDICTION</h3>
            <p>
              These Terms of Service shall be governed and interpreted in accordance with the laws of India. Any disputes, claims, or legal proceedings arising out of or relating to these Terms or your use of the website shall be subject to the exclusive jurisdiction of the courts located in Delhi, India.
            </p>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 11 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">11. CHANGES TO THESE TERMS</h3>
            <p>
              We reserve the right to modify, update, or replace these Terms of Service at any time without prior notice. Any changes will become effective immediately upon publication on this page. Continued use of our website after such changes constitutes your acceptance of the revised Terms. We encourage users to review these Terms periodically.
            </p>
          </div>

          <hr className="border-neutral-100 my-6" />

          {/* Section 12 */}
          <div>
            <h3 className="font-black uppercase text-sm mb-3">12. CONTACT US</h3>
            <p className="mb-2">If you have any questions regarding these Terms of Service, please contact us:</p>
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
