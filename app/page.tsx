"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Clapperboard, Film, Flame, Home, Play, Search } from "lucide-react";
import { LiquidGlassDockSurface } from "@/components/liquid-glass-dock-surface";

type Movie = { id: string; slug: string; name: string; originName: string; poster: string; backdrop: string; year: number | null; quality: string; language: string; currentEpisode: string; rating: number | null };
type Feed = { status: boolean; items: Movie[] };
const categories = [{label:"Mới cập nhật",type:"phim-moi-cap-nhat"},{label:"Phim lẻ",type:"phim-le"},{label:"Phim bộ",type:"phim-bo"},{label:"Hoạt hình",type:"hoat-hinh"},{label:"TV Shows",type:"tv-shows"}];

function MovieCard({ movie }: { movie: Movie }) {
  return <a className="appstore-movie" href={`/phim/${movie.slug}`} aria-label={movie.name}>
    <div className="appstore-artwork">{movie.poster ? <img src={movie.poster} alt={movie.name} loading="lazy" decoding="async" /> : <span className="artwork-fallback"><Clapperboard size={25}/></span>}<span className="appstore-quality">{movie.quality || "HD"}</span></div>
    <div className="appstore-copy"><div className="appstore-title-row"><p className="appstore-name">{movie.name}</p><span className="appstore-open">Xem</span></div><p className="appstore-original">{movie.originName || "Phim mới cập nhật"}</p><div className="appstore-meta"><span>{movie.year || "Mới"}</span><i/> <span>{movie.currentEpisode || "Trọn bộ"}</span></div><div className="appstore-kind"><span className="appstore-kind-dot"/> PHIM ĐỀ XUẤT</div></div>
  </a>;
}

function PosterCard({ movie }: { movie: Movie }) {
  return <a className="poster-card" href={`/phim/${movie.slug}`}><div className="poster-art">{movie.poster ? <img src={movie.poster} alt={movie.name} loading="lazy"/> : <Clapperboard/>}<span>{movie.quality || "HD"}</span><button aria-label="Xem phim"><Play size={17} fill="currentColor"/></button></div><strong>{movie.name}</strong><small>{movie.originName || movie.year || "Phim mới"}</small></a>;
}

function LandscapeCard({ movie }: { movie: Movie }) {
  return <a className="landscape-card" href={`/phim/${movie.slug}`}><div className="landscape-art">{movie.backdrop || movie.poster ? <img src={movie.backdrop || movie.poster} alt={movie.name} loading="lazy"/> : <Clapperboard/>}<span>{movie.currentEpisode || "Mới cập nhật"}</span></div><div className="landscape-copy"><strong>{movie.name}</strong><small>{movie.originName || movie.year || "Hoạt hình"}</small></div></a>;
}

function RankedCard({ movie, index }: { movie: Movie; index: number }) {
  return <a className="ranked-card" href={`/phim/${movie.slug}`}><span className="rank-number">{String(index + 1).padStart(2,"0")}</span><div className="rank-poster">{movie.poster ? <img src={movie.poster} alt={movie.name} loading="lazy"/> : <Clapperboard/>}</div><div className="rank-copy"><strong>{movie.name}</strong><small>{movie.originName || "TV Shows"} · {movie.year || "Mới"}</small><span>{movie.currentEpisode || movie.quality || "Đang cập nhật"}</span></div><Play className="rank-play" size={17}/></a>;
}

export default function HomePage() {
  const [active, setActive] = useState("home");
  const [category, setCategory] = useState("phim-moi-cap-nhat");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [fresh, setFresh] = useState<Movie[]>([]);
  const [shelves, setShelves] = useState<Record<string, Movie[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [savedHeroId, setSavedHeroId] = useState<string | null>(null);

  const load = useCallback(async (type: string) => {
    setLoading(true);
    try { const response = await fetch(`/api/movies?type=${encodeURIComponent(type)}`, { cache: "no-store" }); const data = await response.json() as Feed; setMovies(data.items || []); }
    catch { setMovies([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(category); }, [category, load]);
  useEffect(() => { const tab = new URLSearchParams(window.location.search).get("tab"); if (tab === "search") { setActive("search"); setShowSearch(true); } }, []);
  useEffect(() => { let alive = true; fetch("/api/movies?type=phim-moi-cap-nhat").then(r => r.json()).then((d: Feed) => { if (alive) setFresh(d.items || []); }).catch(() => {}); return () => { alive = false; }; }, []);
  useEffect(() => { let alive = true; const types = ["phim-le", "phim-bo", "hoat-hinh", "tv-shows"]; Promise.all(types.map(async type => { try { const r = await fetch(`/api/movies?type=${type}`); const d = await r.json() as Feed; return [type, d.items || []] as const; } catch { return [type, []] as const; } })).then(rows => { if (alive) setShelves(Object.fromEntries(rows)); }); return () => { alive = false; }; }, []);
  useEffect(() => { if (!search.trim()) { setSearchResults([]); return; } const timer = window.setTimeout(() => { fetch(`/api/movies?q=${encodeURIComponent(search.trim())}`).then(r => r.json()).then((d: Feed) => setSearchResults(d.items || [])).catch(() => setSearchResults([])); }, 350); return () => window.clearTimeout(timer); }, [search]);

  const hero = fresh[0];
  const featured = fresh.slice(6, 18);
  const nav = [{id:"home",label:"Khám phá",icon:Home},{id:"phim-le",label:"Phim lẻ",icon:Clapperboard},{id:"phim-bo",label:"Phim bộ",icon:Film},{id:"search",label:"Tìm kiếm",icon:Search}];

  return <main className="app-shell">
    <header className={`topbar ${showSearch || active === "search" ? "searching" : ""}`}><a className="brand" href="/"><span>XEMPHIM</span></a><div className="top-actions"><button className="icon-button" aria-label="Thông báo"><Bell size={18}/></button></div></header>
    {showSearch || active === "search" ? <section className="search-panel"><input className="search-input" autoFocus placeholder="Tìm tên phim, diễn viên..." value={search} onChange={e=>setSearch(e.target.value)} /><p className="search-hint">{search.trim() ? `Kết quả cho “${search}”` : "Tìm bộ phim bạn muốn xem"}</p><div className="movie-row">{searchResults.map(movie=><MovieCard key={movie.id} movie={movie}/>)}</div></section> : <>
      {hero && <section className="hero" aria-label="Phim nổi bật">
        <div className="hero-image" style={{backgroundImage:`url("${hero.backdrop || hero.poster}")`}}/>
        <div className="hero-content">
          <span className="eyebrow">ĐỀ XUẤT HÔM NAY</span>
          <h1>{hero.name}</h1>
          <div className="hero-meta"><span>{hero.year || "Mới"}</span><i className="meta-dot"/><span>{hero.quality || "HD"}</span><i className="meta-dot"/><span>{hero.language || "Vietsub"}</span></div>
          <p className="hero-desc">{hero.originName || "Khám phá bộ phim nổi bật hôm nay."}</p>
          <div className="hero-actions">
            <a className="primary-btn" href={`/phim/${hero.slug}`}><Play size={16} fill="currentColor"/> Xem ngay</a>
            <button className="secondary-btn" onClick={()=>setSavedHeroId(hero.id)}><Clapperboard size={15}/>{savedHeroId===hero.id?"Đã lưu":"Lưu phim"}</button>
          </div>
        </div>
      </section>}
      <section className="section"><div className="section-head"><h2 className="section-title">Khám phá phim</h2><span className="section-link">Vuốt để xem thêm</span></div><div className="chips">{categories.map(c=><button key={c.type} className={`chip ${category===c.type?"active":""}`} onClick={()=>setCategory(c.type)}>{c.label}</button>)}</div></section>
      <section className="section"><div className="section-head"><h2 className="section-title"><Flame size={16} style={{display:"inline",verticalAlign:"-3px",color:"#b99bff"}}/> {categories.find(c=>c.type===category)?.label || "Phim mới"}</h2><a className="section-link" href="/danh-sach">Xem tất cả</a></div><div className={`movie-row ${category === "phim-bo" ? "series-row" : "fresh-row"}`}>{loading ? Array.from({length:5},(_,i)=><div className="appstore-skeleton" key={i}><div className="appstore-skeleton-art"/><div className="appstore-skeleton-copy"><i/><i/><i/><i/></div></div>) : movies.slice(0,18).map(movie=><MovieCard key={movie.id} movie={movie}/>)}</div>{!loading && movies.length===0 && <p className="empty-state">Chưa tải được danh sách phim. Hãy thử lại sau.</p>}</section>
      {featured.length>0 && <section className="section"><div className="section-head"><h2 className="section-title">Vừa cập nhật</h2><span className="section-link">Mới nhất</span></div><div className="poster-row">{featured.map(movie=><PosterCard key={movie.id} movie={movie}/>)}</div></section>}
      {categories.filter(c => c.type !== "phim-moi-cap-nhat").map(c => <section className="section" key={c.type}><div className="section-head"><h2 className="section-title">{c.label} nổi bật</h2><a className="section-link" href={`/danh-sach?type=${c.type}`}>Xem tất cả</a></div>{c.type === "phim-le" ? <div className="poster-row">{(shelves[c.type] || []).slice(0,14).map(movie=><PosterCard key={movie.id} movie={movie}/>)}</div> : c.type === "phim-bo" ? <div className="movie-row series-row">{(shelves[c.type] || []).slice(0,12).map(movie=><MovieCard key={movie.id} movie={movie}/>)}</div> : c.type === "hoat-hinh" ? <div className="landscape-row">{(shelves[c.type] || []).slice(0,12).map(movie=><LandscapeCard key={movie.id} movie={movie}/>)}</div> : <div className="ranked-list">{(shelves[c.type] || []).slice(0,8).map((movie,index)=><RankedCard key={movie.id} movie={movie} index={index}/>)}</div>}{!shelves[c.type] && <div className="shelf-loading">{Array.from({length:4},(_,i)=><div className="appstore-skeleton" key={i}><div className="appstore-skeleton-art"/><div className="appstore-skeleton-copy"><i/><i/><i/><i/></div></div>)}</div>}</section>)}
    </>}

    <style jsx global>{`

      .search-panel{position:relative;z-index:1;min-height:100svh;padding:calc(82px + env(safe-area-inset-top)) 18px calc(110px + env(safe-area-inset-bottom));box-sizing:border-box}
      .search-panel .search-input{display:block;width:100%;max-width:680px;margin:0 auto 14px}
      .search-panel .search-hint{max-width:680px;margin:0 auto 14px}
      .search-panel .movie-row{max-width:720px;margin:0 auto}
      @media(max-width:600px){.topbar.searching{height:58px}.search-panel{padding-top:calc(76px + env(safe-area-inset-top))}}
      .poster-row,.landscape-row{display:grid;grid-auto-flow:column;grid-auto-columns:132px;gap:13px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;padding:0 18px 12px;scrollbar-width:none}
      .poster-row::-webkit-scrollbar,.landscape-row::-webkit-scrollbar{display:none}
      .poster-card{min-width:0;display:flex;flex-direction:column;gap:7px;scroll-snap-align:start;text-decoration:none}
      .poster-art{height:190px;position:relative;overflow:hidden;border-radius:12px;background:#202020}
      .poster-art img,.rank-poster img{width:100%;height:100%;object-fit:cover;display:block}
      .poster-art>span{position:absolute;top:7px;left:7px;padding:4px 6px;border-radius:5px;background:#000c;color:#fff;font-size:8px;font-weight:850}
      .poster-art>button{position:absolute;right:8px;bottom:8px;width:32px;height:32px;border:1px solid #ffffff55;border-radius:50%;background:#eee;color:#111;display:grid;place-items:center}
      .poster-card strong,.landscape-copy strong{color:#f5f5f5;font-size:12px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .poster-card small,.landscape-copy small{color:#999;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .landscape-row{grid-auto-columns:230px}
      .landscape-card{overflow:hidden;border:1px solid #292929;border-radius:12px;background:#171717;scroll-snap-align:start;text-decoration:none}
      .landscape-art{height:128px;position:relative;background:#222}
      .landscape-art img{width:100%;height:100%;object-fit:cover;display:block}
      .landscape-art>span{position:absolute;left:8px;bottom:8px;padding:5px 8px;border-radius:5px;background:#000c;color:#eee;font-size:9px;font-weight:750}
      .landscape-copy{padding:10px 11px 12px;display:flex;flex-direction:column;gap:5px}
      .ranked-list{display:flex;flex-direction:column;gap:9px;padding:0 18px 8px}
      .ranked-card{display:grid;grid-template-columns:34px 54px minmax(0,1fr) 24px;align-items:center;gap:10px;min-height:78px;padding:7px 10px;border:1px solid #292929;border-radius:12px;background:#171717;text-decoration:none}
      .rank-number{font-size:19px;font-weight:900;font-style:italic;color:#eee;letter-spacing:-1px}
      .rank-poster{height:64px;width:54px;overflow:hidden;border-radius:8px;background:#222}
      .rank-copy{min-width:0;display:flex;flex-direction:column;gap:4px}
      .rank-copy strong{color:#f6f6f6;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .rank-copy small{color:#999;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .rank-copy span,.rank-play{color:#ddd;font-size:9px;font-weight:750}
      .fresh-row,.series-row{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,min(290px,calc(100vw - 52px)));gap:12px;overflow-x:auto;overflow-y:hidden;align-items:stretch;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;padding:0 18px 12px;scrollbar-width:none}
      .fresh-row::-webkit-scrollbar,.series-row::-webkit-scrollbar{display:none}
      .fresh-row>.appstore-movie,.series-row>.appstore-movie{width:100%;min-width:0;max-width:100%;height:142px;min-height:142px;box-sizing:border-box;overflow:hidden}
      .fresh-row .appstore-artwork,.series-row .appstore-artwork{width:88px;height:122px;flex:none}
      .fresh-row .appstore-copy,.series-row .appstore-copy{min-width:0;max-width:100%;overflow:hidden}
      .appstore-skeleton{width:100%;height:142px;min-width:0;padding:10px;display:grid;grid-template-columns:88px minmax(0,1fr);gap:12px;box-sizing:border-box;border:1px solid #292929;border-radius:14px;background:#171717;overflow:hidden;scroll-snap-align:start}
      .appstore-skeleton-art{height:122px;width:88px;border-radius:10px;background:linear-gradient(100deg,#202020 25%,#303030 45%,#202020 65%);background-size:220% 100%;animation:shimmer 1.3s infinite}
      .appstore-skeleton-copy{display:flex;flex-direction:column;gap:10px;padding-top:9px;min-width:0}
      .appstore-skeleton-copy i{height:8px;border-radius:8px;background:linear-gradient(100deg,#202020 25%,#303030 45%,#202020 65%);background-size:220% 100%;animation:shimmer 1.3s infinite}
      .appstore-skeleton-copy i:nth-child(1){width:82%;height:11px}.appstore-skeleton-copy i:nth-child(2){width:95%}.appstore-skeleton-copy i:nth-child(3){width:58%}.appstore-skeleton-copy i:nth-child(4){width:70%;height:6px}
      .shelf-loading{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(268px,290px);gap:12px;overflow:hidden;padding:0 18px 12px}
      .shelf-loading .appstore-skeleton{width:100%}
      .movie-row{grid-auto-columns:minmax(268px,290px);gap:12px;padding:0 18px 10px}
      .appstore-movie{width:100%;min-height:142px;padding:10px;display:grid;grid-template-columns:88px minmax(0,1fr);gap:12px;align-items:center;border-radius:14px;border:1px solid #292929;background:#171717;box-shadow:none;scroll-snap-align:start;transition:transform .2s,border-color .2s}
      .appstore-movie:active{transform:scale(.985);border-color:#777}
      .appstore-artwork{height:122px;width:88px;position:relative;overflow:hidden;border-radius:10px;background:#222;box-shadow:none}
      .appstore-artwork img{width:100%;height:100%;object-fit:cover;display:block}
      .artwork-fallback{height:100%;display:grid;place-items:center;color:#ddd}
      .appstore-quality{position:absolute;left:6px;top:6px;padding:4px 6px;border-radius:5px;background:#000b;color:#fff;font-size:8px;font-weight:850}
      .appstore-copy{min-width:0;display:flex;flex-direction:column;align-items:flex-start}
      .appstore-title-row{width:100%;display:flex;align-items:flex-start;justify-content:space-between;gap:7px}
      .appstore-name{min-width:0;margin:0;color:#f7f7f7;font-size:13px;line-height:1.3;font-weight:780;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .appstore-open{flex:none;padding:6px 12px;border-radius:999px;background:#eee;color:#111;font-size:10px;font-weight:850;box-shadow:none}
      .appstore-original{width:100%;margin:6px 0 8px;color:#999;font-size:10px;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .appstore-meta{display:flex;align-items:center;gap:7px;color:#c0c0c0;font-size:9px;font-weight:650}.appstore-meta i{width:3px;height:3px;border-radius:50%;background:#777}
      .appstore-kind{display:flex;align-items:center;gap:5px;margin-top:10px;color:#929292;font-size:8px;font-weight:850;letter-spacing:1px}
      .appstore-kind-dot{width:5px;height:5px;border-radius:50%;background:#aaa;box-shadow:none}
      .app-shell{background:#000}.topbar{position:absolute;top:0;left:0;right:0;z-index:20;height:62px;padding:0 20px;background:linear-gradient(180deg,rgba(0,0,0,.62),transparent);backdrop-filter:none;-webkit-backdrop-filter:none}
      .brand{font-size:16px;font-weight:850;letter-spacing:1.3px;color:#fff}.brand-mark{display:none}
      .icon-button{width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.22);color:#fff;backdrop-filter:blur(12px)}
      .hero.hero-cinema{height: min(88svh,790px);min-height:650px;max-height:820px;margin:0;position:relative;overflow:hidden;border-radius:0;background:#090909;isolation:isolate}
      .hero-cinema .hero-image{position:absolute;inset:0;z-index:-2;background-size:cover;background-position:center 22%;transform:scale(1.015);animation:heroReveal .65s ease both}
      .hero-cinema:before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,.32) 0%,transparent 28%,rgba(0,0,0,.16) 48%,rgba(0,0,0,.92) 78%,#000 100%)}
      .hero-topline{position:absolute;top:76px;left:20px;right:20px;display:flex;align-items:center;justify-content:space-between;color:#eee;font-size:9px;font-weight:800;letter-spacing:1.8px}
      .hero-count{font-size:10px;letter-spacing:1px;color:#aaa}.hero-count i{font-style:normal;color:#666;margin:0 4px}
      .hero-cinema .hero-content{position:absolute;left:20px;right:20px;bottom:calc(24px + env(safe-area-inset-bottom));max-width:600px}
      .hero-cinema .eyebrow{color:#bbb;font-size:9px;letter-spacing:2px;font-weight:750}
      .hero-cinema h1{max-width:560px;margin:10px 0 11px;font-size:clamp(32px,9vw,48px);line-height:.99;letter-spacing:-1.5px;font-weight:850;color:#fff;text-shadow:none}
      .hero-cinema .hero-meta{display:flex;align-items:center;gap:9px;color:#d0d0d0;font-size:11px}
      .hero-cinema .meta-dot{width:3px;height:3px;background:#888;border-radius:50%}
      .hero-cinema .hero-desc{max-width:360px;margin:10px 0 16px;color:#bcbcbc;font-size:11px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
      .hero-cinema .hero-actions{display:flex}.hero-cinema .primary-btn{height:43px;min-width:132px;padding:0 20px;border-radius:999px;background:#f3f3f3;color:#111;box-shadow:none;font-size:12px;font-weight:800}
      .hero-thumbnails{display:flex;gap:8px;align-items:center;margin-top:20px;max-width:100%;overflow-x:auto;scrollbar-width:none;padding:2px 1px 4px}
      .hero-thumbnails::-webkit-scrollbar{display:none}
      .hero-thumb{position:relative;flex:1 0 0;min-width:0;max-width:68px;height:42px;padding:0;overflow:hidden;border:1px solid rgba(255,255,255,.2);border-radius:5px;background:#222;opacity:.52;transition:opacity .2s,border-color .2s,transform .2s}
      .hero-thumb img{width:100%;height:100%;object-fit:cover;display:block}
      .hero-thumb.active{opacity:1;border:2px solid #fff;transform:translateY(-2px)}
      .hero-thumb.active:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.12),transparent)}
      .section{margin-top:27px}.section-head{padding:0 18px;margin-bottom:12px}.section-title{color:#f5f5f5;font-size:16px;font-weight:750;letter-spacing:-.2px}.section-link{color:#999}
      .chips{display:flex;gap:8px;overflow-x:auto;padding:0 18px 5px;scrollbar-width:none}.chips::-webkit-scrollbar{display:none}
      .chip{flex:none;background:#171717;color:#bbb;border:1px solid #303030;border-radius:999px;padding:9px 14px;font-size:11px}.chip.active{background:#eee;color:#111;border-color:#eee}
      .dock-wrap{padding-left:16px;padding-right:16px}.dock{background:rgba(26,26,26,.9);border:1px solid rgba(255,255,255,.13);box-shadow:0 8px 28px rgba(0,0,0,.55);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border-radius:22px}
      .dock-item{color:#aaa}.dock-item.active{color:#fff;background:rgba(255,255,255,.12);box-shadow:none}
      .search-input{background:#171717;border-color:#303030;color:#fff}.search-input:focus{border-color:#888}.search-hint,.detail-info{color:#aaa}
      @keyframes heroReveal{from{opacity:.7;transform:scale(1.035)}to{opacity:1;transform:scale(1.015)}}
      @media(min-width:700px){.app-shell{max-width:980px;margin:auto}.topbar{padding:0 28px}.hero.hero-cinema{height:760px;min-height:760px;border-radius:0 0 16px 16px;margin:0 16px}.hero-cinema .hero-content{left:34px;bottom:38px}.hero-topline{left:34px;right:34px}.hero-thumb{height:48px;max-width:82px}.movie-row,.fresh-row,.series-row{grid-auto-columns:290px;padding-left:25px;padding-right:25px}.section-head{padding:0 25px}.poster-row,.landscape-row{padding-left:25px;padding-right:25px}.ranked-list{padding-left:25px;padding-right:25px}}
      @media(max-width:380px){.hero.hero-cinema{min-height:610px}.hero-cinema .hero-content{bottom:calc(18px + env(safe-area-inset-bottom))}.hero-thumb{height:36px}}

      /* FPT Play-inspired cinematic hero refresh */
      .hero.hero-cinema{height:clamp(470px,66vw,650px);min-height:470px;max-height:650px;margin:0 14px;border-radius:0 0 22px 22px;background:#10131b;overflow:hidden}
      .hero-cinema .hero-image{inset:0;background-size:cover;background-position:center 30%;transform:scale(1.01);animation:heroReveal .55s ease both}
      .hero-cinema:before{background:linear-gradient(90deg,rgba(5,8,15,.94) 0%,rgba(5,8,15,.78) 30%,rgba(5,8,15,.24) 66%,rgba(5,8,15,.05) 100%),linear-gradient(0deg,rgba(5,8,15,.8) 0%,transparent 45%,rgba(5,8,15,.28) 100%)}
      .hero-topline{top:82px;left:26px;right:26px;justify-content:flex-start;gap:12px;letter-spacing:1.3px;color:#f5f6fa}
      .hero-kicker{display:inline-flex;align-items:center;gap:8px;padding:7px 11px;border-radius:4px;background:rgba(7,11,20,.48);border:1px solid rgba(255,255,255,.18);font-size:9px}
      .hero-count{margin-left:auto;font-size:10px}
      .hero-cinema .hero-content{left:28px;right:auto;bottom:34px;width:min(490px,58%);max-width:490px}
      .hero-cinema .eyebrow{display:flex;align-items:center;gap:8px;color:#f3f4f7;font-size:10px;letter-spacing:1.5px}
      .hero-live-dot{width:7px;height:7px;border-radius:50%;background:#ed2939;box-shadow:0 0 0 4px rgba(237,41,57,.15)}
      .hero-cinema h1{font-size:clamp(30px,5vw,52px);line-height:1.06;letter-spacing:-1.3px;margin:12px 0;color:#fff;max-width:470px;text-wrap:balance}
      .hero-cinema .hero-meta{gap:10px;color:#e1e4ea;font-size:12px}
      .hero-cinema .meta-dot{background:#b6bdc9}
      .hero-cinema .hero-desc{max-width:430px;margin:13px 0 20px;color:rgba(245,247,251,.82);font-size:13px;line-height:1.55;-webkit-line-clamp:2}
      .hero-cinema .hero-actions{display:flex;align-items:center;gap:12px}
      .hero-cinema .primary-btn{height:46px;min-width:142px;padding:0 22px;border-radius:7px;background:#ed2939!important;color:#fff!important;font-size:13px;box-shadow:0 7px 24px rgba(237,41,57,.25)!important}
      .hero-detail-btn{height:46px;padding:0 16px;display:inline-flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.35);border-radius:7px;background:rgba(12,17,27,.28);color:#fff;font-size:12px;font-weight:750;backdrop-filter:blur(12px)}
      .hero-detail-btn span{font-size:22px;line-height:1}
      .hero-thumbnails{display:flex;gap:7px;align-items:center;margin-top:25px;max-width:100%;overflow-x:auto;padding:3px 2px 5px}
      .hero-thumb{flex:0 0 74px;max-width:74px;height:43px;border:1px solid rgba(255,255,255,.28);border-radius:5px;opacity:.58;transform:none}
      .hero-thumb.active{opacity:1;border:2px solid #ed2939;transform:translateY(-2px)}
      .hero-thumb.active:after{background:linear-gradient(0deg,rgba(237,41,57,.2),transparent)}
      .section{margin-top:24px}
      @media(min-width:700px){.hero.hero-cinema{margin:0 18px;border-radius:0 0 20px 20px;height:clamp(520px,58vw,680px);max-height:680px}.hero-cinema .hero-content{left:42px;bottom:42px}.hero-topline{left:42px;right:42px}.hero-thumb{flex-basis:88px;max-width:88px;height:50px}}
      @media(max-width:600px){.hero.hero-cinema{height:570px;min-height:570px;max-height:610px;margin:0;border-radius:0 0 16px 16px}.hero-cinema .hero-image{background-position:center 25%}.hero-cinema:before{background:linear-gradient(90deg,rgba(5,8,15,.72),rgba(5,8,15,.12) 100%),linear-gradient(0deg,#05080f 0%,rgba(5,8,15,.9) 19%,rgba(5,8,15,.08) 68%,rgba(5,8,15,.32) 100%)}.hero-topline{top:76px;left:18px;right:18px}.hero-cinema .hero-content{left:19px;right:19px;bottom:22px;width:auto;max-width:none}.hero-cinema h1{font-size:clamp(29px,8vw,39px);max-width:100%;margin:9px 0}.hero-cinema .hero-desc{font-size:11px;margin:9px 0 14px;max-width:100%}.hero-cinema .primary-btn,.hero-detail-btn{height:43px}.hero-thumbnails{margin-top:17px;gap:6px}.hero-thumb{flex-basis:58px;max-width:58px;height:37px}}


      /* GT Liquid Glass dock: WebGL refraction, glass rim and animated active lens */
      .dock-wrap{position:fixed;z-index:60;left:0;right:0;bottom:0;padding:0 16px calc(10px + env(safe-area-inset-bottom));pointer-events:none}
      .dock-wrap>.dock{position:relative;isolation:isolate;pointer-events:auto;width:min(92vw,380px);max-width:380px;min-height:72px;height:72px;margin:0 auto;padding:7px 9px;display:flex;align-items:center;justify-content:space-between;gap:4px;overflow:hidden;border-radius:9999px;background:transparent;border:1px solid rgba(255,255,255,.2);box-shadow:0 18px 48px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.28),inset 0 -1px 0 rgba(255,255,255,.04);backdrop-filter:none;-webkit-backdrop-filter:none;-webkit-tap-highlight-color:transparent}
      .gt-liquid-glass-blur{position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;background:rgba(255,255,255,.045);backdrop-filter:blur(16px) saturate(145%);-webkit-backdrop-filter:blur(16px) saturate(145%)}
      .gt-liquid-glass-canvas{position:absolute;inset:0;z-index:1;display:block;width:100%;height:100%;border-radius:inherit;pointer-events:none;opacity:1}
      .gt-liquid-glass-bubble{position:absolute;top:7px;bottom:7px;left:0;width:0;z-index:2;pointer-events:none;border-radius:9999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 3px 16px rgba(0,0,0,.08);transition:left .48s cubic-bezier(.34,1.2,.64,1),width .48s cubic-bezier(.34,1.2,.64,1)}
      .dock-item{position:relative;z-index:3;isolation:isolate;flex:1;min-width:0;height:58px;padding:5px 3px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border:0;border-radius:9999px;background:transparent;color:rgba(255,255,255,.72);font-size:10.5px;font-weight:500;letter-spacing:-.01em;text-decoration:none;cursor:pointer;transition:color .22s ease,transform .3s cubic-bezier(.34,1.4,.64,1)}
      .dock-item svg{width:23px;height:23px;stroke-width:1.8;flex:none}
      .dock-item.active{color:#fff;background:transparent;box-shadow:none;transform:translateY(-1px)}
      .dock-item.active svg{filter:none}
      .dock-item:active{transform:scale(1.09)}
      .dock.liquid-fallback{background:rgba(255,255,255,.08);backdrop-filter:blur(32px) saturate(200%);-webkit-backdrop-filter:blur(32px) saturate(200%)}
      @media(prefers-reduced-motion:reduce){.dock-item,.gt-liquid-glass-bubble{transition:none}}
      @media(min-width:700px){.dock-wrap{padding-bottom:14px}}
    `}</style>

    <nav className="dock-wrap" aria-label="Điều hướng chính"><div className="dock"><LiquidGlassDockSurface />{nav.map(item=>{const Icon=item.icon;const selected=item.id==="home"?active==="home"&&category==="phim-moi-cap-nhat":item.id==="phim-le"||item.id==="phim-bo"?false:active==="search";if(item.id==="phim-le"||item.id==="phim-bo")return <a key={item.id} href={`/danh-sach/${item.id}`} className="dock-item"><Icon size={22}/><span>{item.label}</span></a>;return <button key={item.id} className={`dock-item ${selected?"active":""}`} onClick={()=>{if(item.id==="search"){setActive("search");setShowSearch(true);return;}setActive("home");setShowSearch(false);setSearch("");setCategory("phim-moi-cap-nhat");window.scrollTo({top:0,behavior:"smooth"});}}><Icon size={22} strokeWidth={selected?2.3:1.8}/><span>{item.label}</span></button>;})}</div></nav>
  </main>;
}
