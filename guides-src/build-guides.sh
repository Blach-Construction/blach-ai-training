#!/usr/bin/env sh
# Re-print the ChatGPT quick-start PDFs from chatgpt-quick-start.html.
# Run from Git Bash on Windows; needs Google Chrome.
set -e
here="$(cd "$(dirname "$0")" && pwd -W 2>/dev/null || pwd)"
chrome="/c/Program Files/Google/Chrome/Application/chrome.exe"
src="file:///$here/chatgpt-quick-start.html"
out="$here/../assets/guides"
profile="$(mktemp -d)"
"$chrome" --headless=new --disable-gpu --user-data-dir="$profile" --no-pdf-header-footer \
  --virtual-time-budget=4000 --print-to-pdf="$out/ChatGPT_Quick_Start_Guide.pdf" "$src"
"$chrome" --headless=new --disable-gpu --user-data-dir="$profile" --no-pdf-header-footer \
  --virtual-time-budget=4000 --print-to-pdf="$out/ChatGPT_Quick_Start_Guide_Icons.pdf" "$src?icons"
rm -rf "$profile"
