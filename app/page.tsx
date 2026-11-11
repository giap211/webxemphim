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
      <section className="section"><div className="section-head"><h2 className="section-title"><Flame size={16} style={{display:"inline",verticalAlign:"-3px",color:"#b99bff"}}/> {categories.find(c=>c.type===category)?.label || "Phim mới"}</h2><a className="section-link" href="/danh-sach">Xem tất cả</a></div><div className="movie-row">{loading ? Array.from({length:7},(_,i)=><div className="movie-card" key={i}><div className="loading-card"/></div>) : movies.slice(0,18).map(movie=><MovieCard key={movie.id} movie={movie}/>)}</div>{!loading && movies.length===0 && <p className="empty-state">Chưa tải được danh sách phim. Hãy thử lại sau.</p>}</section>
      {featured.length>0 && <section className="section"><div className="section-head"><h2 className="section-title">Vừa cập nhật</h2><span className="section-link">Mới nhất</span></div><div className="movie-row">{featured.map(movie=><MovieCard key={movie.id} movie={movie}/>)}</div></section>}
      {categories.filter(c => c.type !== "phim-moi-cap-nhat").map(c => <section className="section" key={c.type}><div className="section-head"><h2 className="section-title">{c.label} nổi bật</h2><a className="section-link" href={`/danh-sach?type=${c.type}`}>Xem tất cả</a></div><div className="movie-row">{(shelves[c.type] || []).slice(0,14).map(movie=><MovieCard key={movie.id} movie={movie}/>)}</div>{!shelves[c.type] && <div className="shelf-loading">{Array.from({length:6},(_,i)=><div className="loading-card" key={i}/>)}</div>}</section>)}
    </>}

    <style jsx global>{`
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
