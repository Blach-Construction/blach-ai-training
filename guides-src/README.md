# Guide sources

Sources for the ChatGPT downloads in `assets/guides/`. (The Claude PDFs were printed the same way, but their HTML source wasn't kept.)

| Output | Source | Rebuild |
|---|---|---|
| `ChatGPT_Quick_Start_Guide.pdf` | `chatgpt-quick-start.html` | `sh guides-src/build-guides.sh` (Git Bash + Chrome) |
| `ChatGPT_Quick_Start_Guide_Icons.pdf` | same file, opened with `?icons` | same script |
| `Blach_ChatGPT_AI_Glossary.docx` | `build_chatgpt_glossary.py` (uses the Claude glossary as its formatting template) | `python guides-src/build_chatgpt_glossary.py` (needs `python-docx`) |

The quick-start must stay on one Letter page — after editing, check the PDF page count.
ChatGPT feature names (Work, Space & Pages, Sites, Apps) are current as of October 2026; re-check them against OpenAI's release notes when updating.
