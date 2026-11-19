const BASES = ["https://phimapi.com", "https://ophim.cc"];
module.exports = async (req, res) => {
  const slug = req.query.slug;
  for (const base of BASES) {
    try {
      const response = await fetch(base + "/phim/" + encodeURIComponent(slug), { headers: { Accept: "application/json", "User-Agent": "PhimLau-Mobile/1.0" } });
      if (!response.ok) continue;
      const payload = await response.json();
      if (!payload?.movie) continue;
      const movie = payload.movie;
      res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
      return res.status(200).json({
        status: true, source: base,
        movie: {
          slug: movie.slug, name: movie.name, originName: movie.origin_name || movie.original_name,
          content: movie.content || "", year: movie.year, time: movie.time, quality: movie.quality,
          language: movie.lang, poster: movie.poster_url, backdrop: movie.thumb_url || movie.poster_url,
          categories: movie.category || [], countries: movie.country || [], actors: movie.actor || []
        },
        servers: (payload.episodes || []).map(server => ({
          name: server.server_name || "Server",
          episodes: (server.server_data || []).map(episode => ({
            name: episode.name, slug: episode.slug, embed: episode.link_embed || "", m3u8: episode.link_m3u8 || ""
          })).filter(episode => episode.embed || episode.m3u8)
        }))
      });
    } catch (_) {}
  }
  return res.status(404).json({ status: false, error: "Không tìm thấy phim." });
};
