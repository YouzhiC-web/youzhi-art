import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const revalidate = 1800; // cache for 30 min

// fetch helper with 5 s timeout
async function fetchHTML(url: string): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        "accept-language": "en-US,en;q=0.9",
        referer: "https://www.google.com/",
      },
      cache: "force-cache",
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return await res.text();
  } catch {
    clearTimeout(t);
    return "";
  }
}

// quick-n-dirty text extractor
function extract(html: string): string[] {
  if (!html) return [];
  const $ = cheerio.load(html);
  const list: string[] = [];
  $("h1,h2,h3,h4,a,strong,p,span,li").each((_i, el) => {
    const t = $(el).text().trim().replace(/\s+/g, " ");
    if (/(%|off|sale|deal|clearance|save|outlet)/i.test(t) && t.length < 120 && t.length > 12)
      list.push(t);
  });
  return [...new Set(list)].slice(0, 8);
}

export async function GET() {
  const src = {
    rei: "https://www.rei.com/outlet",
    moosejaw: "https://www.moosejaw.com/content/sale",
    backcountry: "https://www.backcountry.com/sc/current-deals",
  };

  const [rei, moose, back] = await Promise.all([
    fetchHTML(src.rei),
    fetchHTML(src.moosejaw),
    fetchHTML(src.backcountry),
  ]);

  return NextResponse.json({
    success: true,
    deals: {
      rei: extract(rei).length ? extract(rei) : ["Visit REI Outlet for current offers."],
      moosejaw: extract(moose).length ? extract(moose) : ["See Moosejaw’s Sale page for live deals."],
      backcountry: extract(back).length
        ? extract(back)
        : ["See Backcountry’s current-deals section for discounts."],
    },
  });
}
