# Sửa lỗi Vercel Build

## Vấn đề gốc
```
error during build:
Could not resolve entry module "index.html".
```

## Nguyên nhân
- Vercel không thể tìm thấy entry point khi build
- Cấu trúc project có hai package.json (root và client)
- Root package.json build script không đúng cho Vercel

## Giải pháp

### 1. Cấu hình vercel.json đúng cách
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/*.js": {
      "runtime": "@vercel/node@3.0.0",
      "maxDuration": 30
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```

### 2. Build script tương thích
- Root build script chạy từ client directory
- Output trực tiếp vào dist/ directory
- Không cần copy file phức tạp

### 3. Cấu trúc cuối cùng
```
├── api/           # Vercel functions
├── dist/          # Frontend build output  
├── client/        # React source code
└── vercel.json    # Vercel config
```

## Test deploy
Sau khi fix:
1. `npm run build` - build thành công
2. Push lên GitHub
3. Vercel deploy tự động
4. Không còn lỗi entry module

## Kết quả
✅ Frontend: Static files served từ `/dist`
✅ API: Serverless functions từ `/api`
✅ No build conflicts
✅ Vercel compatible structure