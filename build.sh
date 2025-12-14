#!/bin/bash
set -e

echo '================================'
echo 'FormFlow Enterprise - Build Script'
echo '================================'

echo '✓ Installing dependencies...'
npm install

echo '✓ Building for production...'
npm run build

echo '✓ Build completed successfully!'
echo 'dist/ folder is ready for deployment'
