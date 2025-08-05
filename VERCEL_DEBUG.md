# Vercel Deploy Debug Info

## Lỗi đã sửa:

### 1. Node.js Version Error ✅
```
Error: Found invalid Node.js Version: "22.x". Please set Node.js Version to 18.x
```

**Fix:**
- `vercel.json`: `"runtime": "@vercel/node@18.x"`
- `api/package.json`: `"engines": {"node": "18.x"}`
- `.node-version`: `18`

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