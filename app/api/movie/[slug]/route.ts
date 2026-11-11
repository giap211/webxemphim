import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  for (const base of ["https://phimapi.com", "https://ophim.cc"]) {
    try {
      const response = await fetch(`${base}/phim/${encodeURIComponent(slug)}`, {
        headers: { Accept: "application/json", "User-Agent": "PhimLau-Mobile/1.0" },
        next: { revalidate: 900 },
      });
      if (!response.ok) continue;
      const payload = await response.json();
      if (!payload?.movie) continue;
      const movie = payload.movie;
      return NextResponse.json({
        status: true,
        source: base,
        movie: {
          slug: movie.slug, name: movie.name, originName: movie.origin_name || movie.original_name,
          content: movie.content || "", year: movie.year, time: movie.time, quality: movie.quality,
          language: movie.lang, poster: movie.poster_url, backdrop: movie.thumb_url || movie.poster_url,
          categories: movie.category || [], countries: movie.country || [], actors: movie.actor || [],
        },
        servers: (payload.episodes || []).map((server: any) => ({
          name: server.server_name || "Server",
          episodes: (server.server_data || []).map((episode: any) => ({
            name: episode.name, slug: episode.slug, embed: episode.link_embed || "", m3u8: episode.link_m3u8 || "",
          })).filter((episode: any) => episode.embed || episode.m3u8),
        })),
      }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } });
    } catch {
      // Try backup provider.
    }
  }
  return NextResponse.json({ status: false, error: "Không tìm thấy phim." }, { status: 404 });
}
