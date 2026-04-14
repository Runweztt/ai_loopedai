#!/bin/bash
set -e

echo "Building..."
npm run build

echo "Deploying to Hostinger..."
rsync -az --delete \
  -e "ssh -o StrictHostKeyChecking=no -p 65002" \
  dist/ \
  u109241398@45.84.204.142:~/public_html/

echo "Done — loopedai.io is live."
