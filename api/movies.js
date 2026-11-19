const SOURCES = ["https://phimapi.com", "https://ophim.cc"];
const IMG = "https://phimimg.com";
const image = (v, cdn) => {
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v.replace(/^http:\/\//i, "https://");
  if (v.startsWith("//")) return "https:" + v;
  return (cdn || IMG).replace(/\/+$/, "") + "/" + v.replace(/^\/+/, "");
};
const names = (items) => Array.isArray(items) ? items.map((v) => typeof v === "string" ? v : v?.name).filter(Boolean) : [];
module.exports = async (req, res) => {
  const params = new URL(req.url, "https://local").searchParams;
  const type = params.get("type") || "phim-moi-cap-nhat";
  const q = params.get("q"), page = params.get("page") || "1";
  const path = q ? "/v1/api/tim-kiem?keyword=" + encodeURIComponent(q) + "&page=" + page : "/v1/api/danh-sach/" + encodeURIComponent(type) + "?page=" + page;
  for (const base of SOURCES) {
    try {
      const endpoint = q ? path : type === "phim-moi-cap-nhat" ? "/danh-sach/phim-moi-cap-nhat?page=" + page : path;
      const r = await fetch(base + endpoint);
      if (!r.ok) continue;
      const j = await r.json(), d = j.data || j, cdn = d.APP_DOMAIN_CDN_IMAGE || j.pathImage || IMG;
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
      return res.status(200).json({
        items: (d.items || []).map((m) => ({
          slug:m.slug, name:m.name, originName:m.origin_name || m.original_name,
          poster:image(m.poster_url || m.thumb_url, cdn), backdrop:image(m.thumb_url || m.poster_url, cdn),
          year:m.year, quality:m.quality, language:m.lang, currentEpisode:m.episode_current,
          time:m.time, rating:m.tmdb?.vote_average || m.imdb?.vote_average || "", categories:names(m.category)
        })),
        pagination:d.params?.pagination || j.pagination || null
      });
    } catch (_) {}
  }
  return res.status(502).json({items:[],error:"Movie API unavailable"});
};
