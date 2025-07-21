# CHỢ XANH - VIETNAMESE WASTE EXCHANGE MARKETPLACE

## TỔNG QUAN DỰ ÁN
Website đơn giản cho chương trình đổi rác lấy điểm tại trường đại học:
- Sinh viên đăng ký tham gia, xem điểm tích lũy
- Admin quản lý sinh viên và cập nhật điểm
- Hiển thị lịch phiên chợ sắp tới

## CẤU TRÚC DỰ ÁN
```
/client         - Frontend React với TypeScript
/server         - Backend Express.js với TypeScript  
/shared         - Schema và types chung
```

## CÔNG NGHỆ SỬ DỤNG
### Frontend:
- React + TypeScript
- Tailwind CSS + shadcn/ui components
- Wouter (routing)
- TanStack Query (state management)
- React Hook Form + Zod (forms & validation)

### Backend:
- Node.js + Express.js
- TypeScript
- Session-based authentication (in-memory)
- Firebase Admin SDK (đã chuẩn bị)

## DATABASE
### HIỆN TẠI: In-memory storage
- Dữ liệu lưu trong RAM, mất khi restart server
- Có sẵn admin: username "admin", password "admin123"

### ĐÃ CHUẨN BỊ: Firebase Firestore
- File server/firebase.ts đã setup với config của bạn
- File server/storage.ts đã có FirebaseStorage class
- CẦN: Firebase service account key để kết nối

## CHẠY DỰ ÁN
```bash
npm run dev
```
Website chạy tại: http://localhost:5000

## TÍNH NĂNG CHÍNH
### Cho sinh viên:
- Đăng ký tài khoản (họ tên, MSSV, email, ngành, SĐT)
- Đăng nhập và xem dashboard
- Xem điểm tích lũy, lịch sử đổi rác, quà nhận được

### Cho admin:
- Đăng nhập với username "admin", password "admin123"
- Xem danh sách sinh viên đã đăng ký
- Cập nhật điểm cho sinh viên (loại rác, kg, điểm, quà)
- Xóa sinh viên

### Trang chung:
- Trang chủ với giới thiệu và lịch phiên chợ
- Navigation bar với đăng nhập/đăng xuất

## CHUYỂN ĐỔI SANG FIREBASE (KHI CẦN)
### Bước 1: Lấy Firebase Service Account Key
- Vào Firebase Console → Project Settings → Service Accounts
- Click "Generate new private key" → Download file JSON

### Bước 2: Thêm Firebase Key (CHỌN 1 TRONG 2 CÁCH)

**Cách 1 - Tạo file firebase-key.json (DỄ NHẤT):**
- Copy file JSON vừa download
- Đổi tên thành "firebase-key.json"  
- Đặt vào thư mục gốc của dự án (cùng cấp với package.json)

**Cách 2 - Biến môi trường:**
- Tạo file .env
- Thêm dòng: FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
- (Copy toàn bộ nội dung file JSON vào)

### Bước 3: Đổi Database
Trong file server/storage.ts, dòng cuối cùng:
```
// Đổi từ:
export const storage = new MemStorage();
// Thành:
export const storage = new FirebaseStorage();
```

### Bước 4: Restart server
```
npm run dev
```

Xong! Website sẽ tự động dùng Firebase Firestore.

## CẤU TRÚC DATABASE FIREBASE
Collections sẽ tạo:
- students: thông tin sinh viên
- transactions: lịch sử đổi rác
- market_sessions: lịch phiên chợ
- admins: tài khoản admin

## NOTES QUAN TRỌNG
- Website hoàn toàn bằng tiếng Việt
- Theme màu xanh môi trường
- Responsive design cho mobile
- Form validation đầy đủ
- Session management đơn giản
- Ready để deploy lên production

## DEPLOY
Website có thể deploy trực tiếp lên các platform như:
- Vercel
- Netlify  
- Railway
- Replit Deployments

Tất cả dependencies đã được cài đặt và cấu hình sẵn sàng.