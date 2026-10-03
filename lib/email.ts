import { Resend } from "resend";
import prisma from "@/lib/db";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Sender configuration: defaults to Resend's verified onboarding domain unless a custom domain is configured
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Narrow Path <onboarding@resend.dev>";
const STORE_NAME = "Narrow Path";

/**
 * Format a number to INR currency string (e.g. ₹1,299)
 */
function formatCurrency(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/**
 * Sends both Admin New Order and Customer Order Confirmation emails via Resend.
 * Executes server-side only after payment has been verified and confirmed as PAID.
 * Uses NotificationLog idempotency keys to guarantee no duplicate emails are sent.
 */
export async function sendOrderConfirmationEmails(orderId: string): Promise<void> {
  try {
    // 1. Fetch complete order record with address, user, and items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        address: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { id: true, title: true, handle: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      console.warn(`[Resend Email]: Order #${orderId} not found in database. Skipping email.`);
      return;
    }

    // 2. Strict verification: Only send confirmation emails for genuinely PAID orders
    const isPaid = order.status === "PAID" || order.paymentStatus === "PAID";
    if (!isPaid) {
      console.warn(
        `[Resend Email]: Order #${orderId} status is ${order.status}/${order.paymentStatus} (not PAID). Skipping confirmation email.`
      );
      return;
    }

    if (!resend) {
      console.warn(
        "[Resend Email]: RESEND_API_KEY is not configured in .env. Skipping email dispatch."
      );
      return;
    }

    const customerEmail = order.address?.email || order.user?.email;
    const customerName =
      [order.address?.firstName, order.address?.lastName].filter(Boolean).join(" ").trim() ||
      order.user?.name ||
      "Customer";
    const customerPhone = order.address?.phoneNumber || order.user?.phone || "—";
    const adminEmail = process.env.ADMIN_EMAIL || "narrowpathtshirts@gmail.com";

    const formattedDate = new Date(order.createdAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });

    const itemsSubtotal = order.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const shippingCharge = "FREE";
    const totalAmount = formatCurrency(order.amount);

    const addressText = order.address
      ? `${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.pinCode}, India`
      : "No physical address provided";

    // -------------------------------------------------------------
    // A. CUSTOMER ORDER CONFIRMATION EMAIL
    // -------------------------------------------------------------
    if (customerEmail) {
      const customerIdempotencyKey = `ORDER_${order.id}_CUSTOMER_CONFIRMATION_EMAIL`;

      // Check duplicate prevention in NotificationLog
      const alreadySent = await prisma.notificationLog.findUnique({
        where: { idempotencyKey: customerIdempotencyKey },
      });

      if (alreadySent && alreadySent.status === "SENT") {
        console.log(`[Resend Email]: Customer confirmation for order #${order.id} already sent. Skipping duplicate.`);
      } else {
        try {
          const customerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f7f7; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase;">
                ${STORE_NAME}
              </h1>
              <p style="margin: 6px 0 0 0; color: #a3a3a3; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;">
                Payment Verified &bull; Order Confirmed
              </p>
            </td>
          </tr>

          <!-- Greeting & Order Info -->
          <tr>
            <td style="padding: 32px 32px 20px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #111111;">
                Thank you for your order, ${customerName}!
              </h2>
              <p style="margin: 0; font-size: 14px; line-height: 22px; color: #555555;">
                Your online payment has been confirmed via Razorpay. We are now preparing your garment for dispatch.
              </p>

              <table role="presentation" width="100%" style="margin-top: 20px; background-color: #fafafa; border: 1px solid #eeeeee; border-radius: 8px; padding: 14px 16px;">
                <tr>
                  <td style="font-size: 12px; color: #666666;">Order Number:</td>
                  <td align="right" style="font-size: 13px; font-weight: 700; font-family: monospace; color: #000000;">#${order.id}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #666666; padding-top: 6px;">Date Placed:</td>
                  <td align="right" style="font-size: 12px; color: #111111; padding-top: 6px;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #666666; padding-top: 6px;">Payment Status:</td>
                  <td align="right" style="font-size: 12px; font-weight: 700; color: #15803d; padding-top: 6px;">PAID (ONLINE)</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <h3 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #111111;">
                Ordered Apparel
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                ${order.items
                  .map(
                    (item) => `
                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 12px 0; vertical-align: top;">
                    <div style="font-size: 13px; font-weight: 600; color: #111111;">
                      ${item.variant?.product?.title || "Apparel Item"}
                    </div>
                    <div style="font-size: 11px; color: #777777; margin-top: 2px;">
                      Size: <strong>${item.variant?.title || "Standard"}</strong> &bull; Qty: ${item.quantity}
                    </div>
                  </td>
                  <td align="right" style="padding: 12px 0; vertical-align: top; font-size: 13px; font-weight: 700; font-family: monospace; color: #111111;">
                    ${formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
                `
                  )
                  .join("")}
              </table>

              <!-- Totals -->
              <table role="presentation" width="100%" style="margin-top: 16px; border-top: 2px solid #111111; padding-top: 12px;">
                <tr>
                  <td style="font-size: 13px; color: #666666;">Subtotal:</td>
                  <td align="right" style="font-size: 13px; font-family: monospace; color: #111111;">${formatCurrency(itemsSubtotal)}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #666666; padding-top: 6px;">Shipping:</td>
                  <td align="right" style="font-size: 13px; font-weight: 600; color: #15803d; padding-top: 6px;">${shippingCharge}</td>
                </tr>
                <tr>
                  <td style="font-size: 15px; font-weight: 800; color: #111111; padding-top: 10px;">Total Paid:</td>
                  <td align="right" style="font-size: 16px; font-weight: 800; font-family: monospace; color: #000000; padding-top: 10px;">${totalAmount}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <div style="background-color: #fafafa; border: 1px solid #eeeeee; border-radius: 8px; padding: 16px;">
                <h4 style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #666666;">
                  Shipping Destination
                </h4>
                <p style="margin: 0; font-size: 13px; line-height: 20px; color: #222222;">
                  <strong>${customerName}</strong><br>
                  ${addressText}<br>
                  Phone: ${customerPhone}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fcfcfc; border-top: 1px solid #eeeeee; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #888888;">
                If you have questions about your order, reply directly to this email or contact support.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #aaaaaa;">
                &copy; ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `;

          const customerText = `Thank you for your order, ${customerName}!\n\n` +
            `Order Number: #${order.id}\n` +
            `Date: ${formattedDate}\n` +
            `Payment Status: PAID (ONLINE)\n\n` +
            `Items:\n` +
            order.items
              .map(
                (item) =>
                  `- ${item.variant?.product?.title || "Item"} (Size: ${item.variant?.title || "Standard"}, Qty: ${item.quantity}) - ${formatCurrency(item.price * item.quantity)}`
              )
              .join("\n") +
            `\n\nTotal Paid: ${totalAmount}\n` +
            `Shipping Destination: ${addressText}\n\n` +
            `Thank you for shopping with ${STORE_NAME}.`;

          const sendResult = await resend.emails.send({
            from: FROM_EMAIL,
            to: customerEmail,
            subject: `Order Confirmed - #${order.id}`,
            html: customerHtml,
            text: customerText,
          });

          await prisma.notificationLog.create({
            data: {
              channel: "EMAIL",
              recipient: customerEmail,
              event: "ORDER_CONFIRMATION",
              orderId: order.id,
              status: "SENT",
              provider: "RESEND",
              providerMessageId: sendResult.data?.id || null,
              idempotencyKey: customerIdempotencyKey,
            },
          });

          console.log(`[Resend Email]: Customer confirmation email sent to ${customerEmail} (ID: ${sendResult.data?.id || "ok"})`);
        } catch (custEmailErr: any) {
          console.error(`[Resend Email]: Failed to send customer confirmation email for order #${order.id}:`, custEmailErr);
          await prisma.notificationLog.create({
            data: {
              channel: "EMAIL",
              recipient: customerEmail,
              event: "ORDER_CONFIRMATION",
              orderId: order.id,
              status: "FAILED",
              provider: "RESEND",
              error: custEmailErr?.message || "Unknown error",
              idempotencyKey: customerIdempotencyKey,
            },
          }).catch(() => null);
        }
      }
    }

    // -------------------------------------------------------------
    // B. ADMIN NEW ORDER EMAIL
    // -------------------------------------------------------------
    if (adminEmail) {
      const adminIdempotencyKey = `ORDER_${order.id}_ADMIN_NEW_ORDER_EMAIL`;

      const alreadySentAdmin = await prisma.notificationLog.findUnique({
        where: { idempotencyKey: adminIdempotencyKey },
      });

      if (alreadySentAdmin && alreadySentAdmin.status === "SENT") {
        console.log(`[Resend Email]: Admin notification for order #${order.id} already sent. Skipping duplicate.`);
      } else {
        try {
          const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order #${order.id}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f7f7; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 24px 32px; text-align: left;">
              <span style="background-color: #15803d; color: #ffffff; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">
                PAID ORDER
              </span>
              <h1 style="margin: 12px 0 0 0; color: #ffffff; font-size: 20px; font-weight: 800; font-family: monospace;">
                New Order #${order.id}
              </h1>
              <p style="margin: 4px 0 0 0; color: #a3a3a3; font-size: 12px;">
                ${formattedDate} &bull; ${STORE_NAME} Admin Alert
              </p>
            </td>
          </tr>

          <!-- Customer Overview -->
          <tr>
            <td style="padding: 24px 32px 16px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #666666;">
                Customer & Payment Details
              </h2>
              <table role="presentation" width="100%" style="background-color: #fafafa; border: 1px solid #eeeeee; border-radius: 8px; padding: 14px 16px; font-size: 13px;">
                <tr>
                  <td style="color: #666666; padding-bottom: 6px;">Customer Name:</td>
                  <td align="right" style="font-weight: 700; color: #111111; padding-bottom: 6px;">${customerName}</td>
                </tr>
                <tr>
                  <td style="color: #666666; padding-bottom: 6px;">Email Address:</td>
                  <td align="right" style="color: #111111; padding-bottom: 6px;">${customerEmail || "—"}</td>
                </tr>
                <tr>
                  <td style="color: #666666; padding-bottom: 6px;">Contact Phone:</td>
                  <td align="right" style="font-family: monospace; color: #111111; padding-bottom: 6px;">${customerPhone}</td>
                </tr>
                <tr>
                  <td style="color: #666666; padding-bottom: 6px;">Payment Method:</td>
                  <td align="right" style="font-weight: 700; color: #111111; padding-bottom: 6px;">Razorpay (Prepaid)</td>
                </tr>
                <tr>
                  <td style="color: #666666; padding-bottom: 6px;">Payment Status:</td>
                  <td align="right" style="font-weight: 700; color: #15803d; padding-bottom: 6px;">PAID</td>
                </tr>
                ${
                  order.razorpayPaymentId
                    ? `
                <tr>
                  <td style="color: #666666;">Razorpay Payment ID:</td>
                  <td align="right" style="font-family: monospace; font-size: 11px; color: #111111;">${order.razorpayPaymentId}</td>
                </tr>
                `
                    : ""
                }
              </table>
            </td>
          </tr>

          <!-- Items Ordered -->
          <tr>
            <td style="padding: 8px 32px 20px 32px;">
              <h2 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #666666;">
                Ordered Garments (${order.items.length})
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                ${order.items
                  .map(
                    (item) => `
                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; vertical-align: top;">
                    <div style="font-size: 13px; font-weight: 600; color: #111111;">
                      ${item.variant?.product?.title || "Product"}
                    </div>
                    <div style="font-size: 11px; color: #777777; margin-top: 2px;">
                      Size: <strong>${item.variant?.title || "Standard"}</strong>
                      ${item.variant?.sku ? ` &bull; SKU: ${item.variant.sku}` : ""}
                      &bull; Qty: ${item.quantity}
                    </div>
                  </td>
                  <td align="right" style="padding: 10px 0; vertical-align: top; font-size: 13px; font-weight: 700; font-family: monospace; color: #111111;">
                    ${formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
                `
                  )
                  .join("")}
              </table>

              <!-- Financial Summary -->
              <table role="presentation" width="100%" style="margin-top: 16px; border-top: 2px solid #111111; padding-top: 12px; font-size: 13px;">
                <tr>
                  <td style="color: #666666;">Items Subtotal:</td>
                  <td align="right" style="font-family: monospace; color: #111111;">${formatCurrency(itemsSubtotal)}</td>
                </tr>
                <tr>
                  <td style="color: #666666; padding-top: 6px;">Shipping:</td>
                  <td align="right" style="font-weight: 600; color: #15803d; padding-top: 6px;">${shippingCharge}</td>
                </tr>
                <tr>
                  <td style="font-size: 15px; font-weight: 800; color: #111111; padding-top: 10px;">Total Revenue:</td>
                  <td align="right" style="font-size: 16px; font-weight: 800; font-family: monospace; color: #000000; padding-top: 10px;">${totalAmount}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Destination -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <div style="background-color: #fafafa; border: 1px solid #eeeeee; border-radius: 8px; padding: 14px 16px;">
                <h4 style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #666666;">
                  Delivery Address
                </h4>
                <p style="margin: 0; font-size: 13px; line-height: 20px; color: #222222;">
                  <strong>${customerName}</strong><br>
                  ${addressText}<br>
                  Phone: ${customerPhone}
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fcfcfc; border-top: 1px solid #eeeeee; padding: 16px 32px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #888888;">
                Automated operations alert from ${STORE_NAME} Commerce Engine.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `;

          const adminText = `New Order Received: #${order.id}\n` +
            `Placed at: ${formattedDate}\n\n` +
            `Customer: ${customerName}\n` +
            `Email: ${customerEmail || "—"}\n` +
            `Phone: ${customerPhone}\n\n` +
            `Payment: Razorpay (Prepaid) - PAID\n` +
            (order.razorpayPaymentId ? `Razorpay Payment ID: ${order.razorpayPaymentId}\n` : "") +
            `\nItems:\n` +
            order.items
              .map(
                (item) =>
                  `- ${item.variant?.product?.title || "Item"} (Size: ${item.variant?.title || "Standard"}, Qty: ${item.quantity}) - ${formatCurrency(item.price * item.quantity)}`
              )
              .join("\n") +
            `\n\nTotal: ${totalAmount}\n` +
            `Shipping Address: ${addressText}`;

          const sendAdminResult = await resend.emails.send({
            from: FROM_EMAIL,
            to: adminEmail,
            subject: `New Order #${order.id}`,
            html: adminHtml,
            text: adminText,
          });

          await prisma.notificationLog.create({
            data: {
              channel: "EMAIL",
              recipient: adminEmail,
              event: "ADMIN_NEW_ORDER",
              orderId: order.id,
              status: "SENT",
              provider: "RESEND",
              providerMessageId: sendAdminResult.data?.id || null,
              idempotencyKey: adminIdempotencyKey,
            },
          });

          console.log(`[Resend Email]: Admin new order email sent to ${adminEmail} (ID: ${sendAdminResult.data?.id || "ok"})`);
        } catch (adminEmailErr: any) {
          console.error(`[Resend Email]: Failed to send admin new order email for order #${order.id}:`, adminEmailErr);
          await prisma.notificationLog.create({
            data: {
              channel: "EMAIL",
              recipient: adminEmail,
              event: "ADMIN_NEW_ORDER",
              orderId: order.id,
              status: "FAILED",
              provider: "RESEND",
              error: adminEmailErr?.message || "Unknown error",
              idempotencyKey: adminIdempotencyKey,
            },
          }).catch(() => null);
        }
      }
    }
  } catch (err: any) {
    // Top-level catch ensures an email dispatch failure never crashes the calling order verification
    console.error(`[Resend Email]: Top-level error in sendOrderConfirmationEmails for order #${orderId}:`, err);
  }
}
