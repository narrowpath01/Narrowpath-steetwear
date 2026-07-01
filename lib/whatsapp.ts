import prisma from "./db";

/**
 * Sends a WhatsApp notification to the customer when an order is created and manifested in Delhivery.
 * Uses Meta's WhatsApp Business Cloud API if WHATSAPP_API_TOKEN is configured; 
 * falls back to logging the message in development mode.
 */
export async function sendWhatsAppNotification(orderId: string, trackingNumber: string) {
  try {
    // 1. Fetch Order and Address details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { address: true }
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

    // Format phone to E.164 (ensure country code +91 for India if not already present)
    let formattedPhone = customerPhone.replace(/\D/g, "");
    if (formattedPhone.length === 10) {
      formattedPhone = `91${formattedPhone}`;
    }
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+${formattedPhone}`;
    }

    const shortOrderId = orderId.slice(-8).toUpperCase();
    const amountStr = `INR ${order.amount}`;

    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID; // Meta Phone Number ID (from the +91 9315457852 number console config)

    const messageText = 
      `*NARROW PATH*\n\n` +
      `Your order *#${shortOrderId}* has been confirmed!\n\n` +
      `*Order Details:*\n` +
      `- Total: ${amountStr}\n` +
      `- Delivery: Delhivery\n` +
      `- Tracking AWB: ${trackingNumber}\n\n` +
      `We've shipped your package. You can track its movement directly in your dashboard.\n\n` +
      `Thank you for choosing Narrow Path.`;

    if (!token || !phoneNumberId) {
      console.log(`\n--- [WHATSAPP NOTIFICATION MOCK SEND] ---`);
      console.log(`From Number: +91 9315457852`);
      console.log(`To Number:   ${formattedPhone}`);
      console.log(`Message:\n${messageText}`);
      console.log(`-----------------------------------------\n`);
      return;
    }

    // Official Meta WhatsApp Business API Request
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    
    // We send a template message as outbound notifications require approved templates in Meta.
    // Standard template name is "order_confirmation" with parameters: [OrderId, Amount, AWB]
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
      })
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
 * Sends a WhatsApp notification to the store owner (+91 9315457852) when a new order is paid.
 */
export async function sendOwnerWhatsAppNotification(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        address: true,
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
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
    const ownerPhone = "+919315457852";

    // Format the items list
    let itemsStr = "";
    if (order.items && order.items.length > 0) {
      itemsStr = order.items.map(item => {
        const prodTitle = item.variant?.product?.title || "Unknown Product";
        const varTitle = item.variant?.title || "Standard";
        return `- ${prodTitle} (${varTitle}) x${item.quantity}`;
      }).join("\n");
    } else {
      itemsStr = "- No items found";
    }

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
      `- Address: ${order.address.street}\n\n` +
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
