import 'dart:convert';
import 'dart:html' as html;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:http/http.dart' as http;
import 'package:video_player/video_player.dart';

const bg=Color(0xFF090811), panel=Color(0xFF191426), purple=Color(0xFF9B79FF);

String appImage(String raw) {
 final value = raw.trim();
 if (value.isEmpty) return '';
 if (value.startsWith('/api/image?')) return Uri.base.resolve(value).toString();
 String absolute = value;
 if (absolute.startsWith('//')) absolute = 'https:$absolute';
 if (absolute.startsWith('http://')) absolute = 'https://${absolute.substring(7)}';
 if (!absolute.startsWith('http://') && !absolute.startsWith('https://')) {
  absolute = 'https://phimimg.com/${absolute.replaceFirst(RegExp(r'^/+'), '')}';
 }
 return Uri.base.resolve('/api/image?url=${Uri.encodeComponent(absolute)}').toString();
}
void main()=>runApp(const MovieApp());

class Movie {
 final String slug,name,original,poster,backdrop,quality,episode;
 final int? year;
 Movie(Map<String,dynamic> j):slug='${j['slug']??''}',name='${j['name']??'Phim'}',original='${j['originName']??''}',poster=appImage('${j['poster']??''}'),backdrop=appImage('${j['backdrop']??j['poster']??''}'),quality='${j['quality']??'HD'}',episode='${j['currentEpisode']??''}',year=int.tryParse('${j['year']??''}');
}
class Ep {final String name,embed,m3u8; Ep(Map<String,dynamic> j):name='${j['name']??''}',embed='${j['embed']??''}',m3u8='${j['m3u8']??''}';}
class Server {final String name;final List<Ep> eps;Server(Map<String,dynamic> j):name='${j['name']??'Server'}',eps=(j['episodes'] as List? ?? []).map((e)=>Ep(Map<String,dynamic>.from(e))).toList();}
class FilmDetail {
 final String name,content,backdrop,quality,language;final int? year;final List<Server> servers;
 FilmDetail(Map<String,dynamic> j):name='${j['name']??''}',content='${j['content']??''}',backdrop=appImage('${j['backdrop']??''}'),quality='${j['quality']??'HD'}',language='${j['language']??'Vietsub'}',year=int.tryParse('${j['year']??''}'),servers=(j['_servers'] as List? ?? []).map((e)=>Server(Map<String,dynamic>.from(e))).toList();
}
class Api {
 static Future<List<Movie>> list({String type='phim-moi-cap-nhat',String? q}) async {
  final uri=Uri.base.resolve('/api/movies').replace(queryParameters:{if(q!=null&&q.isNotEmpty)'q':q else 'type':type,'page':'1'});
  final r=await http.get(uri).timeout(const Duration(seconds:25));if(r.statusCode!=200)throw Exception('API không phản hồi');
  final j=jsonDecode(r.body);return ((j['items'] as List?)??[]).map((e)=>Movie(Map<String,dynamic>.from(e))).toList();
 }
 static Future<FilmDetail> detail(String slug) async {
  final r=await http.get(Uri.base.resolve('/api/movie/${Uri.encodeComponent(slug)}')).timeout(const Duration(seconds:25));
  if(r.statusCode!=200)throw Exception('Không lấy được thông tin phim');
  final j=Map<String,dynamic>.from(jsonDecode(r.body));final m=Map<String,dynamic>.from(j['movie']);m['_servers']=j['servers']??[];return FilmDetail(m);
 }
}
class MovieApp extends StatelessWidget {const MovieApp({super.key});@override Widget build(BuildContext c)=>MaterialApp(debugShowCheckedModeBanner:false,title:'XemPhim',theme:ThemeData(brightness:Brightness.dark,scaffoldBackgroundColor:bg,colorScheme:ColorScheme.fromSeed(seedColor:purple,brightness:Brightness.dark),textTheme:GoogleFonts.interTextTheme(ThemeData.dark().textTheme),useMaterial3:true),home:const Home());}
class Home extends StatefulWidget {const Home({super.key});@override State<Home> createState()=>_HomeState();}
class _HomeState extends State<Home>{
 int tab=0;final pages=const ['phim-moi-cap-nhat','phim-le','phim-bo'];final titles=const ['Khám phá','Phim lẻ','Phim bộ'];
 @override Widget build(BuildContext c)=>Scaffold(body:IndexedStack(index:tab,children:[const Explore(),const Category(type:'phim-le',title:'Phim lẻ'),const Category(type:'phim-bo',title:'Phim bộ'),const SearchPage()]),bottomNavigationBar:SafeArea(minimum:const EdgeInsets.fromLTRB(14,0,14,10),child:Container(height:68,decoration:BoxDecoration(color:const Color(0xEE211A32),borderRadius:BorderRadius.circular(25),border:Border.all(color:Colors.white12)),child:Row(children:[_nav(0,Icons.home_rounded,'Trang chủ'),_nav(1,Icons.movie_outlined,'Phim lẻ'),_nav(2,Icons.live_tv_rounded,'Phim bộ'),_nav(3,Icons.search_rounded,'Tìm kiếm')]))));
 Widget _nav(int i,IconData icon,String label)=>Expanded(child:InkWell(borderRadius:BorderRadius.circular(20),onTap:()=>setState(()=>tab=i),child:AnimatedContainer(duration:const Duration(milliseconds:220),margin:const EdgeInsets.all(5),decoration:BoxDecoration(gradient:tab==i?const LinearGradient(colors:[Color(0xFFB99BFF),Color(0xFF7650D8)]):null,borderRadius:BorderRadius.circular(19)),child:Column(mainAxisAlignment:MainAxisAlignment.center,children:[Icon(icon,size:21),Text(label,style:const TextStyle(fontSize:10,fontWeight:FontWeight.w700))]))));
}
class Explore extends StatefulWidget {const Explore({super.key});@override State<Explore> createState()=>_ExploreState();}
class _ExploreState extends State<Explore>{
 late Future<List<Movie>> fresh;@override void initState(){super.initState();fresh=Api.list();}
 @override
 Widget build(BuildContext c) {
  return RefreshIndicator(
   color: purple,
   onRefresh: () async { setState(() { fresh = Api.list(); }); },
   child: CustomScrollView(
    slivers: [
     SliverToBoxAdapter(
      child: Padding(
       padding: const EdgeInsets.fromLTRB(20,54,20,18),
       child: Row(children: [
        const Icon(Icons.movie_filter,color:purple,size:28),
        const SizedBox(width:9),
        Text('XEMPHIM',style:GoogleFonts.inter(fontWeight:FontWeight.w900,letterSpacing:2)),
        const Spacer(),
        const Icon(Icons.notifications_none),
       ]),
      ),
     ),
     SliverToBoxAdapter(
      child: SizedBox(
       height: 400,
       child: FutureBuilder<List<Movie>>(
        future: fresh,
        builder: (context, snapshot) {
         if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child:CircularProgressIndicator(color:purple));
         }
         if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child:Text('Chưa tải được danh sách phim'));
         }
         final movie = snapshot.data!.first;
         return GestureDetector(
          onTap: () => Navigator.push(context,MaterialPageRoute(builder: (_) => DetailPage(movie:movie))),
          child: Container(
           margin: const EdgeInsets.symmetric(horizontal:15),
           decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(25),
            image: DecorationImage(image:CachedNetworkImageProvider(movie.backdrop),fit:BoxFit.cover),
           ),
           child: Container(
            padding: const EdgeInsets.all(22),
            alignment: Alignment.bottomLeft,
            decoration: BoxDecoration(
             borderRadius: BorderRadius.circular(25),
             gradient: const LinearGradient(begin:Alignment.topCenter,end:Alignment.bottomCenter,colors:[Colors.transparent,bg]),
            ),
            child: Column(
             mainAxisAlignment: MainAxisAlignment.end,
             crossAxisAlignment: CrossAxisAlignment.start,
             children: [
              const Text('ĐỀ XUẤT HÔM NAY',style:TextStyle(color:Color(0xFFC6AEFF),letterSpacing:2)),
              Text(movie.name,style:const TextStyle(fontSize:28,fontWeight:FontWeight.w900)),
              Text('${movie.year ?? ''} • ${movie.quality}'),
              FilledButton.icon(
               onPressed: () => Navigator.push(context,MaterialPageRoute(builder: (_) => DetailPage(movie:movie))),
               icon: const Icon(Icons.play_arrow),
               label: const Text('Xem ngay'),
              ),
             ],
            ),
           ),
          ),
         );
        },
       ),
      ),
     ),
     for (final type in ['phim-moi-cap-nhat','phim-le','phim-bo','hoat-hinh'])
      SliverToBoxAdapter(
       child: MovieRow(
        title: type == 'phim-le' ? 'Phim lẻ' : type == 'phim-bo' ? 'Phim bộ' : type == 'hoat-hinh' ? 'Hoạt hình' : 'Mới cập nhật',
        future: Api.list(type:type),
       ),
      ),
     const SliverToBoxAdapter(child:SizedBox(height:25)),
    ],
   ),
  );
 }

}

class Category extends StatelessWidget {final String type,title;const Category({super.key,required this.type,required this.title});@override Widget build(BuildContext c)=>SafeArea(child:Column(children:[Padding(padding:const EdgeInsets.all(20),child: Text(title,style:const TextStyle(fontSize:25,fontWeight:FontWeight.w900))),Expanded(child:FutureBuilder<List<Movie>>(future:Api.list(type:type),builder:(c,s){if(!s.hasData)return const Center(child:CircularProgressIndicator(color:purple));return GridView.builder(padding:const EdgeInsets.all(13),gridDelegate:const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount:3,childAspectRatio:.48,crossAxisSpacing:10,mainAxisSpacing:12),itemCount:s.data!.length,itemBuilder:(c,i)=>Poster(movie:s.data![i]));}))]));}
class SearchPage extends StatefulWidget{const SearchPage({super.key});@override State<SearchPage> createState()=>_SearchPageState();}
class _SearchPageState extends State<SearchPage>{final ctl=TextEditingController();Future<List<Movie>>? result;@override void dispose(){ctl.dispose();super.dispose();}@override Widget build(BuildContext c)=>SafeArea(child:Column(children:[Padding(padding:const EdgeInsets.all(16),child:TextField(controller:ctl,onSubmitted:(q)=>setState(()=>result=Api.list(q:q)),decoration:InputDecoration(hintText:'Tìm tên phim...',prefixIcon:const Icon(Icons.search),filled:true,fillColor:panel,border:OutlineInputBorder(borderRadius:BorderRadius.circular(18),borderSide:BorderSide.none)))),Expanded(child:FutureBuilder<List<Movie>>(future:result,builder:(c,s){if(s.connectionState==ConnectionState.waiting)return const Center(child:CircularProgressIndicator(color:purple));if(!s.hasData)return const Center(child:Text('Nhập tên phim để tìm kiếm'));return GridView.builder(padding:const EdgeInsets.all(12),gridDelegate:const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount:3,childAspectRatio:.48,crossAxisSpacing:10,mainAxisSpacing:12),itemCount:s.data!.length,itemBuilder:(c,i)=>Poster(movie:s.data![i]));}))]));}
class MovieRow extends StatelessWidget{final String title;final Future<List<Movie>> future;const MovieRow({super.key,required this.title,required this.future});@override Widget build(BuildContext c)=>Padding(padding:const EdgeInsets.only(top:20),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Padding(padding:const EdgeInsets.fromLTRB(18,0,18,12),child:Text(title,style:const TextStyle(fontWeight:FontWeight.w900,fontSize:18))),SizedBox(height:240,child:FutureBuilder<List<Movie>>(future:future,builder:(c,s)=>!s.hasData?const Center(child:CircularProgressIndicator(color:purple)):ListView.separated(padding:const EdgeInsets.symmetric(horizontal:15),scrollDirection:Axis.horizontal,itemCount:s.data!.length,separatorBuilder:(_,__)=>const SizedBox(width:12),itemBuilder:(c,i)=>SizedBox(width:125,child:Poster(movie:s.data![i])))))]));}
class Poster extends StatelessWidget {
 final Movie movie;
 const Poster({super.key,required this.movie});
 @override
 Widget build(BuildContext c) => GestureDetector(
  onTap: () => Navigator.push(c,MaterialPageRoute(builder: (_) => DetailPage(movie:movie))),
  child: Column(
   crossAxisAlignment: CrossAxisAlignment.start,
   children: [
    AspectRatio(
     aspectRatio: 2/3,
     child: ClipRRect(
      borderRadius: BorderRadius.circular(13),
      child: CachedNetworkImage(
       imageUrl: movie.poster,
       fit: BoxFit.cover,
       width: double.infinity,
       placeholder: (_,__) => Container(color:panel,child:const Center(child:CircularProgressIndicator(strokeWidth:2,color:purple))),
       errorWidget: (_,__,___) => Container(color:panel,child:const Center(child:Icon(Icons.movie_outlined,color:Colors.white38,size:32))),
      ),
     ),
    ),
    const SizedBox(height:6),
    SizedBox(
     height:32,
     child: Text(movie.name,maxLines:2,overflow:TextOverflow.ellipsis,style:const TextStyle(fontSize:11,fontWeight:FontWeight.bold,height:1.25)),
    ),
   ],
  ),
 );
}
class DetailPage extends StatelessWidget{final Movie movie;const DetailPage({super.key,required this.movie});@override Widget build(BuildContext c)=>Scaffold(body:FutureBuilder<FilmDetail>(future:Api.detail(movie.slug),builder:(c,s){if(!s.hasData)return const Center(child:CircularProgressIndicator(color:purple));final d=s.data!;return CustomScrollView(slivers:[SliverAppBar(expandedHeight:300,pinned:true,flexibleSpace:FlexibleSpaceBar(title:Text(d.name),background:Stack(fit:StackFit.expand,children:[CachedNetworkImage(imageUrl:d.backdrop,fit:BoxFit.cover),const DecoratedBox(decoration:BoxDecoration(gradient:LinearGradient(begin:Alignment.topCenter,end:Alignment.bottomCenter,colors:[Colors.transparent,bg])))]))),SliverToBoxAdapter(child:Padding(padding:const EdgeInsets.all(18),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text('${d.year??''} • ${d.quality} • ${d.language}',style:const TextStyle(color:Colors.white60)),const SizedBox(height:15),FilledButton.icon(onPressed:()=>showEpisodes(c,d),icon:const Icon(Icons.play_arrow),label:const Text('Chọn tập xem phim')),const SizedBox(height:20),const Text('NỘI DUNG',style:TextStyle(color:purple,fontWeight:FontWeight.bold)),const SizedBox(height:8),Text(d.content.replaceAll(RegExp(r'<[^>]*>'),' '),style:const TextStyle(height:1.6,color:Colors.white70))])))]);}));}
void showEpisodes(BuildContext context, FilmDetail detail) {
 showModalBottomSheet(
  context: context,
  isScrollControlled: true,
  backgroundColor: panel,
  builder: (sheetContext) => SafeArea(
   child: SizedBox(
    height: MediaQuery.of(sheetContext).size.height * .85,
    child: Column(
     children: [
      Padding(
       padding: const EdgeInsets.all(16),
       child: Text('Chọn tập • ${detail.name}',style:const TextStyle(fontWeight:FontWeight.bold,fontSize:18)),
      ),
      Expanded(
       child: ListView(
        children: [
         for (final server in detail.servers) ...[
          Padding(
           padding: const EdgeInsets.all(12),
           child: Text(server.name,style:const TextStyle(color:purple,fontWeight:FontWeight.bold)),
          ),
          Wrap(
           children: [
            for (final episode in server.eps)
             Padding(
              padding: const EdgeInsets.all(5),
              child: FilledButton.tonal(
               onPressed: () => Navigator.push(sheetContext,MaterialPageRoute(builder: (_) => PlayerPage(title:detail.name,ep:episode))),
               child: Text(episode.name),
              ),
             ),
           ],
          ),
         ],
        ],
       ),
      ),
     ],
    ),
   ),
  ),
 );
}

class PlayerPage extends StatefulWidget {
 final String title;
 final Ep ep;
 const PlayerPage({super.key,required this.title,required this.ep});
 @override State<PlayerPage> createState()=>_PlayerPageState();
}

class _PlayerPageState extends State<PlayerPage> {
 VideoPlayerController? player;
 String? error;
 bool controlsVisible = true;
 bool seeking = false;
 bool muted = false;
 bool fullscreen = false;
 double seekValue = 0;
 double volume = 1;

 @override
 void initState() {
  super.initState();
  if (widget.ep.m3u8.isNotEmpty) {
   player = VideoPlayerController.networkUrl(Uri.parse(widget.ep.m3u8));
   player!.addListener(_videoChanged);
   player!.initialize().then((_) {
    if (!mounted) return;
    setState(() {});
    player!.play();
   }).catchError((_) {
    if (mounted) setState(() => error='Nguồn phim không phát được. Hãy thử server khác.');
   });
  } else if (widget.ep.embed.isNotEmpty) {
   error = 'Nguồn này dùng trình phát nhúng. Mở nguồn trong tab mới để xem phim.';
  } else {
   error = 'Không tìm thấy đường dẫn phát phim.';
  }
 }

 void _videoChanged() {
  if (!mounted || seeking || player == null || !player!.value.isInitialized) return;
  setState(() => seekValue = player!.value.position.inMilliseconds.toDouble());
 }

 String _time(Duration value) {
  final minutes = value.inMinutes.remainder(60).toString().padLeft(2,'0');
  final seconds = value.inSeconds.remainder(60).toString().padLeft(2,'0');
  final hours = value.inHours;
  return hours > 0 ? '${hours.toString().padLeft(2,'0')}:$minutes:$seconds' : '$minutes:$seconds';
 }

 Future<void> _seek(int seconds) async {
  final p = player;
  if (p == null || !p.value.isInitialized) return;
  final target = p.value.position + Duration(seconds:seconds);
  final duration = p.value.duration;
  await p.seekTo(target < Duration.zero ? Duration.zero : (target > duration ? duration : target));
 }

 Future<void> _toggleFullscreen() async {
  try {
   if (fullscreen) {
    await html.document.exitFullscreen();
   } else {
    await html.document.documentElement?.requestFullscreen();
   }
   if (mounted) setState(() => fullscreen = !fullscreen);
  } catch (_) {
   if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content:Text('Trình duyệt này không hỗ trợ toàn màn hình.')));
  }
 }

 @override
 void dispose() {
  player?.removeListener(_videoChanged);
  player?.dispose();
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  super.dispose();
 }

 @override
 Widget build(BuildContext c) {
  final p = player;
  final ready = p?.value.isInitialized == true;
  final duration = ready ? p!.value.duration : Duration.zero;
  final position = ready ? p!.value.position : Duration.zero;
  final playing = ready && p!.value.isPlaying;
  return Scaffold(
   backgroundColor:Colors.black,
   appBar:AppBar(
    backgroundColor:Colors.black,
    title:Text(widget.title,maxLines:1,overflow:TextOverflow.ellipsis),
    actions:[
     if(widget.ep.embed.isNotEmpty)
      IconButton(tooltip:'Mở nguồn nhúng',onPressed:()=>html.window.open(widget.ep.embed,'_blank'),icon:const Icon(Icons.open_in_new)),
    ],
   ),
   body:Center(
    child:ConstrainedBox(
     constraints:const BoxConstraints(maxWidth:1100),
     child:AspectRatio(
      aspectRatio:16/9,
      child:ColoredBox(
       color:Colors.black,
       child:ready
        ? GestureDetector(
           behavior:HitTestBehavior.opaque,
           onTap:()=>setState(()=>controlsVisible=!controlsVisible),
           child:Stack(
            fit:StackFit.expand,
            children:[
             Center(child:AspectRatio(aspectRatio:p!.value.aspectRatio,child:VideoPlayer(p))),
             if(controlsVisible)
              DecoratedBox(
               decoration:const BoxDecoration(gradient:LinearGradient(begin:Alignment.topCenter,end:Alignment.bottomCenter,colors:[Color(0x99000000),Colors.transparent,Color(0xCC000000)],stops:[0,.42,1])),
               child:Column(
                children:[
                 Padding(
                  padding:const EdgeInsets.fromLTRB(14,8,8,0),
                  child:Row(children:[
                   Expanded(child:Text('${widget.title} • ${widget.ep.name}',maxLines:1,overflow:TextOverflow.ellipsis,style:const TextStyle(fontWeight:FontWeight.w700))),
                   IconButton(onPressed:_toggleFullscreen,icon:Icon(fullscreen?Icons.fullscreen_exit:Icons.fullscreen,color:Colors.white)),
                  ]),
                 ),
                 const Spacer(),
                 Row(
                  mainAxisAlignment:MainAxisAlignment.center,
                  children:[
                   IconButton(iconSize:34,onPressed:()=>_seek(-10),icon:const Icon(Icons.replay_10,color:Colors.white)),
                   const SizedBox(width:28),
                   IconButton(
                    iconSize:58,
                    onPressed:()=>setState(()=>playing?p!.pause():p!.play()),
                    icon:Icon(playing?Icons.pause_circle_filled:Icons.play_circle_fill,color:Colors.white),
                   ),
                   const SizedBox(width:28),
                   IconButton(iconSize:34,onPressed:()=>_seek(10),icon:const Icon(Icons.forward_10,color:Colors.white)),
                  ],
                 ),
                 const Spacer(),
                 Padding(
                  padding:const EdgeInsets.fromLTRB(14,0,14,12),
                  child:Column(
                   children:[
                    SliderTheme(
                     data:SliderTheme.of(c).copyWith(trackHeight:3,thumbShape:const RoundSliderThumbShape(enabledThumbRadius:6),overlayShape:const RoundSliderOverlayShape(overlayRadius:12)),
                     child:Slider(
                      min:0,
                      max:(duration.inMilliseconds>0?duration.inMilliseconds:1).toDouble(),
                      value:seekValue.clamp(0,(duration.inMilliseconds>0?duration.inMilliseconds:1).toDouble()).toDouble(),
                      onChangeStart:(_)=>setState(()=>seeking=true),
                      onChanged:(v)=>setState(()=>seekValue=v),
                      onChangeEnd:(v){p!.seekTo(Duration(milliseconds:v.round()));setState(()=>seeking=false);},
                     ),
                    ),
                    Row(
                     children:[
                      Text('${_time(position)} / ${_time(duration)}',style:const TextStyle(fontSize:11,color:Colors.white70)),
                      const Spacer(),
                      IconButton(
                       visualDensity:VisualDensity.compact,
                       onPressed:()=>setState((){muted=!muted;p!.setVolume(muted?0:volume);}),
                       icon:Icon(muted?Icons.volume_off:Icons.volume_up,color:Colors.white,size:20),
                      ),
                      SizedBox(
                       width:90,
                       child:Slider(
                        min:0,max:1,value:muted?0:volume,
                        onChanged:(v){setState((){volume=v;muted=v==0;});p!.setVolume(v);},
                       ),
                      ),
                     ],
                    ),
                   ],
                  ),
                 ),
                ],
               ),
              ),
            ],
           ),
          )
        : Center(
           child:Padding(
            padding:const EdgeInsets.all(24),
            child:Column(
             mainAxisSize:MainAxisSize.min,
             children:[
              if(error==null) const CircularProgressIndicator(color:purple),
              if(error!=null) ...[
               const Icon(Icons.play_circle_outline,color:purple,size:48),
               const SizedBox(height:12),
               Text(error!,textAlign:TextAlign.center,style:const TextStyle(color:Colors.white70)),
               if(widget.ep.embed.isNotEmpty) ...[
                const SizedBox(height:16),
                FilledButton.icon(onPressed:()=>html.window.open(widget.ep.embed,'_blank'),icon:const Icon(Icons.open_in_new),label:const Text('Mở trình phát')),
               ],
              ],
             ],
            ),
           ),
          ),
      ),
     ),
    ),
   ),
  );
 }
}
