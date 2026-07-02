# 專案事實（CMS）

> 這是專案的單一事實來源。發現這份文件與程式碼不符時：以程式碼為準，並在同一個 commit 修正這裡（規則見 maintenance.md）。
> 最後核對：2026-07-02（core commit `f6044bf`）。

## 這是什麼

Headless CMS。管理員定義 content type（欄位存 JSONB），編輯者建立 entries，公開站台讀取已發布內容。單一 repo、前後端分離部署。

## 架構與部署拓撲

| 部分 | 技術 | 部署 | 設定檔 |
|---|---|---|---|
| `server/` | Express 4 + `pg`（ESM, Node 22） | Render（web service） | `render.yaml` |
| `client/` | React 19 + Vite 8 + react-router 7 | Vercel（static build） | `vercel.json` |
| 資料庫 | Supabase Postgres（`DATABASE_URL`） | Supabase | schema 由 `server/src/db.js` 啟動時自建 |
| 媒體 | Supabase Storage（`SUPABASE_URL` / `SUPABASE_SERVICE_KEY` / `SUPABASE_BUCKET`） | Supabase | `server/src/routes/media.js` |

- **歷史陷阱**：專案最初用 SQLite，`5a8799c` 遷移到 Postgres。任何提到 SQLite 的文字或程式註解都是過時殘留，看到就修。
- 前端以 `VITE_API_BASE` 指向 Render 上的 API；本地開發時 `client/src/api.js` 有預設值。
- Auth：JWT（`JWT_SECRET`）。第一個註冊的使用者是 admin，其餘是 editor。

## 檔案地圖（改東西先看這裡，不要全掃）

- `server/src/index.js` — Express app 組裝與路由掛載
- `server/src/db.js` — Pool 建立 + **top-level await 建表**（沒有 DATABASE_URL 時 import 即 crash，見下方限制）
- `server/src/auth.js` — JWT middleware（`requireAuth` / `requireAdmin`）
- `server/src/routes/` — `auth.js`、`contentTypes.js`、`entries.js`、`media.js`、`public.js`（public = 無 auth、只回 published）
- `client/src/api.js` — 所有 fetch 的單一出口
- `client/src/AuthContext.jsx` — token 存放與登入狀態
- `client/src/pages/` — 管理面（Login/ContentTypes/Entries/EntryForm）+ 公開面（PublicHome/PublicList/PublicDetail)
- API 端點清單：見 README.md「API overview」

## 驗證階梯（改完必跑，由低到高，做到哪層就回報到哪層）

環境限制：**容器內沒有 Postgres server**（只有 psql client），所以後端無法本地啟動——`db.js` 在 import 時就連線。誠實回報，不准把「lint 過了」寫成「已測試」。

1. **語法層**（任何改動都要）：
   ```sh
   for f in $(find server/src -name '*.js'); do node --check "$f" || echo "FAIL: $f"; done
   ```
2. **Client 靜態層**（改了 client/ 就要）：
   ```sh
   cd client && npm install && npm run lint && npm run build
   ```
   lint 與 build 都必須 0 error 才算過。
3. **邏輯層**（改了 server 邏輯、或 client 改動 >50 行）：派 fresh-context subagent 讀 diff 做審查，模板見 `dispatch-templates.md` §審查。
4. **Runtime 層**：目前後端做不到本地 runtime 驗證。若使用者提供了 `DATABASE_URL`（問過才用），可 `cd server && npm run dev` 實跑；否則在回報中寫明「後端驗證止於第 3 層」。
   - client 可以本地實跑：`cd client && npm run dev`（API 呼叫會失敗，但可驗證 render 與路由）。

## 慣例

- 全 repo ESM（`"type": "module"`），無 TypeScript，無測試框架（尚未有；加測試是受歡迎的改動）。
- SQL 直接寫在 route 檔裡（無 ORM），參數一律用 `$1` 佔位符，不准字串拼接。
- 錯誤回應格式：`res.status(4xx).json({ error: '...' })`——新端點沿用。
- client 無 UI 套件，樣式在 `client/src/index.css`，沿用現有 class。

## 部署注意

- push 到 GitHub 後，Render 與 Vercel 是否自動部署取決於使用者的設定，**本環境看不到也控不了**。涉及「部署後才生效」的改動，回報時要提醒使用者確認部署狀態。
- `render.yaml` 的 `JWT_SECRET` 是 generateValue——重建 service 會讓所有既有 token 失效。
- 改 `db.js` 的 schema 只會 `CREATE TABLE IF NOT EXISTS`，**不會 migrate 既有表**。改欄位需要另寫 ALTER 或提醒使用者手動處理，否則生產環境不會套用。
