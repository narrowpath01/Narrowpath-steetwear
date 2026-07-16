import prisma from "./db";

/**
 * Helper to format phone to E.164 (country code +91 for India if not already present)
 */
function formatE164Phone(phoneNumber: string): string {
  let formatted = phoneNumber.replace(/\D/g, "");
  if (formatted.length === 10) {
    formatted = `91${formatted}`;
  }
  if (!formatted.startsWith("+")) {
    formatted = `+${formatted}`;
  }
  return formatted;
}

/**
 * Helper to build details string for order items
 */
function buildItemsString(items: any[]): string {
  if (!items || items.length === 0) {
    return "- No items found";
  }
  return items.map(item => {
    const prodTitle = item.variant?.product?.title || "Unknown Product";
    const varTitle = item.variant?.title || "Standard";
    return `- ${prodTitle} (Size: ${varTitle}) x${item.quantity}`;
  }).join("\n");
}

/**
 * Sends a WhatsApp notification to the customer when an order is created and manifested in Delhivery.
 */
export async function sendWhatsAppNotification(orderId: string, trackingNumber: string) {
  try {
    // 1. Fetch Order, Address, and Item details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!order || !order.address) {
      console.error(`[WhatsApp API] Order ${orderId} or Address record not found.`);
      return;
    }

    const customerPhone = order.address.phoneNumber;
    if (!customerPhone) {
      console.error(`[WhatsApp API] Customer phone number is missing for order ${orderId}.`);
      return;
    }

    const formattedPhone = formatE164Phone(customerPhone);
    const shortOrderId = orderId.slice(-8).toUpperCase();
    const amountStr = `INR ${order.amount}`;
    const itemsStr = buildItemsString(order.items);
    const customerName = `${order.address.firstName} ${order.address.lastName}`;
    const fullAddress = `${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.pinCode}`;

    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    const messageText = 
      `*NARROW PATH*\n\n` +
      `Hi ${customerName},\n` +
      `Your order *#${shortOrderId}* has been confirmed!\n\n` +
      `*Order Details:*\n` +
      `${itemsStr}\n\n` +
      `*Delivery Address:*\n` +
      `${fullAddress}\n\n` +
      `*Tracking Info:*\n` +
      `- Courier: Delhivery\n` +
      `- Tracking AWB: ${trackingNumber}\n\n` +
      `We've shipped your package. You can track its movement directly in your dashboard.\n\n` +
      `Thank you for choosing Narrow Path.`;

    if (!token || !phoneNumberId) {
      console.log(`\n--- [WHATSAPP NOTIFICATION MOCK SEND (CUSTOMER CONFIRMATION)] ---`);
      console.log(`From Number ID: ${phoneNumberId || "MOCK_SENDER_ID"}`);
      console.log(`To Number:      ${formattedPhone}`);
      console.log(`Message:\n${messageText}`);
      console.log(`------------------------------------------------------------------\n`);
      return;
    }

    // Official Meta WhatsApp Business API Request
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    
    // Fallback: If WHATSAPP_USE_TEMPLATE is disabled, send custom text, otherwise template
    const useTemplate = process.env.WHATSAPP_USE_TEMPLATE === "true";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        useTemplate 
          ? {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: formattedPhone,
              type: "template",
              template: {
                name: "order_confirmation",
                language: { code: "en" },
                components: [
                  {
                    type: "body",
                    parameters: [
                      { type: "text", text: shortOrderId },
                      { type: "text", text: amountStr },
                      { type: "text", text: trackingNumber }
                    ]
                  }
                ]
              }
            }
          : {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: formattedPhone,
              type: "text",
              text: {
                preview_url: false,
                body: messageText
              }
            }
      )
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`[WhatsApp API Error]:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`[WhatsApp API Success]: Confirmation sent to ${formattedPhone}. Message ID: ${data.messages?.[0]?.id}`);
    }

  } catch (error) {
    console.error(`[WhatsApp API Exception]:`, error);
  }
}

/**
 * Sends a WhatsApp notification to the store owner (+91 9818891540) when a new order is paid.
 */
export async function sendOwnerWhatsAppNotification(orderId: string, trackingNumber?: string | null) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!order || !order.address) {
      console.error(`[WhatsApp Owner API] Order ${orderId} or Address record not found.`);
      return;
    }

    const shortOrderId = orderId.slice(-8).toUpperCase();
    const amountStr = `INR ${order.amount}`;
    const ownerPhone = formatE164Phone(process.env.WHATSAPP_OWNER_PHONE || "+919818891540");
    const itemsStr = buildItemsString(order.items);

    const messageText = 
      `*NARROW PATH - NEW ORDER RECEIVED!*\n\n` +
      `Order *#${shortOrderId}* has been successfully paid and created!\n\n` +
      `*Order Items:*\n` +
      `${itemsStr}\n\n` +
      `*Details:*\n` +
      `- Amount: ${amountStr}\n` +
      `- Customer: ${order.address.firstName} ${order.address.lastName}\n` +
      `- Phone: ${order.address.phoneNumber}\n` +
      `- City/State: ${order.address.city}, ${order.address.state}\n` +
      `- Address: ${order.address.street}\n` +
      `- AWB/Tracking: ${trackingNumber || "Manifest pending or failed"}\n\n` +
      `Please prepare the shipment. Delhivery manifest has been generated automatically.`;

    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      console.log(`\n--- [WHATSAPP OWNER NOTIFICATION MOCK SEND] ---`);
      console.log(`To Owner Number: ${ownerPhone}`);
      console.log(`Message:\n${messageText}`);
      console.log(`----------------------------------------------\n`);
      return;
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: ownerPhone,
        type: "text",
        text: {
          preview_url: false,
          body: messageText
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`[WhatsApp Owner API Error]:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`[WhatsApp Owner API Success]: Notification sent to owner. Message ID: ${data.messages?.[0]?.id}`);
    }

  } catch (error) {
    console.error(`[WhatsApp Owner API Exception]:`, error);
  }
}

/**
 * Sends an order cancellation notification to the customer when they cancel an order.
 */
export async function sendCustomerWhatsAppCancellation(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!order || !order.address) {
      console.error(`[WhatsApp API] Order ${orderId} or Address record not found for cancellation.`);
      return;
    }

    const customerPhone = order.address.phoneNumber;
    if (!customerPhone) return;

    const formattedPhone = formatE164Phone(customerPhone);
    const shortOrderId = orderId.slice(-8).toUpperCase();
    const itemsStr = buildItemsString(order.items);
    const customerName = `${order.address.firstName} ${order.address.lastName}`;

    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    const messageText = 
      `*NARROW PATH - ORDER CANCELLED*\n\n` +
      `Hi ${customerName},\n` +
      `Your order *#${shortOrderId}* has been successfully cancelled.\n\n` +
      `*Cancelled Items:*\n` +
      `${itemsStr}\n\n` +
      `We have initiated a refund of INR ${order.amount} back to your original payment method. It should reflect in your account within 5-7 business days.\n\n` +
      `We hope to serve you again soon!\n\n` +
      `Narrow Path Support`;

    if (!token || !phoneNumberId) {
      console.log(`\n--- [WHATSAPP NOTIFICATION MOCK SEND (CUSTOMER CANCELLATION)] ---`);
      console.log(`To Number: ${formattedPhone}`);
      console.log(`Message:\n${messageText}`);
      console.log(`-----------------------------------------------------------------\n`);
      return;
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const useTemplate = process.env.WHATSAPP_USE_TEMPLATE === "true";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        useTemplate 
          ? {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: formattedPhone,
              type: "template",
              template: {
                name: "order_cancellation",
                language: { code: "en" },
                components: [
                  {
                    type: "body",
                    parameters: [
                      { type: "text", text: shortOrderId },
                      { type: "text", text: `INR ${order.amount}` }
                    ]
                  }
                ]
              }
            }
          : {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: formattedPhone,
              type: "text",
              text: {
                preview_url: false,
                body: messageText
              }
            }
      )
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`[WhatsApp API Error (Customer Cancellation)]`, JSON.stringify(data, null, 2));
    } else {
      console.log(`[WhatsApp API Success]: Cancellation sent to customer. Message ID: ${data.messages?.[0]?.id}`);
    }

  } catch (error) {
    console.error(`[WhatsApp API Cancellation Exception]`, error);
  }
}

/**
 * Sends an order cancellation notification to the store owner when an order is cancelled.
 */
export async function sendOwnerWhatsAppCancellation(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!order || !order.address) return;

    const shortOrderId = orderId.slice(-8).toUpperCase();
    const amountStr = `INR ${order.amount}`;
    const ownerPhone = formatE164Phone(process.env.WHATSAPP_OWNER_PHONE || "+919818891540");
    const itemsStr = buildItemsString(order.items);
    const customerName = `${order.address.firstName} ${order.address.lastName}`;

    const messageText = 
      `*NARROW PATH - ORDER CANCELLED BY CUSTOMER*\n\n` +
      `Order *#${shortOrderId}* has been cancelled by the customer within the 15-minute window.\n\n` +
      `*Cancelled Items:*\n` +
      `${itemsStr}\n\n` +
      `*Details:*\n` +
      `- Amount: ${amountStr}\n` +
      `- Customer: ${customerName}\n` +
      `- Phone: ${order.address.phoneNumber}\n\n` +
      `Please stop shipment processing for this order.`;

    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      console.log(`\n--- [WHATSAPP OWNER NOTIFICATION MOCK SEND (CANCELLATION)] ---`);
      console.log(`To Owner Number: ${ownerPhone}`);
      console.log(`Message:\n${messageText}`);
      console.log(`--------------------------------------------------------------\n`);
      return;
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: ownerPhone,
        type: "text",
        text: {
          preview_url: false,
          body: messageText
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`[WhatsApp Owner API Error (Cancellation)]`, JSON.stringify(data, null, 2));
    } else {
      console.log(`[WhatsApp Owner API Success]: Cancellation sent to owner. Message ID: ${data.messages?.[0]?.id}`);
    }

  } catch (error) {
    console.error(`[WhatsApp Owner API Cancellation Exception]`, error);
  }
}
