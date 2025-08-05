# Chợ Xanh - Deploy Vercel

Dự án đã được cấu trúc lại để tương thích hoàn toàn với Vercel.

## Thay đổi chính

✅ **Tách riêng frontend và API**
- Frontend: Static React app trong `dist/`
- API: Serverless functions trong `api/`

✅ **Cấu hình Vercel mới**
- `vercel.json` sử dụng functions thay vì builds
- Không còn conflict giữa build và functions

✅ **API serverless functions**
- Express.js chạy như serverless function
- Kết nối database qua PostgreSQL pooling
- Session management tương thích serverless

## Cách deploy

1. **Build frontend:**
   ```bash
   npm run build
   ```

2. **Push lên GitHub và connect Vercel**

3. **Set environment variables:**
   - `DATABASE_URL`: PostgreSQL connection string

4. **Deploy tự động**

## Cấu trúc mới
```
├── api/              # Vercel serverless functions
│   ├── index.js     # Tất cả API endpoints
│   ├── schema.js    # Database schema
│   └── package.json # Dependencies cho API
├── dist/            # Frontend build output
└── vercel.json      # Vercel config mới
```

## Test local

Development server vẫn hoạt động bình thường:
```bash
npm run dev
```

Admin login: `admin` / `NoAdmin123`