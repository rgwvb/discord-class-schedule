# Discord Class Schedule

獨立課表系統：網站預覽、青蛙課表圖卡、Discord 圖片發送與舊公告清理。

## 網站

GitHub Pages 啟用後：

`https://rgwvb.github.io/discord-class-schedule/`

## 主要檔案

- `index.html` / `styles.css` / `app.js`：課表網站
- `data/schedule.json`：課表資料
- `scripts/render_card.py`：產生 PNG 課表圖卡
- `scripts/send_discord.py`：將 PNG 以 Discord Webhook 附件送出
- `scripts/cleanup_discord.py`：刪除上一則由本系統送出的課表公告

## GitHub Secrets

之後自動化需要：

- `DISCORD_WEBHOOK_URL`
- `ONEDRIVE_XLSX_URL`（若要每天從 OneDrive Excel 自動同步）

本 Repository 與 `584-armor-brigade-site1` 完全獨立。