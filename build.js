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

    // Build frontend only - Vercel will handle API functions separately
    console.log('📦 Building frontend...');
    await build({
      root: './client',
      build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
          onwarn(warning, warn) {
            // Suppress resolve warnings for alias imports
            if (warning.code === 'UNRESOLVED_IMPORT') return;
            warn(warning);
          }
        }
      }
    });

    // Create 404.html for SPA routing
    const indexHtml = fs.readFileSync('dist/index.html', 'utf8');
    fs.writeFileSync('dist/404.html', indexHtml);

    console.log('✅ Frontend build completed!');
    console.log('📁 Frontend: dist/ directory');
    console.log('🔧 API: api/ functions for Vercel');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildProject();