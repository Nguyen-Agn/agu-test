# ✅ Vercel Deployment Checklist

## Chuẩn bị trước khi deploy

### 🔐 Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NODE_ENV=production`

### 📁 File Structure (✅ Đã tối ưu)
- [x] `vercel.json` - Cấu hình routing và build
- [x] `.vercelignore` - Loại bỏ files không cần thiết
- [x] `build.js` - Script build tối ưu
- [x] `dist/` directory structure phù hợp

### 🛠 Code Quality (✅ Đã kiểm tra)
- [x] Không có TypeScript errors
- [x] Tất cả imports đã resolve đúng
- [x] Components UI đầy đủ (bao gồm toaster)
- [x] API endpoints hoạt động

### 🗃 Database Setup
- [ ] PostgreSQL database đã tạo
- [ ] Connection string đã test
- [ ] Tables đã migrate với `npm run db:push`
- [ ] Admin account đã tạo:
  ```sql
  INSERT INTO admins (username, password) 
  VALUES ('admin', 'NoAdmin123');
  ```

### 🚀 Deployment Steps
1. **GitHub**: Push code lên repository
2. **Vercel**: Import project từ GitHub
3. **Config**: Set environment variables
4. **Deploy**: Vercel sẽ auto-build và deploy
5. **Test**: Kiểm tra login/register hoạt động

### 🔍 Post-Deploy Testing
- [ ] Home page load được
- [ ] Register student account
- [ ] Login với student account  
- [ ] Login admin (admin/NoAdmin123)
- [ ] Admin có thể tạo market session
- [ ] Admin có thể tạo transaction cho student

### 🐛 Troubleshooting
- **Build fails**: Kiểm tra TypeScript errors
- **API 500**: Kiểm tra DATABASE_URL
- **Session issues**: Clear localStorage và login lại
- **404 errors**: Kiểm tra vercel.json routing config