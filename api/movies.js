const BASES = ["https://phimapi.com", "https://ophim.cc"];
const CDN_DEFAULT = "https://phimimg.com";
function imageUrl(value, cdn) {
  if (typeof value !== "string" || !value.trim()) return "";
  const raw = value.trim();
  if (raw.startsWith("//")) return "https:" + raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return cdn.replace(/\/+$/, "") + "/" + raw.replace(/^\/+/, "");
}
module.exports = async (req, res) => {
  const params = new URL(req.url, "https://local.invalid").searchParams;
  const type = params.get("type") || "phim-moi-cap-nhat";
  const page = Math.max(1, Number(params.get("page") || 1));
  const keyword = params.get("q")?.trim();
  const endpoint = keyword
    ? "/v1/api/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&page=" + page + "&limit=24"
    : type === "phim-moi-cap-nhat"
      ? "/danh-sach/phim-moi-cap-nhat?page=" + page
      : "/v1/api/danh-sach/" + encodeURIComponent(type) + "?page=" + page;
  for (const base of BASES) {
    try {
      const response = await fetch(base + endpoint, { headers: { Accept: "application/json", "User-Agent": "PhimLau-Mobile/1.0" } });
      if (!response.ok) continue;
      const payload = await response.json();
      const data = payload?.data || payload;
      const cdn = data?.APP_DOMAIN_CDN_IMAGE || data?.params?.cdnData || payload?.pathImage || CDN_DEFAULT;
      const items = Array.isArray(data?.items) ? data.items : [];
      res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1800");
      return res.status(200).json({ status: true, source: base, items: items.map(movie => ({
        id: movie._id || movie.id || movie.slug, slug: movie.slug, name: movie.name,
        originName: movie.origin_name || movie.original_name || movie.name,
        poster: imageUrl(movie.poster_url || movie.thumb_url, cdn),
        backdrop: imageUrl(movie.thumb_url || movie.poster_url, cdn),
        year: movie.year || null, quality: movie.quality || "HD", language: movie.lang || "Vietsub",
        currentEpisode: movie.episode_current || "Full", tmdbId: movie.tmdb?.id || null, rating: movie.tmdb?.vote_average || null
      })), pagination: data?.params?.pagination || payload?.pagination || null });
    } catch (_) {}
  }
  return res.status(502).json({ status: false, items: [], error: "Không thể kết nối nguồn phim." });
};
