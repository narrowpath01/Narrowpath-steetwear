import prisma from "./db";

export async function createDelhiveryShipment(orderId: string) {
    // 1. Fetch Order Details from DB
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
        throw new Error("Order or Address not found");
    }

    const isCod = order.status === "COD_PENDING";

    // 2. Format Payload for Delhivery
    const payload = {
        format: "json",
        data: JSON.stringify({
            shipments: [
                {
                    add: order.address.street, // Client address
                    city: order.address.city,
                    state: order.address.state,
                    country: "India",
                    pin: order.address.pinCode,
                    name: `${order.address.firstName} ${order.address.lastName}`,
                    phone: order.address.phoneNumber || "9999999999",
                    order: order.id, // Your internal order ID
                    payment_mode: isCod ? "COD" : "Pre-paid",
                    return_pin: "110095", // Warehouse PIN
                    return_city: "New Delhi",
                    return_phone: "9894781426",
                    return_add: "Ground Floor, S/o Kishori Lal, B-250, Gali No-6, New Seemapuri, Shahdara",
                    return_state: "Delhi",
                    return_country: "India",
                    products_desc: order.items.map(item => item.variant.product.title).join(", "),
                    hsn_code: "61091000",
                    cod_amount: isCod ? order.amount : 0,
                    order_date: order.createdAt.toISOString(),
                    total_amount: order.amount,
                    seller_add: "Ground Floor, S/o Kishori Lal, B-250, Gali No-6, New Seemapuri, Shahdara",
                    seller_name: "Narrow Path",
                    seller_inv: order.id,
                    quantity: order.items.reduce((acc, item) => acc + item.quantity, 0),
                    waybill: "" // Leave blank, Delhivery will assign one
                }
            ],
            pickup_location: {
                name: "Narrow Path HQ", // Registered warehouse name in Delhivery
                add: "Ground Floor, S/o Kishori Lal, B-250, Gali No-6, New Seemapuri, Shahdara",
                city: "New Delhi",
                pin: "110095",
                country: "India",
                phone: "9894781426"
            }
        })
    };

    // 3. Make the API Call
    const delhiveryUrl = `${process.env.DELHIVERY_BASE_URL}/api/cmu/create.json`;

    const formParams = new URLSearchParams();
    formParams.append("format", payload.format);
    formParams.append("data", payload.data);

    console.log(`Sending shipment request to Delhivery for order ${orderId} (${isCod ? 'COD' : 'Prepaid'})...`);
    const response = await fetch(delhiveryUrl, {
        method: "POST",
        headers: {
            "Authorization": `Token ${process.env.DELHIVERY_API_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formParams
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.success) {
        console.error("Delhivery Creation Error Details:", JSON.stringify(responseData, null, 2));
        throw new Error(responseData.packages?.[0]?.remarks?.[0] || responseData.remarks?.[0] || responseData.error || "Failed to create shipment");
    }

    const waybill = responseData.packages[0].waybill;
    console.log(`Shipment created successfully. Waybill: ${waybill}`);

    // 4. Update the DB order
    await prisma.order.update({
        where: { id: orderId },
        data: { 
            trackingNumber: waybill, 
            awb: waybill, // Update both trackingNumber and awb for frontend
            shippingStatus: "Manifested" 
        }
    });

    return waybill;
}
