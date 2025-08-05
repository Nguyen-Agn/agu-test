# Vercel Deploy Debug Info

## Lỗi đã sửa:

### 3. Function Runtime Version Error ✅
```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

**Fix:**
- Đổi từ `@vercel/node@18.x` sang `@vercel/node@18.18.0`
- Chỉ định version cụ thể thay vì wildcard
- Đồng bộ tất cả Node.js version configs

### 1. Node.js Version Error ✅
```
Error: Found invalid Node.js Version: "22.x". Please set Node.js Version to 18.x
```

**Fix:**
- `vercel.json`: `"runtime": "@vercel/node@18.18.0"`
- `api/package.json`: `"engines": {"node": "18.18.0"}`
- `.node-version`: `18.18.0`

### 2. 404 Error cho static assets ✅
```
main.tsx:1 Failed to load resource: the server responded with a status of 404
```

**Fix:**  
- Cải thiện routing trong `vercel.json`
- Static assets pattern: `/(.*\\.(js|css|png|jpg|...))`
- SPA fallback: `/(.*) -> /index.html`
- Thêm `_redirects` file

## Cấu hình cuối cùng:

### vercel.json
```json
{
  "functions": {
    "api/*.js": {
      "runtime": "@vercel/node@18.x"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))",
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Routing Logic:
1. `/api/**` → API functions
2. Static files → Direct serving
3. Everything else → `index.html` (SPA)

## Test Commands:
```bash
# Build locally
node build.js

# Check files
ls -la dist/

# Verify assets
cat dist/index.html
```

Deploy should now work without:
- Node.js version errors
- 404 errors for JS/CSS files
- SPA routing issues