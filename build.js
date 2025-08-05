#!/usr/bin/env node

// Build script optimized for Vercel deployment
import { build } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function buildProject() {
  console.log('🚀 Starting Vercel-optimized build...');
  
  try {
    // 1. Clean dist directory
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
    }
    fs.mkdirSync('dist', { recursive: true });

    // 2. Build frontend with Vite
    console.log('📦 Building frontend...');
    await build({
      root: './client',
      build: {
        outDir: '../dist/public',
        emptyOutDir: true,
        rollupOptions: {
          external: [],
          onwarn(warning, warn) {
            // Suppress resolve warnings for alias imports
            if (warning.code === 'UNRESOLVED_IMPORT') return;
            warn(warning);
          }
        }
      }
    });

    // 3. Build backend with esbuild
    console.log('🔧 Building backend...');
    execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --keep-names', {
      stdio: 'inherit'
    });

    // 4. Copy package.json for dependencies
    const packageJson = {
      name: "cho-xanh-production",
      version: "1.0.0",
      type: "module",
      main: "index.js",
      engines: {
        node: ">=18.0.0"
      },
      dependencies: {
        "@neondatabase/serverless": "^0.10.4",
        "drizzle-orm": "^0.36.3",
        "express": "^4.19.2",
        "zod": "^3.23.8"
      }
    };
    
    fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

    // 5. Create optimized index.html fallback
    const indexHtml = fs.readFileSync('dist/public/index.html', 'utf8');
    fs.writeFileSync('dist/public/404.html', indexHtml);

    console.log('✅ Build completed successfully!');
    console.log('📁 Output: dist/ directory ready for Vercel');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildProject();