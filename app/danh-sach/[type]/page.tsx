"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Clapperboard, Film, Home, Play, Search } from "lucide-react";
import { LiquidGlassDockSurface } from "@/components/liquid-glass-dock-surface";

type Movie = { id: string; slug: string; name: string; originName: string; poster: string; year: number | null; quality: string; currentEpisode: string };
type Feed = { status: boolean; items: Movie[] };

export default function CategoryPage() {
  const params = useParams<{ type: string }>();
  const type = params.type === "phim-bo" ? "phim-bo" : "phim-le";
  const title = type === "phim-le" ? "Phim lẻ" : "Phim bộ";
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/movies?type=${type}`, { cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("catalog");
        return response.json() as Promise<Feed>;
      })
      .then(data => { if (alive) setMovies(data.items || []); })
      .catch(() => { if (alive) setError(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [type]);

  const nav = useMemo(() => [
    { id: "home", label: "Khám phá", icon: Home, href: "/" },
    { id: "phim-le", label: "Phim lẻ", icon: Clapperboard, href: "/danh-sach/phim-le" },
    { id: "phim-bo", label: "Phim bộ", icon: Film, href: "/danh-sach/phim-bo" },
    { id: "search", label: "Tìm kiếm", icon: Search, href: "/?tab=search" },
  ], []);

  return <main className="app-shell catalog-page">
    <header className="catalog-header">
      <a href="/" className="catalog-back" aria-label="Quay lại trang chủ"><ArrowLeft size={19}/></a>
      <div><span className="catalog-kicker">DANH SÁCH PHIM</span><h1>{title}</h1></div>
      <span className="catalog-total">{loading ? "…" : movies.length + " phim"}</span>
    </header>
    <section className="catalog-content">
      <div className="catalog-intro"><h2>{title} mới và nổi bật</h2><p>Khám phá và chọn bộ phim bạn muốn xem.</p></div>
      {loading ? <div className="catalog-grid">{Array.from({length:12},(_,i)=><div className="catalog-skeleton" key={i}><i/><b/><span/></div>)}</div>
      : error ? <p className="catalog-empty">Không thể tải danh sách phim. Vui lòng thử lại sau.</p>
      : movies.length ? <div className="catalog-grid">{movies.map(movie=><a className="catalog-card" href={`/phim/${movie.slug}`} key={movie.id}>
        <div className="catalog-poster">{movie.poster ? <img src={movie.poster} alt={movie.name} loading="lazy"/> : <Clapperboard size={26}/>}<span>{movie.quality || "HD"}</span><i><Play size={17} fill="currentColor"/></i></div>
        <strong>{movie.name}</strong><small>{movie.originName || movie.year || "Đang cập nhật"}</small><em>{movie.year || "Mới"} · {movie.currentEpisode || "Đang cập nhật"}</em>
      </a>)}</div> : <p className="catalog-empty">Chưa có phim trong danh sách này.</p>}
    </section>
    <nav className="dock-wrap" aria-label="Điều hướng chính"><div className="dock"><LiquidGlassDockSurface />{nav.map(item=>{const Icon=item.icon;return <a key={item.id} href={item.href} className={`dock-item ${item.id===type?"active":""}`}><Icon size={22}/><span>{item.label}</span></a>;})}</div></nav>
    <style jsx global>{`
      .catalog-page{min-height:100svh;background:#000;padding-bottom:calc(112px + env(safe-area-inset-bottom))}
      .catalog-header{height:76px;padding:env(safe-area-inset-top) 19px 0;display:flex;align-items:center;gap:13px;position:sticky;top:0;z-index:25;background:rgba(0,0,0,.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
      .catalog-back{width:38px;height:38px;display:grid;place-items:center;border:1px solid #303030;border-radius:50%;color:#eee;background:#171717}
      .catalog-kicker{font-size:8px;letter-spacing:1.7px;color:#999;font-weight:800}
      .catalog-header h1{font-size:20px;line-height:1.2;margin:3px 0 0;color:#fff;letter-spacing:-.5px}
      .catalog-total{margin-left:auto;color:#999;font-size:10px}
      .catalog-content{padding:20px 17px 28px}
      .catalog-intro{margin:0 1px 17px}.catalog-intro h2{font-size:15px;margin:0 0 5px;color:#f5f5f5}.catalog-intro p{font-size:11px;color:#999;margin:0}
      .catalog-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:19px 11px}
      .catalog-card{min-width:0;display:flex;flex-direction:column;text-decoration:none;gap:5px}
      .catalog-poster{position:relative;width:100%;aspect-ratio:2/3;overflow:hidden;border-radius:11px;background:#1c1c1c;border:1px solid #292929}
      .catalog-poster img{width:100%;height:100%;object-fit:cover;display:block}
      .catalog-poster>span{position:absolute;top:6px;left:6px;padding:4px 5px;border-radius:4px;background:#000c;color:#fff;font-size:8px;font-weight:800}
      .catalog-poster>i{position:absolute;right:7px;bottom:7px;width:29px;height:29px;border-radius:50%;display:grid;place-items:center;background:#f2f2f2;color:#111;font-style:normal}
      .catalog-card strong{font-size:11px;line-height:1.35;color:#f4f4f4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .catalog-card small{font-size:9px;color:#999;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .catalog-card em{font-size:9px;color:#777;font-style:normal}
      .catalog-skeleton{min-width:0}.catalog-skeleton i{display:block;width:100%;aspect-ratio:2/3;border-radius:11px;background:linear-gradient(100deg,#171717 25%,#303030 45%,#171717 65%);background-size:220% 100%;animation:shimmer 1.3s infinite}.catalog-skeleton b,.catalog-skeleton span{display:block;height:8px;margin-top:8px;border-radius:8px;background:#242424}.catalog-skeleton span{width:65%;height:6px;margin-top:6px}
      .catalog-empty{padding:35px 8px;text-align:center;color:#999;font-size:12px}
      @media(min-width:650px){.catalog-page{max-width:980px;margin:auto}.catalog-content{padding-left:25px;padding-right:25px}.catalog-grid{grid-template-columns:repeat(5,minmax(0,1fr));gap:24px 15px}.catalog-header{padding-left:25px;padding-right:25px}}
      /* Keep the same fixed Liquid Glass dock on category routes */
      .catalog-page .dock-wrap{position:fixed;z-index:60;left:0;right:0;bottom:0;padding:0 16px calc(10px + env(safe-area-inset-bottom));pointer-events:none}
      .catalog-page .dock-wrap>.dock{position:relative;isolation:isolate;pointer-events:auto;width:min(92vw,380px);max-width:380px;min-height:72px;height:72px;margin:0 auto;padding:7px 9px;display:flex;align-items:center;justify-content:space-between;gap:4px;overflow:hidden;border-radius:9999px;background:transparent;border:1px solid rgba(255,255,255,.2);box-shadow:0 18px 48px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.28),inset 0 -1px 0 rgba(255,255,255,.04);backdrop-filter:none;-webkit-backdrop-filter:none;-webkit-tap-highlight-color:transparent}
      .catalog-page .gt-liquid-glass-blur{position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;background:rgba(255,255,255,.045);backdrop-filter:blur(16px) saturate(145%);-webkit-backdrop-filter:blur(16px) saturate(145%)}
      .catalog-page .gt-liquid-glass-bubble{position:absolute;top:7px;bottom:7px;left:0;width:0;z-index:2;pointer-events:none;border-radius:9999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 3px 16px rgba(0,0,0,.08);transition:left .48s cubic-bezier(.34,1.2,.64,1),width .48s cubic-bezier(.34,1.2,.64,1)}
      .catalog-page .dock-item{position:relative;z-index:3;isolation:isolate;flex:1;min-width:0;height:58px;padding:5px 3px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border:0;border-radius:9999px;background:transparent;color:rgba(255,255,255,.72);font-size:10.5px;font-weight:500;letter-spacing:-.01em;text-decoration:none;cursor:pointer;transition:color .22s ease,transform .3s cubic-bezier(.34,1.4,.64,1)}
      .catalog-page .dock-item svg{width:23px;height:23px;stroke-width:1.8;flex:none}
      .catalog-page .dock-item.active{color:#fff;background:transparent;box-shadow:none;transform:translateY(-1px)}
      .catalog-page .dock-item:active{transform:scale(1.09)}
      .catalog-page .dock.liquid-fallback{background:rgba(255,255,255,.08);backdrop-filter:blur(32px) saturate(200%);-webkit-backdrop-filter:blur(32px) saturate(200%)}
      @media(min-width:700px){.catalog-page .dock-wrap{padding-bottom:14px}}
      @media(prefers-reduced-motion:reduce){.catalog-page .dock-item,.catalog-page .gt-liquid-glass-bubble{transition:none}}
    `}</style>
  </main>;
}
