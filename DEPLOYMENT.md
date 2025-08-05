# Hướng dẫn Deploy lên Vercel

## Chuẩn bị

1. **Database**: Dự án sử dụng PostgreSQL. Bạn có thể sử dụng:
   - Vercel Postgres
   - Neon Database
   - Supabase
   - Hoặc bất kỳ PostgreSQL provider nào

2. **Environment Variables**: Cần thiết lập các biến môi trường:
   ```
   DATABASE_URL=your_postgres_connection_string
   NODE_ENV=production
   ```

## Bước deploy

### 1. Thiết lập database

- Tạo PostgreSQL database trên provider bạn chọn (khuyến nghị Neon hoặc Vercel Postgres)
- Lấy connection string (DATABASE_URL)
- Chạy migrations để tạo tables:
  ```bash
  npm run db:push
  ```

### 2. Build project cục bộ (khuyến nghị)

```bash
# Tạo build tối ưu
node build.js

# Kiểm tra build
ls -la dist/
```

### 3. Deploy lên Vercel

**Phương pháp A: Qua GitHub (khuyến nghị)**
1. Push code lên GitHub repository
2. Vào Vercel Dashboard và import project
3. Thiết lập Environment Variables:
   - `DATABASE_URL`: Connection string của database
   - `NODE_ENV`: `production`
4. Deploy sẽ tự động chạy với `vercel.json` config

**Phương pháp B: Vercel CLI**
```bash
npm i -g vercel
vercel --prod
```

### 3. Khởi tạo dữ liệu admin

Sau khi deploy, cần tạo admin account:

```sql
INSERT INTO admins (username, password) 
VALUES ('admin', 'NoAdmin123');
```

Bạn có thể chạy qua database console hoặc tạo script khởi tạo.

### 4. Tạo phiên chợ demo (tùy chọn)

```sql
INSERT INTO market_sessions (title, date, location, time_slot, waste_types, gifts) 
VALUES ('Phiên Chợ Xanh Tuần Tới', NOW() + INTERVAL '7 days', 'Sân trước thư viện trường', '8:00 - 17:00', 'Giấy, nhựa, kim loại, chai lọ', 'Cây xanh, túi vải, đồ dùng học tập');
```

## Tính năng chính

- ✅ Đồng bộ dữ liệu real-time qua PostgreSQL
- ✅ Hỗ trợ nhiều thiết bị và người dùng đồng thời
- ✅ Authentication với session management
- ✅ API endpoints RESTful hoàn chỉnh
- ✅ Giao diện admin và student riêng biệt
- ✅ Quản lý phiên chợ và giao dịch
- ✅ Tự động tính điểm và thống kê

## Khắc phục lỗi thường gặp

### 1. Lỗi deployment trên Vercel
- Đảm bảo `vercel.json` được cấu hình đúng
- Kiểm tra environment variables đã được thiết lập
- Build script phải có `vercel-build` command

### 2. Lỗi kết nối database
- Xác minh DATABASE_URL có đúng format không
- Kiểm tra database có accessible từ Vercel không
- Chạy migrations với `npm run db:push`

### 3. Session không persist
- Đảm bảo có middleware session trong server
- Kiểm tra `X-Session-ID` header được gửi từ client
- Xóa localStorage và thử đăng nhập lại

## Hỗ trợ

Thông tin đăng nhập admin mặc định:
- Username: `admin`
- Password: `NoAdmin123`

Có thể thay đổi trong database sau khi deploy.