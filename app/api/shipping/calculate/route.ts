import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { destPin, weightGrams, paymentType } = await req.json();

    if (!destPin) {
      return NextResponse.json({ error: "Destination PIN is required" }, { status: 400 });
    }

    // Narrow Path origin warehouse (Replace with your actual registered pickup PIN)
    const originPin = "110095"; // Updated to match our actual origin PIN
    
    // Delhivery expects weight in grams. Minimum is usually 500g for standard parcels.
    const actualWeight = Math.max(weightGrams || 500, 500); 

    const ptType = "Pre-paid";

    const delhiveryUrl = `${process.env.DELHIVERY_BASE_URL}/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=${destPin}&o_pin=${originPin}&cgm=${actualWeight}&pt=${ptType}`;

    const response = await fetch(delhiveryUrl, {
      method: "GET",
      headers: {
        "Authorization": `Token ${process.env.DELHIVERY_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data[0]?.total_amount) {
       console.error("Delhivery Pricing Error:", data);
       throw new Error("Failed to calculate shipping");
    }

    // Delhivery returns an array of possible charges, we take the standard total amount
    const shippingFee = data[0].total_amount;

    return NextResponse.json({ fee: Math.ceil(shippingFee) }, { status: 200 });

  } catch (error: any) {
    console.error("Shipping Calc Error:", error);
    // Fallback flat rate just in case the API goes down so you don't lose the sale
    return NextResponse.json({ fee: 100, isFallback: true }, { status: 200 }); 
  }
}