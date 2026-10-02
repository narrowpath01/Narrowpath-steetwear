import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pinCode = searchParams.get("pin");

  if (!pinCode) {
    return NextResponse.json({ error: "PIN code is required" }, { status: 400 });
  }

  try {
    const delhiveryUrl = `${process.env.DELHIVERY_BASE_URL}/c/api/pin-codes/json/?filter_codes=${pinCode}`;
    
    const response = await fetch(delhiveryUrl, {
      method: "GET",
      headers: {
        "Authorization": `Token ${process.env.DELHIVERY_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to check serviceability");
    }

    // Delhivery usually returns an array of objects for matching pincodes
    if (data && data.delivery_codes && data.delivery_codes.length > 0) {
        const details = data.delivery_codes[0].postal_code;
        return NextResponse.json({ 
            serviceable: true, 
            details: details 
        }, { status: 200 });
    } else {
        return NextResponse.json({ serviceable: false }, { status: 200 });
    }

  } catch (error) {
    console.error("Delhivery Serviceability Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}