import { NextRequest, NextResponse } from "next/server";

const BASES = ["https://phimapi.com", "https://ophim.cc"];
const CDN_DEFAULT = "https://phimimg.com";

function imageUrl(value: unknown, cdn: string) {
  if (typeof value !== "string" || !value.trim()) return "";
  const raw = value.trim();
  if (raw.startsWith("//")) return "https:" + raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return cdn.replace(/\/+$/, "") + "/" + raw.replace(/^\/+/, "");
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type") || "phim-moi-cap-nhat";
  const page = Math.max(1, Number(params.get("page") || 1));
  const keyword = params.get("q")?.trim();
  const endpoint = keyword
    ? `/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=24`
    : type === "phim-moi-cap-nhat"
      ? `/danh-sach/phim-moi-cap-nhat?page=${page}`
      : `/v1/api/danh-sach/${encodeURIComponent(type)}?page=${page}`;

  for (const base of BASES) {
    try {
      const response = await fetch(base + endpoint, {
        headers: { Accept: "application/json", "User-Agent": "PhimLau-Mobile/1.0" },
        next: { revalidate: 600 },
      });
      if (!response.ok) continue;
      const payload = await response.json();
      const data = payload?.data || payload;
      const cdn = data?.APP_DOMAIN_CDN_IMAGE || data?.params?.cdnData || payload?.pathImage || CDN_DEFAULT;
      const items = Array.isArray(data?.items) ? data.items : [];
      return NextResponse.json({
        status: true,
        source: base,
        items: items.map((movie: any) => ({
          id: movie._id || movie.id || movie.slug,
          slug: movie.slug,
          name: movie.name,
          originName: movie.origin_name || movie.original_name || movie.name,
          poster: imageUrl(movie.poster_url || movie.thumb_url, cdn),
          backdrop: imageUrl(movie.thumb_url || movie.poster_url, cdn),
          year: movie.year || null,
          quality: movie.quality || "HD",
          language: movie.lang || "Vietsub",
          currentEpisode: movie.episode_current || "Full",
          tmdbId: movie.tmdb?.id || null,
          rating: movie.tmdb?.vote_average || null,
        })),
        pagination: data?.params?.pagination || payload?.pagination || null,
      }, { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" } });
    } catch {
      // Try the next catalog provider.
    }
  }
  return NextResponse.json({ status: false, items: [], error: "Không thể kết nối nguồn phim." }, { status: 502 });
}
