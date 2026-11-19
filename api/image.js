const ALLOWED_HOSTS = ["phimimg.com","phimapi.com","ophim.cc","ophim.live"];
module.exports = async (req, res) => {
  try {
    const raw = req.query.url;
    if (typeof raw !== "string" || !raw) return res.status(400).send("Missing image URL");
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const allowed = ALLOWED_HOSTS.some(domain => host === domain || host.endsWith("." + domain));
    if (!allowed || !["https:"].includes(url.protocol)) return res.status(403).send("Image host not allowed");
    const upstream = await fetch(url.toString(), {
      headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://phimapi.com/" }
    });
    if (!upstream.ok) return res.status(upstream.status).send("Image unavailable");
    const type = upstream.headers.get("content-type") || "application/octet-stream";
    if (!type.startsWith("image/")) return res.status(415).send("Not an image");
    const bytes = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", type);
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).send(bytes);
  } catch (error) {
    return res.status(400).send("Invalid image URL");
  }
};
