import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:http/http.dart' as http;
import 'package:video_player/video_player.dart';
import 'package:webview_flutter/webview_flutter.dart';

const bg = Color(0xFF090811), card = Color(0xFF191426), violet = Color(0xFF9B79FF);
const apiBase = String.fromEnvironment('API_BASE_URL', defaultValue: '');

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(const XemPhimApp());
}

String apiRoot() {
  if (apiBase.isNotEmpty) return apiBase;
  return 'https://webxemphim.vercel.app';
}

class Movie {
  final String slug, name, origin, poster, backdrop, quality, episode;
  final int? year;
  Movie(Map<String, dynamic> j)
      : slug = (j['slug'] ?? '').toString(),
        name = (j['name'] ?? 'Chưa rõ tên').toString(),
        origin = (j['originName'] ?? '').toString(),
        poster = (j['poster'] ?? '').toString(),
        backdrop = (j['backdrop'] ?? j['poster'] ?? '').toString(),
        quality = (j['quality'] ?? 'HD').toString(),
        episode = (j['currentEpisode'] ?? 'Mới cập nhật').toString(),
        year = int.tryParse((j['year'] ?? '').toString());
}

class Episode {
  final String name, embed, m3u8;
  Episode(Map<String, dynamic> j)
      : name = (j['name'] ?? '').toString(),
        embed = (j['embed'] ?? '').toString(),
        m3u8 = (j['m3u8'] ?? '').toString();
}
class Server {
  final String name;
  final List<Episode> episodes;
  Server(Map<String, dynamic> j)
      : name = (j['name'] ?? 'Máy chủ').toString(),
        episodes = (j['episodes'] as List? ?? []).map((e) => Episode(Map<String, dynamic>.from(e))).toList();
}
class Detail {
  final String name, origin, content, poster, backdrop, quality, language, time;
  final int? year;
  final List<String> actors;
  final List<Server> servers;
  Detail(Map<String, dynamic> j)
      : name = (j['name'] ?? '').toString(),
        origin = (j['originName'] ?? '').toString(),
        content = (j['content'] ?? '').toString(),
        poster = (j['poster'] ?? '').toString(),
        backdrop = (j['backdrop'] ?? j['poster'] ?? '').toString(),
        quality = (j['quality'] ?? 'HD').toString(),
        language = (j['language'] ?? 'Vietsub').toString(),
        time = (j['time'] ?? '').toString(),
        year = int.tryParse((j['year'] ?? '').toString()),
        actors = (j['actors'] as List? ?? []).map((e) => e.toString()).toList(),
        servers = (j['_servers'] as List? ?? []).map((e) => Server(Map<String, dynamic>.from(e))).toList();
}

class Api {
  static Future<List<Movie>> movies({String type = 'phim-moi-cap-nhat', String? q}) async {
    final uri = Uri.parse(apiRoot() + '/api/movies').replace(queryParameters: {
      if (q != null && q.trim().isNotEmpty) 'q': q.trim() else 'type': type,
      'page': '1',
    });
    final r = await http.get(uri).timeout(const Duration(seconds: 25));
    if (r.statusCode != 200) throw Exception('API phim đang bận');
    final data = jsonDecode(r.body) as Map<String, dynamic>;
    return (data['items'] as List? ?? []).map((e) => Movie(Map<String, dynamic>.from(e))).toList();
  }
  static Future<Detail> detail(String slug) async {
    final uri = Uri.parse(apiRoot() + '/api/movie/' + Uri.encodeComponent(slug));
    final r = await http.get(uri).timeout(const Duration(seconds: 25));
    if (r.statusCode != 200) throw Exception('Không tìm thấy phim');
    final data = jsonDecode(r.body) as Map<String, dynamic>;
    final movie = Map<String, dynamic>.from(data['movie']);
    movie['_servers'] = data['servers'] ?? [];
    return Detail(movie);
  }
}

class XemPhimApp extends StatelessWidget {
  const XemPhimApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    debugShowCheckedModeBanner: false,
    title: 'XemPhim',
    theme: ThemeData(
      brightness: Brightness.dark, scaffoldBackgroundColor: bg,
      colorScheme: ColorScheme.fromSeed(seedColor: violet, brightness: Brightness.dark),
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
      useMaterial3: true,
    ),
    home: const MainShell(),
  );
}

class MainShell extends StatefulWidget {
  const MainShell({super.key});
  @override
  State<MainShell> createState() => _MainShellState();
}
class _MainShellState extends State<MainShell> {
  int index = 0;
  @override
  Widget build(BuildContext context) => Scaffold(
    body: IndexedStack(index: index, children: const [
      ExploreScreen(), CategoryScreen(type: 'phim-le', title: 'Phim lẻ'),
      CategoryScreen(type: 'phim-bo', title: 'Phim bộ'), SearchScreen()
    ]),
    bottomNavigationBar: SafeArea(
      minimum: const EdgeInsets.fromLTRB(14, 0, 14, 10),
      child: Container(
        height: 70, padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: const Color(0xDD211A32), borderRadius: BorderRadius.circular(28),
          border: Border.all(color: Colors.white24),
          boxShadow: [BoxShadow(color: violet.withOpacity(.16), blurRadius: 28)],
        ),
        child: Row(children: [
          nav(0, Icons.grid_view_rounded, 'Khám phá'),
          nav(1, Icons.movie_creation_outlined, 'Phim lẻ'),
          nav(2, Icons.live_tv_rounded, 'Phim bộ'),
          nav(3, Icons.search_rounded, 'Tìm kiếm'),
        ]),
      ),
    ),
  );
  Widget nav(int i, IconData icon, String label) => Expanded(child: GestureDetector(
    onTap: () => setState(() => index = i),
    child: AnimatedContainer(duration: const Duration(milliseconds: 250),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: index == i ? const LinearGradient(colors: [Color(0xFFB99BFF), Color(0xFF7650D8)]) : null,
      ),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(icon, size: 21), const SizedBox(height: 3),
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700)),
      ]),
    ),
  ));
}

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});
  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}
class _ExploreScreenState extends State<ExploreScreen> {
  final Map<String, List<Movie>> shelves = {};
  bool loading = true;
  final types = const [
    ('phim-moi-cap-nhat', 'Mới cập nhật'), ('phim-le', 'Phim lẻ'),
    ('phim-bo', 'Phim bộ'), ('hoat-hinh', 'Hoạt hình'), ('tv-shows', 'TV Shows')
  ];
  @override
  void initState() { super.initState(); load(); }
  Future<void> load() async {
    for (final t in types) {
      try { shelves[t.$1] = await Api.movies(type: t.$1); } catch (_) { shelves[t.$1] = []; }
      if (mounted) setState(() => loading = false);
    }
  }
  @override
  Widget build(BuildContext context) {
    final fresh = shelves['phim-moi-cap-nhat'] ?? [];
    return RefreshIndicator(
      color: violet, onRefresh: () async { shelves.clear(); setState(() => loading = true); await load(); },
      child: CustomScrollView(slivers: [
        SliverToBoxAdapter(child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 55, 20, 18),
          child: Row(children: [
            const Icon(Icons.movie_filter_rounded, color: violet, size: 27),
            const SizedBox(width: 9),
            Text('XEMPHIM', style: GoogleFonts.inter(fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 18)),
            const Spacer(), const Icon(Icons.notifications_none_rounded),
          ]),
        )),
        if (fresh.isNotEmpty) SliverToBoxAdapter(child: GestureDetector(
          onTap: () => openMovie(context, fresh.first),
          child: Container(
            height: 410, margin: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: card, borderRadius: BorderRadius.circular(25),
              image: fresh.first.backdrop.isEmpty ? null : DecorationImage(image: CachedNetworkImageProvider(fresh.first.backdrop), fit: BoxFit.cover),
            ),
            child: Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(25),
                gradient: const LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Colors.transparent, Color(0xF5090710)], stops: [.35, 1])),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.end, children: [
                const Text('ĐỀ XUẤT HÔM NAY', style: TextStyle(color: Color(0xFFC6AEFF), fontSize: 10, letterSpacing: 2, fontWeight: FontWeight.w900)),
                const SizedBox(height: 8),
                Text(fresh.first.name, maxLines: 2, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
                const SizedBox(height: 8),
                Text('${fresh.first.year ?? 'Mới'}  •  ${fresh.first.quality}  •  Vietsub', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                const SizedBox(height: 14),
                FilledButton.icon(onPressed: () => openMovie(context, fresh.first), icon: const Icon(Icons.play_arrow), label: const Text('Xem ngay')),
              ]),
            ),
          ),
        )),
        if (loading) const SliverToBoxAdapter(child: LinearProgressIndicator(color: violet)),
        for (final t in types)
          if ((shelves[t.$1] ?? []).isNotEmpty)
            SliverToBoxAdapter(child: MovieShelf(title: t.$2, movies: shelves[t.$1]!)),
        if (!loading && shelves.values.every((e) => e.isEmpty))
          const SliverFillRemaining(child: Center(child: Text('Chưa tải được dữ liệu phim'))),
        const SliverToBoxAdapter(child: SizedBox(height: 25)),
      ]),
    );
  }
}

class CategoryScreen extends StatefulWidget {
  final String type, title;
  const CategoryScreen({super.key, required this.type, required this.title});
  @override
  State<CategoryScreen> createState() => _CategoryScreenState();
}
class _CategoryScreenState extends State<CategoryScreen> {
  late Future<List<Movie>> future;
  @override
  void initState() { super.initState(); future = Api.movies(type: widget.type); }
  @override
  Widget build(BuildContext context) => SafeArea(child: Column(children: [
    Padding(padding: const EdgeInsets.all(20), child: Align(alignment: Alignment.centerLeft, child: Text(widget.title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)))),
    Expanded(child: FutureBuilder<List<Movie>>(future: future, builder: (context, snap) {
      if (snap.connectionState != ConnectionState.done) return const Center(child: CircularProgressIndicator(color: violet));
      if (snap.hasError) return Center(child: TextButton(onPressed: () => setState(() => future = Api.movies(type: widget.type)), child: const Text('Tải lại')));
      final list = snap.data ?? [];
      return GridView.builder(padding: const EdgeInsets.all(14), gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, childAspectRatio: .48, crossAxisSpacing: 10, mainAxisSpacing: 14), itemCount: list.length, itemBuilder: (_, i) => PosterCard(movie: list[i]));
    })),
  ]));
}

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}
class _SearchScreenState extends State<SearchScreen> {
  final controller = TextEditingController();
  Timer? timer;
  List<Movie> results = [];
  bool busy = false;
  @override
  void dispose() { timer?.cancel(); controller.dispose(); super.dispose(); }
  void search(String q) {
    timer?.cancel();
    if (q.trim().isEmpty) { setState(() => results = []); return; }
    timer = Timer(const Duration(milliseconds: 350), () async {
      setState(() => busy = true);
      try { results = await Api.movies(q: q); } catch (_) { results = []; }
      if (mounted) setState(() => busy = false);
    });
  }
  @override
  Widget build(BuildContext context) => SafeArea(child: Column(children: [
    Padding(padding: const EdgeInsets.all(16), child: TextField(controller: controller, onChanged: search,
      decoration: InputDecoration(hintText: 'Tìm tên phim, diễn viên...', prefixIcon: const Icon(Icons.search), filled: true, fillColor: card, border: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: BorderSide.none)))),
    if (busy) const LinearProgressIndicator(color: violet),
    Expanded(child: results.isEmpty ? const Center(child: Text('Nhập tên phim để tìm kiếm', style: TextStyle(color: Colors.white54))) :
      GridView.builder(padding: const EdgeInsets.all(14), gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, childAspectRatio: .48, crossAxisSpacing: 10, mainAxisSpacing: 14), itemCount: results.length, itemBuilder: (_, i) => PosterCard(movie: results[i]))),
  ]));
}

class MovieShelf extends StatelessWidget {
  final String title;
  final List<Movie> movies;
  const MovieShelf({super.key, required this.title, required this.movies});
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.only(top: 17), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Padding(padding: const EdgeInsets.fromLTRB(18, 0, 18, 12), child: Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900))),
    SizedBox(height: 218, child: ListView.separated(padding: const EdgeInsets.symmetric(horizontal: 16), scrollDirection: Axis.horizontal, itemCount: movies.length, separatorBuilder: (_, __) => const SizedBox(width: 12), itemBuilder: (_, i) => SizedBox(width: 124, child: PosterCard(movie: movies[i])))),
  ]));
}

class PosterCard extends StatelessWidget {
  final Movie movie;
  const PosterCard({super.key, required this.movie});
  @override
  Widget build(BuildContext context) => GestureDetector(onTap: () => openMovie(context, movie), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Expanded(child: Stack(fit: StackFit.expand, children: [
      ClipRRect(borderRadius: BorderRadius.circular(13), child: movie.poster.isEmpty ? Container(color: card) : CachedNetworkImage(imageUrl: movie.poster, fit: BoxFit.cover, placeholder: (_, __) => Container(color: card), errorWidget: (_, __, ___) => Container(color: card, child: const Icon(Icons.movie_outlined)))),
      Positioned(left: 6, top: 6, child: Container(padding: const EdgeInsets.all(5), decoration: BoxDecoration(color: Colors.black87, borderRadius: BorderRadius.circular(5)), child: Text(movie.quality, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800)))),
    ])),
    const SizedBox(height: 7),
    Text(movie.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
    Text(movie.origin.isEmpty ? '${movie.year ?? 'Phim mới'}' : movie.origin, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 9, color: Colors.white54)),
  ]));
}

void openMovie(BuildContext context, Movie movie) => Navigator.push(context, MaterialPageRoute(builder: (_) => DetailScreen(movie: movie)));

class DetailScreen extends StatefulWidget {
  final Movie movie;
  const DetailScreen({super.key, required this.movie});
  @override
  State<DetailScreen> createState() => _DetailScreenState();
}
class _DetailScreenState extends State<DetailScreen> {
  late Future<Detail> future;
  @override
  void initState() { super.initState(); future = Api.detail(widget.movie.slug); }
  @override
  Widget build(BuildContext context) => Scaffold(body: FutureBuilder<Detail>(future: future, builder: (context, snap) {
    if (snap.connectionState != ConnectionState.done) return const Center(child: CircularProgressIndicator(color: violet));
    if (snap.hasError || !snap.hasData) return Center(child: TextButton(onPressed: () => setState(() => future = Api.detail(widget.movie.slug)), child: const Text('Không tải được phim — thử lại')));
    final d = snap.data!;
    final count = d.servers.fold<int>(0, (n, s) => n + s.episodes.length);
    return CustomScrollView(slivers: [
      SliverAppBar(expandedHeight: 320, pinned: true, flexibleSpace: FlexibleSpaceBar(title: Text(d.name, maxLines: 1, overflow: TextOverflow.ellipsis), background: Stack(fit: StackFit.expand, children: [
        if (d.backdrop.isNotEmpty) CachedNetworkImage(imageUrl: d.backdrop, fit: BoxFit.cover),
        const DecoratedBox(decoration: BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Colors.transparent, bg], stops: [.25, 1]))),
        Positioned(left: 20, bottom: 65, child: Text(d.name, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900))),
      ]))),
      SliverToBoxAdapter(child: Padding(padding: const EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('${d.year ?? '—'} • ${d.quality} • ${d.language} • ${d.time}', style: const TextStyle(color: Colors.white60, fontSize: 12)),
        const SizedBox(height: 16),
        FilledButton.icon(onPressed: count == 0 ? null : () => pickEpisode(d), icon: const Icon(Icons.play_arrow), label: Text('Chọn tập để xem • $count tập'), style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(52))),
        const SizedBox(height: 22),
        const Text('NỘI DUNG', style: TextStyle(color: violet, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
        const SizedBox(height: 8),
        Text(d.content.replaceAll(RegExp(r'<[^>]*>'), ' ').replaceAll('&nbsp;', ' ').replaceAll('&amp;', '&'), style: const TextStyle(color: Colors.white70, height: 1.6)),
        if (d.actors.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 16), child: Text('Diễn viên: ' + d.actors.take(10).join(', '), style: const TextStyle(color: Colors.white60))),
      ]))),
    ]);
  }));
  void pickEpisode(Detail d) {
    showModalBottomSheet(context: context, isScrollControlled: true, backgroundColor: card, builder: (ctx) {
      int server = 0;
      return StatefulBuilder(builder: (ctx, setSheet) => SafeArea(child: SizedBox(height: MediaQuery.of(ctx).size.height * .82, child: Column(children: [
        Padding(padding: const EdgeInsets.all(18), child: Row(children: [Expanded(child: Text(d.name, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900))), IconButton(onPressed: () => Navigator.pop(ctx), icon: const Icon(Icons.close))])),
        SizedBox(height: 48, child: ListView.builder(scrollDirection: Axis.horizontal, itemCount: d.servers.length, itemBuilder: (_, i) => Padding(padding: const EdgeInsets.symmetric(horizontal: 5), child: ChoiceChip(label: Text(d.servers[i].name), selected: server == i, onSelected: (_) => setSheet(() => server = i))))),
        Expanded(child: GridView.builder(padding: const EdgeInsets.all(14), gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, childAspectRatio: 2.1, crossAxisSpacing: 8, mainAxisSpacing: 8), itemCount: d.servers.isEmpty ? 0 : d.servers[server].episodes.length, itemBuilder: (_, i) {
          final ep = d.servers[server].episodes[i];
          return FilledButton.tonal(onPressed: () { Navigator.pop(ctx); Navigator.push(context, MaterialPageRoute(builder: (_) => PlayerScreen(title: d.name, episode: ep))); }, child: Text(ep.name.isEmpty ? 'Tập ' + (i + 1).toString() : ep.name));
        })),
      ]))));
    });
  }
}

class PlayerScreen extends StatefulWidget {
  final String title;
  final Episode episode;
  const PlayerScreen({super.key, required this.title, required this.episode});
  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}
class _PlayerScreenState extends State<PlayerScreen> {
  VideoPlayerController? video;
  WebViewController? web;
  String? error;
  @override
  void initState() { super.initState(); initPlayer(); }
  Future<void> initPlayer() async {
    if (widget.episode.m3u8.isNotEmpty) {
      try {
        video = VideoPlayerController.networkUrl(Uri.parse(widget.episode.m3u8));
        await video!.initialize(); await video!.play();
        if (mounted) setState(() {});
      } catch (_) { if (mounted) setState(() => error = 'Không thể phát video từ máy chủ này.'); }
    } else if (widget.episode.embed.isNotEmpty) {
      web = WebViewController()..setJavaScriptMode(JavaScriptMode.unrestricted)..loadRequest(Uri.parse(widget.episode.embed));
      if (mounted) setState(() {});
    } else { error = 'Tập phim chưa có đường dẫn phát.'; }
  }
  @override
  void dispose() { video?.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(widget.title, maxLines: 1, overflow: TextOverflow.ellipsis)),
    body: Column(children: [
      AspectRatio(aspectRatio: 16 / 9, child: Container(color: Colors.black, child:
        video != null && video!.value.isInitialized
          ? Stack(alignment: Alignment.bottomCenter, children: [VideoPlayer(video!), VideoProgressIndicator(video!, allowScrubbing: true)])
          : web != null ? WebViewWidget(controller: web!) : Center(child: error == null ? const CircularProgressIndicator(color: violet) : Text(error!)))),
      Padding(padding: const EdgeInsets.all(18), child: Row(children: [const Icon(Icons.play_circle_outline, color: violet), const SizedBox(width: 8), Text(widget.episode.name)])),
      if (video != null && video!.value.isInitialized) IconButton(onPressed: () => setState(() => video!.value.isPlaying ? video!.pause() : video!.play()), icon: Icon(video!.value.isPlaying ? Icons.pause_circle : Icons.play_circle, color: violet, size: 48)),
    ]),
  );
}
