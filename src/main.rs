use leptos::{mount::mount_to_body, prelude::*};
use wasm_bindgen::JsCast;
use web_sys::{HtmlElement, HtmlVideoElement};

#[derive(Clone)]
struct Clip {
    id: usize,
    video: &'static str,
    poster: &'static str,
    user: &'static str,
    caption: &'static str,
    music: &'static str,
    likes: &'static str,
    comments: &'static str,
}

fn demo_clips() -> Vec<Clip> {
    vec![
        Clip { id: 0, video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", poster: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop", user: "@wander.vn", caption: "Có những nơi chỉ cần đặt chân đến là thấy lòng nhẹ tênh 🌿", music: "Âm thanh gốc · Wander Vietnam", likes: "128,6K", comments: "2.481" },
        Clip { id: 1, video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", poster: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=900&auto=format&fit=crop", user: "@night.frames", caption: "Một chút bình yên giữa thành phố không ngủ 🌃", music: "Midnight City · slowed", likes: "86,2K", comments: "1.093" },
        Clip { id: 2, video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", poster: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=900&auto=format&fit=crop", user: "@roadtrip.daily", caption: "Bật nhạc lên và cứ thế đi thôi. Bạn muốn đến đâu?", music: "The Road · original sound", likes: "42,7K", comments: "864" },
        Clip { id: 3, video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", poster: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=900&auto=format&fit=crop", user: "@cinema.mood", caption: "Những khung hình đẹp đôi khi kể được cả một câu chuyện 🎬", music: "Cinematic ambience", likes: "205K", comments: "3.012" },
        Clip { id: 4, video: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", poster: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900&auto=format&fit=crop", user: "@nature.loop", caption: "Lưu lại khoảnh khắc này cho một ngày thật mệt.", music: "Soft morning · original sound", likes: "19,4K", comments: "327" },
        Clip { id: 5, video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", poster: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=900&auto=format&fit=crop", user: "@discover.more", caption: "Thế giới rộng lớn, đừng chỉ đứng yên một chỗ ✨", music: "Dreaming · sped up", likes: "64,1K", comments: "719" },
    ]
}

#[component]
fn App() -> impl IntoView {
    let (active, set_active) = signal(0usize);
    let (muted, set_muted) = signal(true);
    let (comments_open, set_comments_open) = signal(false);
    let (active_tab, set_active_tab) = signal("Trang chủ".to_string());
    let clips = demo_clips();

    // Only the video occupying the feed viewport is allowed to play.
    Effect::new(move |_| {
        let current = active.get();
        if let Some(document) = web_sys::window().and_then(|window| window.document()) {
            if let Ok(nodes) = document.query_selector_all(".feed-video") {
                for index in 0..nodes.length() {
                    if let Some(node) = nodes.item(index) {
                        if let Ok(video) = node.dyn_into::<HtmlVideoElement>() {
                            if index as usize == current {
                                let _ = video.play();
                            } else {
                                video.pause();
                            }
                        }
                    }
                }
            }
        }
    });

    view! {
        <main class="app-shell">
            <header class="feed-header">
                <button class="feed-tab muted-tab" on:click=move |_| set_active_tab.set("Đang follow".to_string())>"Đang follow"</button>
                <span class="header-divider"></span>
                <button class="feed-tab selected-tab" on:click=move |_| set_active_tab.set("Dành cho bạn".to_string())>"Dành cho bạn"</button>
                <span class="live-pill">"LIVE"</span>
            </header>

            <section
                class="feed-scroll"
                on:scroll=move |event| {
                    let element = event_target::<HtmlElement>(&event);
                    let height = element.client_height().max(1);
                    let index = ((element.scroll_top() + height / 2) / height) as usize;
                    set_active.set(index);
                }
            >
                {clips.into_iter().map(|clip| {
                    let (liked, set_liked) = signal(false);
                    let (following, set_following) = signal(false);
                    let (saved, set_saved) = signal(false);
                    let id = clip.id;
                    let video_src = clip.video;
                    let poster = clip.poster;
                    let user = clip.user;
                    let caption = clip.caption;
                    let music = clip.music;
                    let likes = clip.likes;
                    let comments = clip.comments;
                    view! {
                        <article class="feed-item" data-index=id>
                            <video
                                class="feed-video"
                                src=video_src
                                poster=poster
                                muted=move || muted.get()
                                playsinline=true
                                loop=true
                                preload="metadata"
                            ></video>
                            <div class="video-gradient"></div>
                            <div class="feed-overlay">
                                <div class="creator-info">
                                    <div class="creator-line">
                                        <strong>{user}</strong>
                                        <button class="follow-button" on:click=move |_| set_following.update(|value| *value = !*value)>
                                            {move || if following.get() { "Đang follow" } else { "Follow" }}
                                        </button>
                                    </div>
                                    <p class="caption">{caption}</p>
                                    <div class="sound-line"><span class="music-disc">"♫"</span><span>{music}</span></div>
                                </div>
                                <aside class="action-rail">
                                    <div class="avatar-wrap"><img src=poster alt="Ảnh đại diện"/></div>
                                    <button class:liked=move || liked.get() class="action-button" on:click=move |_| set_liked.update(|value| *value = !*value)>
                                        <span class="action-icon">{move || if liked.get() { "♥" } else { "♡" }}</span>
                                        <small>{move || if liked.get() { "128,7K" } else { likes }}</small>
                                    </button>
                                    <button class="action-button" on:click=move |_| set_comments_open.set(true)>
                                        <span class="action-icon">"●"</span><small>{comments}</small>
                                    </button>
                                    <button class:liked=move || saved.get() class="action-button" on:click=move |_| set_saved.update(|value| *value = !*value)>
                                        <span class="action-icon">{move || if saved.get() { "★" } else { "☆" }}</span><small>"Lưu"</small>
                                    </button>
                                    <button class="action-button" on:click=move |_| {
                                        if let Some(window) = web_sys::window() {
                                            if let Ok(url) = window.location().href() {
                                                let _ = window.navigator().clipboard().write_text(&url);
                                            }
                                        }
                                    }>
                                        <span class="action-icon share-icon">"➦"</span><small>"Chia sẻ"</small>
                                    </button>
                                    <button class="record-disc" on:click=move |_| set_muted.update(|value| *value = !*value)>
                                        <span>{move || if muted.get() { "♪" } else { "♫" }}</span>
                                    </button>
                                </aside>
                            </div>
                            <div class="video-index">{format!("{:02}", id + 1)}</div>
                        </article>
                    }
                }).collect_view()}
            </section>

            <nav class="bottom-nav">
                <button class:nav-active=move || active_tab.get() == "Trang chủ" on:click=move |_| set_active_tab.set("Trang chủ".to_string())>
                    <span class="nav-icon">"⌂"</span><small>"Trang chủ"</small>
                </button>
                <button class:nav-active=move || active_tab.get() == "Khám phá" on:click=move |_| set_active_tab.set("Khám phá".to_string())>
                    <span class="nav-icon">"⌕"</span><small>"Khám phá"</small>
                </button>
                <button class="create-button" on:click=move |_| set_comments_open.set(true)><span>"+"</span></button>
                <button class:nav-active=move || active_tab.get() == "Hộp thư" on:click=move |_| set_active_tab.set("Hộp thư".to_string())>
                    <span class="nav-icon">"✉"</span><small>"Hộp thư"</small>
                </button>
                <button class:nav-active=move || active_tab.get() == "Hồ sơ" on:click=move |_| set_active_tab.set("Hồ sơ".to_string())>
                    <span class="nav-icon">"◎"</span><small>"Hồ sơ"</small>
                </button>
            </nav>

            {move || if comments_open.get() {
                view! {
                    <div class="sheet-backdrop">
                        <section class="comments-sheet">
                            <div class="sheet-handle"></div>
                            <div class="sheet-heading"><strong>"Bình luận"</strong><button on:click=move |_| set_comments_open.set(false)>"✕"</button></div>
                            <div class="comment-row"><div class="comment-avatar">"M"</div><div><b>"minh.anh"</b><p>"Video đẹp quá, lưu lại để xem sau ❤️"</p><small>"2 giờ trước · Trả lời"</small></div></div>
                            <div class="comment-row"><div class="comment-avatar">"T"</div><div><b>"thanh.nam"</b><p>"Góc quay và màu sắc đỉnh thật sự!"</p><small>"5 giờ trước · Trả lời"</small></div></div>
                            <div class="comment-input"><input placeholder="Thêm bình luận..."/><button>"Gửi"</button></div>
                        </section>
                    </div>
                }.into_any()
            } else {
                view! { <div></div> }.into_any()
            }}
        </main>
    }
}

fn main() {
    mount_to_body(App);
}
