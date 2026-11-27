const SOURCES = ["https://phimapi.com", "https://ophim.cc"];
const IMG = "https://phimimg.com";
const image = (v, cdn) => {
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v.replace(/^http:\/\//i, "https://");
  if (v.startsWith("//")) return "https:" + v;
  return (cdn || IMG).replace(/\/+$/, "") + "/" + v.replace(/^\/+/, "");
};
const names = (items) => Array.isArray(items) ? items.map((v) => typeof v === "string" ? v : v?.name).filter(Boolean) : [];
const cleanText = (value) => String(value || "")
  .replace(/<br\s*\/?\s*>/gi, "\n")
  .replace(/<\/(p|div|li|h[1-6])\s*>/gi, "\n\n")
  .replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/[ \t]+/g, " ")
  .replace(/\n[ \t]+/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();
module.exports = async (req, res) => {
  for (const base of SOURCES) {
    try {
      const r = await fetch(base + "/phim/" + encodeURIComponent(req.query.slug));
      if (!r.ok) continue;
      const j = await r.json();
      if (!j.movie) continue;
      const m = j.movie, cdn = j.pathImage || IMG;
      res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1800");
      return res.status(200).json({
        movie:{
          name:m.name, content:cleanText(m.content), year:m.year, quality:m.quality, language:m.lang,
          backdrop:image(m.thumb_url || m.poster_url,cdn), poster:image(m.poster_url || m.thumb_url,cdn),
          time:m.time || "", episodeTotal:m.episode_total || "", trailer:m.trailer_url || "",
          actors:names(m.actor), directors:names(m.director), categories:names(m.category), countries:names(m.country)
        },
        servers:(j.episodes || []).map((s)=>({
          name:s.server_name,
          episodes:(s.server_data || []).map((e)=>({name:e.name,embed:e.link_embed || "",m3u8:e.link_m3u8 || ""})).filter((e)=>e.embed || e.m3u8)
        })).filter((s)=>s.episodes.length)
      });
    } catch (_) {}
  }
  return res.status(404).json({error:"Not found"});
};
