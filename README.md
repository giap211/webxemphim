# XemPhim — Flutter

Ứng dụng xem phim Flutter ưu tiên Android/iOS, có thể build thêm Flutter Web.

## Chạy ứng dụng
```bash
flutter pub get
flutter run --dart-define=API_BASE_URL=https://YOUR-VERCEL-DOMAIN
```

## Build Android
```bash
flutter build apk --release --dart-define=API_BASE_URL=https://YOUR-VERCEL-DOMAIN
```

## Build Web
```bash
flutter build web --release --dart-define=API_BASE_URL=https://YOUR-VERCEL-DOMAIN
```

## API giữ lại
- PhimAPI là nguồn chính: phimapi.com
- OPhim là nguồn dự phòng: ophim.cc
- GET /api/movies?type=phim-moi-cap-nhat&page=1
- GET /api/movies?type=phim-le&page=1
- GET /api/movies?q=keyword
- GET /api/movie/:slug

API proxy chuẩn hóa poster/backdrop, metadata, máy chủ và các tập m3u8/embed.
