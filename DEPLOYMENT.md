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

- Tạo PostgreSQL database trên provider bạn chọn
- Lấy connection string (DATABASE_URL)
- Chạy migrations để tạo tables:
  ```bash
  npm run db:push
  ```

### 2. Deploy lên Vercel

1. Push code lên GitHub repository
2. Vào Vercel Dashboard và import project
3. Thiết lập Environment Variables:
   - `DATABASE_URL`: Connection string của database
   - `NODE_ENV`: `production`

4. Deploy sẽ tự động chạy

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

- ✅ Đồng bộ dữ liệu real-time
- ✅ Hỗ trợ nhiều thiết bị
- ✅ Database PostgreSQL
- ✅ API endpoints hoàn chỉnh
- ✅ Admin và student interfaces
- ✅ Market session management

## Hỗ trợ

Thông tin đăng nhập admin mặc định:
- Username: `admin`
- Password: `NoAdmin123`

Có thể thay đổi trong database sau khi deploy.