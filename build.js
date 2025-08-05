#!/usr/bin/env node

// Vercel-compatible build script
import { build } from 'vite';
import fs from 'fs';

async function buildProject() {
  console.log('🚀 Building for Vercel deployment...');
  
  try {
    // Clean dist directory
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
    }

    // Build frontend with Vite directly to dist/
    console.log('📦 Building frontend...');
    await build({
      root: './client',
      build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
          onwarn(warning, warn) {
            if (warning.code === 'UNRESOLVED_IMPORT') return;
            warn(warning);
          }
        }
      }
    });

    // Move files from dist/public to dist/ if they exist
    if (fs.existsSync('dist/public')) {
      const files = fs.readdirSync('dist/public');
      files.forEach(file => {
        fs.renameSync(`dist/public/${file}`, `dist/${file}`);
      });
      fs.rmSync('dist/public', { recursive: true });
    }

    // Create 404.html for SPA routing
    if (fs.existsSync('dist/index.html')) {
      const indexHtml = fs.readFileSync('dist/index.html', 'utf8');
      fs.writeFileSync('dist/404.html', indexHtml);
    }

    // Move dist files to public/ for Vercel
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public');
    }
    
    const files = fs.readdirSync('dist');
    files.forEach(file => {
      const srcPath = `dist/${file}`;
      const destPath = `public/${file}`;
      if (fs.statSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });

    console.log('✅ Frontend build completed!');
    console.log('📁 Frontend: dist/ directory');
    console.log('🔧 API: api/ functions for Vercel');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildProject();