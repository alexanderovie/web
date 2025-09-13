import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const place_id = searchParams.get("place_id");

  if (!place_id) {
    return NextResponse.json({ error: "Missing place_id" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Google Places API key" },
      { status: 500 },
    );
  }

  // Request richer fields to derive category, city, and coordinates
  const url = `https://places.googleapis.com/v1/places/${place_id}?fields=id,displayName,formattedAddress,internationalPhoneNumber,websiteUri,primaryTypeDisplayName,types,addressComponents,location&key=${apiKey}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || "Google Places API error" },
        { status: 500 },
      );
    }

    const data = await response.json();

    // Extract city/region/country from addressComponents when possible
    const components: Array<{
      longText?: string;
      shortText?: string;
      types?: string[];
    }> = data.addressComponents || [];
    const findComp = (t: string) =>
      components.find((c) => c.types?.includes(t));
    const cityComp =
      findComp("locality") ||
      findComp("postal_town") ||
      findComp("administrative_area_level_2");
    const regionComp = findComp("administrative_area_level_1");
    const countryComp = findComp("country");

    const city = cityComp?.longText || "";
    const region = regionComp?.longText || "";
    const country = countryComp?.longText || "";

    const category =
      data.primaryTypeDisplayName?.text ||
      (Array.isArray(data.types) ? data.types[0] : "") ||
      "";

    const lat = data.location?.latitude ?? null;
    const lng = data.location?.longitude ?? null;

    return NextResponse.json({
      name: data.displayName?.text || "",
      address: data.formattedAddress || "",
      phone: data.internationalPhoneNumber || "",
      website: data.websiteUri || "",
      category,
      city,
      region,
      country,
      lat,
      lng,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
