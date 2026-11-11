"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Bookmark, Clapperboard, Compass, Flame, Home, Play, Search, Sparkles, UserRound } from "lucide-react";

type Movie = { id: string; slug: string; name: string; originName: string; poster: string; backdrop: string; year: number | null; quality: string; language: string; currentEpisode: string; rating: number | null };
type Feed = { status: boolean; items: Movie[] };
const categories = [{label:"Mới cập nhật",type:"phim-moi-cap-nhat"},{label:"Phim lẻ",type:"phim-le"},{label:"Phim bộ",type:"phim-bo"},{label:"Hoạt hình",type:"hoat-hinh"},{label:"TV Shows",type:"tv-shows"}];

function MovieCard({ movie }: { movie: Movie }) {
  return <a className="movie-card" href={`/phim/${movie.slug}`} aria-label={movie.name}>
    <div className="poster">{movie.poster ? <img src={movie.poster} alt={movie.name} loading="lazy" decoding="async" /> : null}<span className="poster-badge">{movie.quality || "HD"}</span></div>
    <p className="movie-name">{movie.name}</p><p className="movie-sub">{movie.year || "Mới"} · {movie.currentEpisode}</p>
  </a>;
}

export default function HomePage() {
  const [active, setActive] = useState("home");
  const [category, setCategory] = useState("phim-moi-cap-nhat");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [fresh, setFresh] = useState<Movie[]>([]);
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
    </>}
    <nav className="dock-wrap" aria-label="Điều hướng chính"><div className="dock">{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={`dock-item ${active===item.id?"active":""}`} onClick={()=>{setActive(item.id);if(item.id==="home"){setShowSearch(false);setSearch("");}if(item.id==="search")setShowSearch(true);}}><Icon size={19} strokeWidth={active===item.id?2.3:1.8}/><span>{item.label}</span></button>;})}</div></nav>
  </main>;
}
