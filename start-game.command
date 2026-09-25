#!/bin/zsh
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  npm install || { echo "Could not install the game dependencies."; read -k 1 "?Press a key to close…"; exit 1; }
fi
npm run dev -- --open
