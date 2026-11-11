"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bookmark, Clapperboard, Play, Search, ShieldCheck, UserRound, Volume2 } from "lucide-react";

type Episode = { name: string; slug: string; embed: string; m3u8: string };
type Server = { name: string; episodes: Episode[] };
type Detail = { status: boolean; movie?: { slug: string; name: string; originName: string; content: string; year: number; time: string; quality: string; language: string; poster: string; backdrop: string; categories: {name:string}[]; actors: string[] }; servers?: Server[]; error?: string };

export default function MoviePage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<Detail | null>(null);
  const [selectedServer, setSelectedServer] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { let live = true; params.then(p => { if (live) setSlug(p.slug); }); return () => { live = false; }; }, [params]);
  useEffect(() => { if (!slug) return; let live = true; setLoading(true); fetch(`/api/movie/${encodeURIComponent(slug)}`).then(r=>r.json()).then((d:Detail)=>{if(!live)return;setData(d);setSelectedServer(0);setSelectedEpisode(null);}).catch(()=>{if(live)setData(null);}).finally(()=>{if(live)setLoading(false);}); return ()=>{live=false;}; }, [slug]);
  useEffect(() => { if (!selectedEpisode) return; const frame = requestAnimationFrame(() => playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); return () => cancelAnimationFrame(frame); }, [selectedEpisode]);
  const servers = data?.servers || [];
  const currentServer = servers[selectedServer];
  const episodes = currentServer?.episodes || [];
  const movie = data?.movie;
  const source = useMemo(()=>selectedEpisode?.embed || selectedEpisode?.m3u8 || "",[selectedEpisode]);
  if (loading) return <main className="detail-page"><p className="empty-state">Đang tải thông tin phim…</p></main>;
  if (!movie) return <main className="detail-page"><a className="detail-back" href="/"><ArrowLeft size={16}/> Trang chủ</a><div className="detail-error">{data?.error || "Không tìm thấy phim hoặc nguồn dữ liệu đang bận."}</div></main>;
  return <main className="app-shell"><header className="topbar"><a className="brand" href="/"><span className="brand-mark"><Clapperboard size={17}/></span><span>PHIM<span style={{color:"#b99bff"}}> LẬU</span></span></a><span className="eyebrow"><ShieldCheck size={13}/> MOBILE PLAYER</span></header>
    <article className="detail-page"><a className="detail-back" href="/"><ArrowLeft size={16}/> Quay lại khám phá</a>
      <div className="detail-cover" style={{backgroundImage:`url("${movie.backdrop || movie.poster}")`}}><h1>{movie.name}</h1></div>
      <div className="hero-meta" style={{marginTop:14}}><span>{movie.year || "—"}</span><i className="meta-dot"/><span>{movie.quality || "HD"}</span><i className="meta-dot"/><span>{movie.language || "Vietsub"}</span><i className="meta-dot"/><span>{movie.time || "Đang cập nhật"}</span></div>
      <div className="detail-play"><span className="primary-btn"><Play size={15} fill="currentColor"/> Chọn tập bên dưới để xem</span></div>
      {selectedEpisode && <section className="watch-section" ref={playerRef} aria-label="Trình phát phim"><div className="watch-heading"><div><span className="watch-kicker">ĐANG PHÁT</span><h2>{movie.name}</h2><p>{selectedEpisode.name || "Tập đang chọn"} · {currentServer?.name || "Máy chủ"}</p></div><span className="watch-live"><Volume2 size={14}/> PLAYER</span></div><div className="video-frame">{selectedEpisode.embed ? <iframe src={selectedEpisode.embed} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="no-referrer" title={`Xem ${movie.name} - ${selectedEpisode.name}`}/> : <video src={source} controls playsInline autoPlay preload="metadata"/>}</div><button className="change-episode" onClick={()=>document.getElementById("episode-picker")?.scrollIntoView({behavior:"smooth",block:"center"})}>Chọn tập khác <span>↓</span></button></section>}
      <p className="detail-info">{movie.content || movie.originName || "Thông tin phim đang được cập nhật."}</p>
      {movie.actors?.length>0 && <p className="detail-info"><b>Diễn viên:</b> {movie.actors.slice(0,8).join(", ")}</p>}
      <h2 className="server-title">Chọn máy chủ</h2>
      <div className="chips" style={{paddingLeft:0}}>{servers.map((server,index)=><button key={server.name+index} className={`chip ${selectedServer===index?"active":""}`} onClick={()=>{setSelectedServer(index);setSelectedEpisode(null);}}>{server.name}</button>)}</div>
      <h2 className="server-title" id="episode-picker">Danh sách tập</h2>
      {episodes.length ? <div className="episode-list">{episodes.map((episode,index)=><button key={episode.slug+index} className={`episode-btn ${selectedEpisode===episode?"active":""}`} onClick={()=>setSelectedEpisode(episode)}>{episode.name || `Tập ${index+1}`}</button>)}</div> : <p className="detail-info">Nguồn này chưa có danh sách tập khả dụng.</p>}
    </article>
    <nav className="dock-wrap" aria-label="Điều hướng chính"><div className="dock"><a className="dock-item active" href="/"><Clapperboard size={19}/><span>Khám phá</span></a><a className="dock-item" href="/?tab=search"><Search size={25}/><span>Tìm kiếm</span></a><a className="dock-item" href="/?tab=saved"><Bookmark size={25}/><span>Đã lưu</span></a><a className="dock-item" href="/?tab=account"><UserRound size={25}/><span>Tài khoản</span></a></div></nav>
  </main>;
}
