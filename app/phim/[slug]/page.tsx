"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Clapperboard, Film, Play, Search, ShieldCheck, Volume2, X } from "lucide-react";

type Episode = { name: string; slug: string; embed: string; m3u8: string };
type Server = { name: string; episodes: Episode[] };
type Detail = { status: boolean; movie?: { slug: string; name: string; originName: string; content: string; year: number; time: string; quality: string; language: string; poster: string; backdrop: string; categories: {name:string}[]; actors: string[] }; servers?: Server[]; error?: string };

export default function MoviePage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<Detail | null>(null);
  const [selectedServer, setSelectedServer] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [episodePickerOpen, setEpisodePickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { let live = true; params.then(p => { if (live) setSlug(p.slug); }); return () => { live = false; }; }, [params]);
  useEffect(() => { if (!slug) return; let live = true; setLoading(true); fetch(`/api/movie/${encodeURIComponent(slug)}`).then(r=>r.json()).then((d:Detail)=>{if(!live)return;setData(d);setSelectedServer(0);setSelectedEpisode(null);}).catch(()=>{if(live)setData(null);}).finally(()=>{if(live)setLoading(false);}); return ()=>{live=false;}; }, [slug]);
  useEffect(() => { if (!selectedEpisode) return; const frame = requestAnimationFrame(() => playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); return () => cancelAnimationFrame(frame); }, [selectedEpisode]);
  useEffect(() => { if (!episodePickerOpen) return; const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setEpisodePickerOpen(false); }; window.addEventListener("keydown", closeOnEscape); return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", closeOnEscape); }; }, [episodePickerOpen]);
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
      <div className="detail-play"><button type="button" className="primary-btn episode-open-button" onClick={()=>setEpisodePickerOpen(true)} disabled={!servers.some(server=>server.episodes.length)}><Play size={15} fill="currentColor"/> Chọn tập để xem <span className="episode-count">{servers.reduce((total,server)=>total+server.episodes.length,0)} tập</span></button></div>
      {selectedEpisode && <section className="watch-section" ref={playerRef} aria-label="Trình phát phim"><div className="watch-heading"><div><span className="watch-kicker">ĐANG PHÁT</span><h2>{movie.name}</h2><p>{selectedEpisode.name || "Tập đang chọn"} · {currentServer?.name || "Máy chủ"}</p></div><span className="watch-live"><Volume2 size={14}/> PLAYER</span></div><div className="video-frame">{selectedEpisode.embed ? <iframe src={selectedEpisode.embed} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="no-referrer" title={`Xem ${movie.name} - ${selectedEpisode.name}`}/> : <video src={source} controls playsInline autoPlay preload="metadata"/>}</div><button className="change-episode" onClick={()=>document.getElementById("episode-picker")?.scrollIntoView({behavior:"smooth",block:"center"})}>Chọn tập khác <span>↓</span></button></section>}
      <p className="detail-info">{movie.content || movie.originName || "Thông tin phim đang được cập nhật."}</p>
      {movie.actors?.length>0 && <p className="detail-info"><b>Diễn viên:</b> {movie.actors.slice(0,8).join(", ")}</p>}
      {episodePickerOpen && <div className="episode-picker-overlay" role="dialog" aria-modal="true" aria-label="Chọn tập phim"><div className="episode-picker-panel"><header className="episode-picker-header"><div><span className="watch-kicker">DANH SÁCH PHÁT</span><h2>{movie.name}</h2><p>{episodes.length} tập · {currentServer?.name || "Chọn máy chủ"}</p></div><button type="button" className="episode-picker-close" aria-label="Đóng" onClick={()=>setEpisodePickerOpen(false)}><X size={21}/></button></header><div className="episode-server-tabs">{servers.map((server,index)=><button type="button" key={server.name+index} className={selectedServer===index?"active":""} onClick={()=>{setSelectedServer(index);setSelectedEpisode(null);}}>{server.name}</button>)}</div><div className="episode-picker-scroll"><div className="episode-picker-grid">{episodes.map((episode,index)=><button type="button" key={episode.slug+index} className={`episode-picker-item ${selectedEpisode?.slug===episode.slug?"active":""}`} onClick={()=>{setSelectedEpisode(episode);setEpisodePickerOpen(false);}}><span>{episode.name || `Tập ${index+1}`}</span>{selectedEpisode?.slug===episode.slug && <span className="episode-selected-mark">ĐANG CHỌN</span>}</button>)}</div>{episodes.length===0 && <p className="detail-info">Máy chủ này chưa có tập khả dụng.</p>}</div><div className="episode-picker-footer"><Film size={15}/> Chọn một tập để bắt đầu xem</div></div></div>}
    </article>
    <style jsx global>{`
      .episode-open-button{width:100%;max-width:360px;min-height:48px;justify-content:center;cursor:pointer}
      .episode-open-button:disabled{opacity:.45;cursor:not-allowed}
      .episode-count{margin-left:auto;padding:5px 8px;border-radius:999px;background:rgba(22,13,43,.18);font-size:10px}
      .episode-picker-overlay{position:fixed;inset:0;z-index:110;background:rgba(7,6,13,.97);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);display:flex;flex-direction:column;padding:calc(14px + env(safe-area-inset-top)) 0 calc(12px + env(safe-area-inset-bottom))}
      .episode-picker-panel{width:100%;height:100%;min-height:0;display:flex;flex-direction:column;max-width:760px;margin:0 auto}
      .episode-picker-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:8px 20px 17px;border-bottom:1px solid rgba(255,255,255,.09)}
      .episode-picker-header h2{font-size:19px;line-height:1.25;margin:5px 0 4px;color:#f7f3ff}
      .episode-picker-header p{margin:0;color:#aaa2ba;font-size:11px}
      .episode-picker-close{width:42px;height:42px;flex:none;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(255,255,255,.07);display:grid;place-items:center;color:#eee8ff}
      .episode-server-tabs{display:flex;gap:8px;overflow-x:auto;padding:15px 18px 12px;scrollbar-width:none}
      .episode-server-tabs button{flex:none;padding:10px 15px;border:1px solid rgba(255,255,255,.1);border-radius:999px;background:#191626;color:#bdb5cf;font-size:11px;font-weight:700}
      .episode-server-tabs button.active{background:linear-gradient(110deg,#b18cff,#8055ef);border-color:transparent;color:#190f2d}
      .episode-picker-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:8px 18px 20px}
      .episode-picker-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
      .episode-picker-item{min-height:54px;padding:9px 8px;border:1px solid rgba(255,255,255,.09);border-radius:13px;background:linear-gradient(145deg,#211d30,#151321);color:#eee8ff;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:5px;text-align:left;font-size:12px;font-weight:700;overflow:hidden}
      .episode-picker-item.active{border-color:#a987ff;background:linear-gradient(145deg,rgba(151,112,255,.3),rgba(73,49,123,.24));color:#fff}
      .episode-selected-mark{font-size:7px;letter-spacing:.7px;color:#c8b0ff}
      .episode-picker-footer{padding:13px 20px 5px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:8px;color:#a99fba;font-size:10px}
      @media(min-width:600px){.episode-picker-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.episode-picker-overlay{padding-top:24px;padding-bottom:24px}}
    `}</style>
    <nav className="dock-wrap" aria-label="Điều hướng chính"><div className="dock"><a className="dock-item active" href="/"><Clapperboard size={22}/><span>Khám phá</span></a><a className="dock-item" href="/danh-sach?type=phim-le"><Clapperboard size={22}/><span>Phim lẻ</span></a><a className="dock-item" href="/danh-sach?type=phim-bo"><Film size={22}/><span>Phim bộ</span></a><a className="dock-item" href="/?tab=search"><Search size={22}/><span>Tìm kiếm</span></a></div></nav>
  </main>;
}
