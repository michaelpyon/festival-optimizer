type NominatimSearchResult = Array<{
  lat: string;
  lon: string;
  display_name: string;
}>;

export async function geocodePlace(query: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    headers: {
      "user-agent":
        "Festival Companion Geocoder/1.0 (+https://festival-companion.local)",
      accept: "application/json",
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as NominatimSearchResult;
  const first = payload[0];

  if (!first) {
    return null;
  }

  return {
    latitude: Number(first.lat),
    longitude: Number(first.lon),
    label: first.display_name,
  };
}
