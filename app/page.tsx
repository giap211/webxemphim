"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Bookmark, Clapperboard, Compass, Flame, Home, Play, Search, Sparkles, UserRound } from "lucide-react";

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

  const load = useCallback(async (type: string) => {
    setLoading(true);
    try { const response = await fetch(`/api/movies?type=${encodeURIComponent(type)}`, { cache: "no-store" }); const data = await response.json() as Feed; setMovies(data.items || []); }
    catch { setMovies([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(category); }, [category, load]);
  useEffect(() => { let alive = true; fetch("/api/movies?type=phim-moi-cap-nhat").then(r => r.json()).then((d: Feed) => { if (alive) setFresh(d.items || []); }).catch(() => {}); return () => { alive = false; }; }, []);
  useEffect(() => { let alive = true; const types = ["phim-le", "phim-bo", "hoat-hinh", "tv-shows"]; Promise.all(types.map(async type => { try { const r = await fetch(`/api/movies?type=${type}`); const d = await r.json() as Feed; return [type, d.items || []] as const; } catch { return [type, []] as const; } })).then(rows => { if (alive) setShelves(Object.fromEntries(rows)); }); return () => { alive = false; }; }, []);
  useEffect(() => { if (!search.trim()) { setSearchResults([]); return; } const timer = window.setTimeout(() => { fetch(`/api/movies?q=${encodeURIComponent(search.trim())}`).then(r => r.json()).then((d: Feed) => setSearchResults(d.items || [])).catch(() => setSearchResults([])); }, 350); return () => window.clearTimeout(timer); }, [search]);

  const hero = useMemo(() => fresh[0], [fresh]);
  const featured = fresh.slice(1, 13);
  const nav = [{id:"home",label:"Khám phá",icon:Home},{id:"search",label:"Tìm kiếm",icon:Search},{id:"saved",label:"Đã lưu",icon:Bookmark},{id:"account",label:"Tài khoản",icon:UserRound}];

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="/"><span className="brand-mark"><Clapperboard size={17}/></span><span>PHIM<span style={{color:"#b99bff"}}> LẬU</span></span></a><div className="top-actions"><button className="icon-button" aria-label="Tìm kiếm" onClick={() => {setShowSearch(true);setActive("search");}}><Search size={18}/></button><button className="icon-button" aria-label="Thông báo"><Bell size={18}/></button></div></header>
    {showSearch || active === "search" ? <section className="search-panel"><input className="search-input" autoFocus placeholder="Tìm tên phim, diễn viên..." value={search} onChange={e=>setSearch(e.target.value)} /><p className="search-hint">{search.trim() ? `Kết quả cho “${search}”` : "Tìm bộ phim bạn muốn xem"}</p><div className="movie-row">{searchResults.map(movie=><MovieCard key={movie.id} movie={movie}/>)}</div></section> : active === "saved" || active === "account" ? <section className="empty-state">{active === "saved" ? "Danh sách phim đã lưu sẽ xuất hiện tại đây." : "Tính năng tài khoản sẽ được bổ sung ở giai đoạn tiếp theo."}</section> : <>
      {hero && <section className="hero"><div className="hero-image" style={{backgroundImage:`url("${hero.backdrop || hero.poster}")`}}/><div className="hero-content"><span className="eyebrow"><Sparkles size={12}/> ĐỀ XUẤT HÔM NAY</span><h1>{hero.name}</h1><div className="hero-meta"><span>{hero.year || "Mới"}</span><i className="meta-dot"/><span>{hero.quality}</span><i className="meta-dot"/><span>{hero.language}</span></div><p className="hero-desc">{hero.originName}</p><div className="hero-actions"><a className="primary-btn" href={`/phim/${hero.slug}`}><Play size={16} fill="currentColor"/> Xem ngay</a><button className="secondary-btn" onClick={()=>setActive("saved")}><Bookmark size={15}/> Lưu phim</button></div></div></section>}
      <section className="section"><div className="section-head"><h2 className="section-title">Khám phá phim</h2><span className="section-link">Vuốt để xem thêm</span></div><div className="chips">{categories.map(c=><button key={c.type} className={`chip ${category===c.type?"active":""}`} onClick={()=>setCategory(c.type)}>{c.label}</button>)}</div></section>
      <section className="section"><div className="section-head"><h2 className="section-title"><Flame size={16} style={{display:"inline",verticalAlign:"-3px",color:"#b99bff"}}/> {categories.find(c=>c.type===category)?.label || "Phim mới"}</h2><a className="section-link" href="/danh-sach">Xem tất cả</a></div><div className={`movie-row ${category === "phim-bo" ? "series-row" : "fresh-row"}`}>{loading ? Array.from({length:5},(_,i)=><div className="appstore-skeleton" key={i}><div className="appstore-skeleton-art"/><div className="appstore-skeleton-copy"><i/><i/><i/><i/></div></div>) : movies.slice(0,18).map(movie=><MovieCard key={movie.id} movie={movie}/>)}</div>{!loading && movies.length===0 && <p className="empty-state">Chưa tải được danh sách phim. Hãy thử lại sau.</p>}</section>
      {featured.length>0 && <section className="section"><div className="section-head"><h2 className="section-title">Vừa cập nhật</h2><span className="section-link">Mới nhất</span></div><div className="poster-row">{featured.map(movie=><PosterCard key={movie.id} movie={movie}/>)}</div></section>}
      {categories.filter(c => c.type !== "phim-moi-cap-nhat").map(c => <section className="section" key={c.type}><div className="section-head"><h2 className="section-title">{c.label} nổi bật</h2><a className="section-link" href={`/danh-sach?type=${c.type}`}>Xem tất cả</a></div>{c.type === "phim-le" ? <div className="poster-row">{(shelves[c.type] || []).slice(0,14).map(movie=><PosterCard key={movie.id} movie={movie}/>)}</div> : c.type === "phim-bo" ? <div className="movie-row series-row">{(shelves[c.type] || []).slice(0,12).map(movie=><MovieCard key={movie.id} movie={movie}/>)}</div> : c.type === "hoat-hinh" ? <div className="landscape-row">{(shelves[c.type] || []).slice(0,12).map(movie=><LandscapeCard key={movie.id} movie={movie}/>)}</div> : <div className="ranked-list">{(shelves[c.type] || []).slice(0,8).map((movie,index)=><RankedCard key={movie.id} movie={movie} index={index}/>)}</div>}{!shelves[c.type] && <div className="shelf-loading">{Array.from({length:4},(_,i)=><div className="appstore-skeleton" key={i}><div className="appstore-skeleton-art"/><div className="appstore-skeleton-copy"><i/><i/><i/><i/></div></div>)}</div>}</section>)}
    </>}

    <style jsx global>{`

      .poster-row,.landscape-row{display:grid;grid-auto-flow:column;grid-auto-columns:132px;gap:13px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;padding:0 18px 12px;scrollbar-width:none}
      .poster-row::-webkit-scrollbar,.landscape-row::-webkit-scrollbar{display:none}
      .poster-card{min-width:0;display:flex;flex-direction:column;gap:7px;scroll-snap-align:start;text-decoration:none}
      .poster-art{height:190px;position:relative;overflow:hidden;border-radius:15px;background:linear-gradient(145deg,#302746,#171321);box-shadow:0 8px 20px #0004}
      .poster-art img,.rank-poster img{width:100%;height:100%;object-fit:cover;display:block}
      .poster-art>span{position:absolute;top:7px;left:7px;padding:4px 6px;border-radius:6px;background:#100d1dcc;color:#fff;font-size:8px;font-weight:850}
      .poster-art>button{position:absolute;right:8px;bottom:8px;width:32px;height:32px;border:1px solid #ffffff55;border-radius:50%;background:#a987f0e8;color:#1a102c;display:grid;place-items:center}
      .poster-card strong,.landscape-copy strong{color:#f5f1ff;font-size:12px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .poster-card small,.landscape-copy small{color:#aaa2b8;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .landscape-row{grid-auto-columns:230px}
      .landscape-card{overflow:hidden;border:1px solid #ffffff12;border-radius:17px;background:#1b1727;scroll-snap-align:start;text-decoration:none}
      .landscape-art{height:128px;position:relative;background:#292239}
      .landscape-art img{width:100%;height:100%;object-fit:cover;display:block}
      .landscape-art>span{position:absolute;left:8px;bottom:8px;padding:5px 8px;border-radius:7px;background:#100d1dcc;color:#eee7ff;font-size:9px;font-weight:750}
      .landscape-copy{padding:10px 11px 12px;display:flex;flex-direction:column;gap:5px}
      .ranked-list{display:flex;flex-direction:column;gap:9px;padding:0 18px 8px}
      .ranked-card{display:grid;grid-template-columns:34px 54px minmax(0,1fr) 24px;align-items:center;gap:10px;min-height:78px;padding:7px 10px;border:1px solid #ffffff10;border-radius:15px;background:linear-gradient(110deg,#211b30,#171421);text-decoration:none}
      .rank-number{font-size:19px;font-weight:900;font-style:italic;color:#a987ff;letter-spacing:-1px}
      .rank-poster{height:64px;width:54px;overflow:hidden;border-radius:9px;background:#302746}
      .rank-copy{min-width:0;display:flex;flex-direction:column;gap:4px}
      .rank-copy strong{color:#f6f1ff;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .rank-copy small{color:#a9a0b8;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .rank-copy span{color:#c3aaff;font-size:9px;font-weight:750}
      .rank-play{color:#b99bff}
      @media(min-width:700px){.poster-row,.landscape-row{padding-left:25px;padding-right:25px}.ranked-list{padding-left:25px;padding-right:25px}}
\n
      .fresh-row,.series-row{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0, min(290px, calc(100vw - 52px)));gap:12px;overflow-x:auto;overflow-y:hidden;align-items:stretch;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;padding:0 18px 12px;scrollbar-width:none}
      .fresh-row::-webkit-scrollbar,.series-row::-webkit-scrollbar{display:none}
      .fresh-row>.appstore-movie,.series-row>.appstore-movie{width:100%;min-width:0;max-width:100%;height:142px;min-height:142px;box-sizing:border-box;overflow:hidden}
      .fresh-row .appstore-artwork,.series-row .appstore-artwork{width:88px;height:122px;flex:none}
      .fresh-row .appstore-copy,.series-row .appstore-copy{min-width:0;max-width:100%;overflow:hidden}
      .appstore-skeleton{width:100%;height:142px;min-width:0;padding:10px;display:grid;grid-template-columns:88px minmax(0,1fr);gap:12px;box-sizing:border-box;border:1px solid rgba(255,255,255,.07);border-radius:19px;background:linear-gradient(145deg,#211d30,#151321);overflow:hidden;scroll-snap-align:start}
      .appstore-skeleton-art{height:122px;width:88px;border-radius:13px;background:linear-gradient(100deg,#242037 25%,#39314f 45%,#242037 65%);background-size:220% 100%;animation:shimmer 1.3s infinite}
      .appstore-skeleton-copy{display:flex;flex-direction:column;gap:10px;padding-top:9px;min-width:0}
      .appstore-skeleton-copy i{height:8px;border-radius:8px;background:linear-gradient(100deg,#28243a 25%,#403753 45%,#28243a 65%);background-size:220% 100%;animation:shimmer 1.3s infinite}
      .appstore-skeleton-copy i:nth-child(1){width:82%;height:11px}
      .appstore-skeleton-copy i:nth-child(2){width:95%}
      .appstore-skeleton-copy i:nth-child(3){width:58%}
      .appstore-skeleton-copy i:nth-child(4){width:70%;height:6px}
      .shelf-loading{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0, min(290px, calc(100vw - 52px)));gap:12px;overflow:hidden;padding:0 18px 12px}
      .shelf-loading .appstore-skeleton{width:100%}
      @media(min-width:700px){.fresh-row,.series-row,.shelf-loading{grid-auto-columns:290px;padding-left:25px;padding-right:25px}}

      .movie-row{grid-auto-columns:minmax(268px,290px);gap:12px;padding:0 18px 10px}
      .appstore-movie{width:100%;min-height:142px;padding:10px;display:grid;grid-template-columns:88px minmax(0,1fr);gap:12px;align-items:center;border-radius:19px;border:1px solid rgba(255,255,255,.085);background:linear-gradient(145deg,rgba(31,28,46,.94),rgba(18,16,29,.96));box-shadow:0 7px 22px rgba(0,0,0,.14);scroll-snap-align:start;transition:transform .2s,border-color .2s}
      .appstore-movie:active{transform:scale(.975);border-color:rgba(183,151,255,.38)}
      .appstore-artwork{height:122px;width:88px;position:relative;overflow:hidden;border-radius:13px;background:linear-gradient(145deg,#302746,#171321);box-shadow:0 5px 15px rgba(0,0,0,.3)}
      .appstore-artwork img{width:100%;height:100%;object-fit:cover;display:block}
      .artwork-fallback{height:100%;display:grid;place-items:center;color:#c6adff}
      .appstore-quality{position:absolute;left:6px;top:6px;padding:4px 6px;border-radius:6px;background:rgba(9,8,18,.78);color:#eee5ff;font-size:8px;font-weight:850;backdrop-filter:blur(9px)}
      .appstore-copy{min-width:0;display:flex;flex-direction:column;align-items:flex-start}
      .appstore-title-row{width:100%;display:flex;align-items:flex-start;justify-content:space-between;gap:7px}
      .appstore-name{min-width:0;margin:0;color:#f7f4ff;font-size:13px;line-height:1.3;font-weight:780;letter-spacing:-.2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .appstore-open{flex:none;padding:6px 12px;border-radius:999px;background:linear-gradient(110deg,#b18cff,#8055ef);color:#190f2d;font-size:10px;font-weight:850;box-shadow:0 3px 10px rgba(142,101,255,.2)}
      .appstore-original{width:100%;margin:6px 0 8px;color:#aaa3bb;font-size:10px;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .appstore-meta{display:flex;align-items:center;gap:7px;color:#d2cce0;font-size:9px;font-weight:650}
      .appstore-meta i{width:3px;height:3px;border-radius:50%;background:#9a8ab7}
      .appstore-kind{display:flex;align-items:center;gap:5px;margin-top:10px;color:#a99abf;font-size:8px;font-weight:850;letter-spacing:1px}
      .appstore-kind-dot{width:5px;height:5px;border-radius:50%;background:#a987ff;box-shadow:0 0 8px #a987ff}
      .shelf-loading{grid-auto-columns:minmax(268px,290px)}
      .shelf-loading .loading-card{width:100%;height:142px;aspect-ratio:auto;border-radius:19px}
      @media(min-width:700px){.movie-row{grid-auto-columns:290px;padding-left:25px;padding-right:25px}}
    `}</style>
\n    <nav className="dock-wrap" aria-label="Điều hướng chính"><div className="dock">{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={`dock-item ${active===item.id?"active":""}`} onClick={()=>{setActive(item.id);if(item.id==="home"){setShowSearch(false);setSearch("");}if(item.id==="search")setShowSearch(true);}}><Icon size={19} strokeWidth={active===item.id?2.3:1.8}/><span>{item.label}</span></button>;})}</div></nav>
  </main>;
}
