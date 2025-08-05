# Netlify Deployment Checklist

## Pre-deployment Setup

### 1. Environment Variables
Trong Netlify Dashboard, thêm các environment variables sau:
- `DATABASE_URL`: PostgreSQL connection string từ Neon
- `NODE_ENV`: production
- `PGDATABASE`: tên database
- `PGHOST`: host từ Neon
- `PGPASSWORD`: password từ Neon
- `PGPORT`: 5432
- `PGUSER`: username từ Neon

### 2. Build Settings
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 20

### 3. Database Migration
Chạy lệnh sau để push schema lên database:
```bash
npm run db:push
```

### 4. Admin Account
Đảm bảo admin account đã được tạo:
- Username: admin
- Password: NoAdmin123

## Deployment Process

### 1. Connect Repository
- Kết nối GitHub repository với Netlify
- Chọn branch main/master

### 2. Build Configuration
- Netlify sẽ tự động detect Node.js project
- Kiểm tra build settings match với checklist

### 3. Deploy
- Trigger deployment
- Monitor build logs
- Verify deployment success

## Post-deployment Verification

### 1. Test Core Features
- [ ] Trang chủ load thành công
- [ ] Đăng ký sinh viên hoạt động
- [ ] Đăng nhập admin (admin/NoAdmin123)
- [ ] Admin có thể xem danh sách sinh viên
- [ ] Admin có thể tạo market session
- [ ] Student dashboard hiển thị đúng

### 2. Database Connectivity
- [ ] Kiểm tra kết nối database
- [ ] Verify data persistence
- [ ] Test CRUD operations

### 3. Performance Check
- [ ] Site load time < 3s
- [ ] API response time < 2s
- [ ] Mobile responsive

## Common Issues & Solutions

### Build Errors
- Kiểm tra Node version compatibility
- Verify all dependencies installed
- Check environment variables

### Database Issues
- Verify connection string format
- Check firewall settings
- Ensure database is accessible

### Routing Issues
- Confirm _redirects file configuration
- Test SPA routing works
- Verify API endpoints accessible

## Optimization Features

### Static Files
- Gzip compression enabled
- CDN caching configured
- Asset optimization

### Security
- HTTPS enforced
- Environment variables secured
- Database credentials protected

## Success Indicators
✅ Build completes without errors
✅ Site loads at custom domain
✅ All features work as expected
✅ Database operations successful
✅ Admin panel fully functional