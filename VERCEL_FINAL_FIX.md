# Sửa lỗi MIME Type trên Vercel

## Vấn đề
```
Failed to load module script: Expected a JavaScript-or-Wasm module script 
but the server responded with a MIME type of "text/html"
```

## Nguyên nhân
- Vercel không serve JS files với MIME type đúng
- Routes configuration phức tạp gây conflict
- Firebase dependencies vẫn còn

## Giải pháp đã áp dụng

### 1. Gỡ Firebase hoàn toàn
```bash
npm uninstall firebase-admin
```

### 2. Cấu trúc Vercel đơn giản
```json
{
  "version": 2,
  "functions": {
    "api/*.js": {
      "runtime": "@vercel/node@3.0.0"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3. Build output vào public/
- Frontend build vào `public/` directory 
- Vercel tự động serve static files từ public/
- Không cần custom headers hay routing phức tạp

### 4. Kết quả
```
public/
├── index.html     # HTML với title đúng
├── 404.html       # SPA fallback
└── assets/        # JS, CSS với MIME type đúng
```

## Test
- `public/index.html` có title "Chợ Xanh"
- JavaScript modules load với MIME type đúng
- API functions từ `api/` directory
- Không còn Firebase dependencies