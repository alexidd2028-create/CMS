# 診斷：這個環境最漏 token、最容易失焦、最容易出錯的三件事

> 寫於 2026-07-02（Fable 5 制度建立 session）。後面所有制度檔案都以這份診斷為依據。
> 每一條都是在這個 repo 實際驗證過的事實，不是通則猜測。

## 第 1 名：零專案記憶 → 每個 session 從零重建認知（最大 token 漏洞 + 最大錯誤來源）

**證據**：本 session 開始時 repo 沒有任何 CLAUDE.md、沒有 `.claude/` 目錄。更糟的是文件已經漂移：README.md 第 7 行寫「Express + SQLite API」，但 commit `5a8799c` 之後後端早已是 Postgres（`server/src/db.js` 用 `pg.Pool` + `DATABASE_URL`）。一個新 session 若信了 README，會做出錯誤的技術決定（例如以為改 schema 只要動一個 .db 檔）。

**代價**：每個新 session 花 10～20 次工具呼叫（數千到上萬 token）重新掃 repo、重建「這是什麼、怎麼部署、怎麼驗證」，而且可能重建出錯的版本。

**修法（本 session 已做）**：
- 建立 `CLAUDE.md`（精簡路由）+ `.claude/docs/project.md`（完整專案事實）。
- 修正 README 的 SQLite 漂移。
- `.claude/docs/maintenance.md` 規定：**任何改動讓 project.md 或 README 變成謊言時，同一個 commit 內必須更新它們**。

## 第 2 名：後端無法本地驗證 → 「看起來對」就 push，錯誤到部署後才爆

**證據**：容器裡只有 `psql`（client），沒有 Postgres server（`pg_ctl`、`postgres` 都不存在）。而 `server/src/db.js` 在 module top-level 就 `await pool.query(...)`——沒有 `DATABASE_URL` 時 server **import 階段直接 crash**，連 route 邏輯都測不到。專案沒有任何測試（server package.json 無 test script）。

**代價**：後端改動的唯一「測試」是 Render 部署 + 使用者手動點。回饋週期以十分鐘計，而且失敗發生在生產環境。

**修法**：
- 短期（每個 session 立刻可用）：照 `.claude/docs/project.md` 的「驗證階梯」逐層做——`node --check` 全部 server 檔案 → client `npm run lint` + `npm run build` → 派 fresh-context agent 讀 diff 做邏輯審查（見 delegation.md）。**做不到 runtime 驗證時，必須在回報裡明說「後端只做到靜態驗證」，不准寫「已測試」。**
- 中期（建議的第一個日常任務，見 letter.md）：加一個可離線跑的 smoke test（用 `pg-mem` 模擬 Postgres，或把 db.js 的連線改成 lazy 並可注入），讓「後端跑得起來」變成本地可驗證。

## 第 3 名：主對話下場做大量讀取 → context 被原始資料塞爆、後段失焦

**證據**：這個 repo 有典型的 context 炸彈：`package-lock.json` 兩份（各數千行）、GitHub MCP 工具的 PR diff / CI log 輸出可以一次幾萬 token、`client/src/pages/*.jsx` 全讀一輪也上千行。弱模型在 context 後段會忘記早期指令、開始重複已做過的搜尋——這是可預期的退化模式，不是假設。

**代價**：token 燒在「搬運原文」而非「產生判斷」；session 越長品質越差；長任務後半段容易偏離原始目標。

**修法**：
- 鐵律寫進 CLAUDE.md：**主對話不做大面積讀取**。凡是「掃整個 repo / 讀 3 個以上檔案找東西 / 讀 CI log / 讀大 diff」一律派 `Explore` 或 `general-purpose` subagent，只拿結論回來（規則與模板見 `.claude/docs/delegation.md`）。
- 永不整檔讀 `package-lock.json`、`node_modules/**`、`dist/**`——需要依賴版本就 Grep 那一個套件名。
- 長任務每完成一個里程碑就把結論落檔（檔案是不會失焦的記憶；context 會）。

## 附註：兩個沒進前三、但要知道的事

- **GitHub 操作只能走 `mcp__github__*` 工具**，沒有 `gh` CLI。查 PR/CI 記得帶 `minimal_output: true` 與分頁，否則就是第 3 名的變體。
- **容器是暫時的**：沒 commit + push 的東西在 session 結束後全部消失。每完成一個獨立單位就 commit + push 到指定分支，不要攢到最後。
