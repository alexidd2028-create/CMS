# 給未來 session 的信

> 寫於 2026-07-02，由建立這套制度的 session 留下。你是在這個環境工作的後續模型。這封信講三件沒人會問你、但你需要知道的事，加上這套制度最可能怎麼壞掉。

## 第一件事：這個專案最大的錯誤類別是「本地看起來對、部署後壞掉」

你能看到的只有 repo；真正跑程式的地方（Render、Vercel、Supabase）你既看不到也控不了。具體的雷：

- `server/src/db.js` 只 `CREATE TABLE IF NOT EXISTS`，**沒有 migration 機制**。你改了 schema，生產資料庫不會跟著變。
- Render/Vercel 的 env var（`DATABASE_URL`、`VITE_API_BASE`、`SUPABASE_*`）設在平台上，repo 裡看不到現值。新功能需要新 env var 時，程式碼寫完只是完成一半。
- `vercel.json` 的 rewrite 把所有路徑導到 index.html——這只影響 Vercel 上的 client 靜態站（所以 client 端新增路由沒事）；server API 獨立部署在 Render，不受這條 rewrite 影響。兩個平台是分開的部署平面，不要混為一談。

因此養成習慣：**任何涉及部署邊界的改動，回報最後附一段「使用者需要做的事」清單**（要設什麼 env var、要不要手動跑 SQL、去哪個平台確認）。這段清單的價值常常高於程式碼本身。

## 第二件事：建議的第一批日常任務（按價值排序，使用者沒指定任務時可主動提議）

1. **加離線 smoke test**：把 `db.js` 的連線改成可注入或 lazy，用 `pg-mem` 之類讓 server 能在無 DB 環境 import + 起 route。這會把 diagnosis.md 第 2 名的「後端不可本地驗證」從制度性弱點變成已解決。做完記得更新 project.md §驗證階梯 和 diagnosis.md。
2. **跑一次 `/security-review` skill**：這個 repo 有 JWT、bcryptjs、公開 storage bucket、multer 上傳（`server/src/routes/media.js`），從未被安全審計過（本 session 未審計，這是標註不是斷言）。發現的問題開成清單給使用者排優先級。
3. **給 server 加 `lint` script**：client 有 eslint、server 沒有，驗證階梯的語法層目前只靠 `node --check`。

## 第三件事：這位使用者的環境與偏好（從本 session 可觀察到的事實）

- 所有 session 都在遠端 ephemeral 容器裡，branch-per-session（`claude/...`）。**沒 push 的工作 = 不存在**。已 merge 的 PR 分支不能續用，要從預設分支重開（session 指示裡有完整規則）。
- 使用者用繁體中文溝通，偏好：結論先行、證據具體（檔案:行號）、誠實標註沒做到的事勝過漂亮的宣稱。制度檔案全部用繁中 + 英文技術詞，維持這個慣例。
- 使用者願意投資在「制度」上——所以踩坑了就按 maintenance.md §3 寫回去，這是他明確要的行為，不是可選項。

## 這套制度最可能的退化方式（按可能性排序）與預防

1. **儀式化**：照樣派 verifier、照樣列驗收條件，但驗收條件寫成不可能 FAIL 的空話（「程式碼已修改」），或 verifier 回 FAIL 後被無視。預防：驗收條件的自查標準是「這條有沒有可能 FAIL？」不可能 FAIL 的條件等於沒寫；verifier FAIL 而不處理 = 任務未完成（judgment.md §2）。
2. **規則被逐次放寬**：「這次比較急，跳過驗證階梯」「這個小改不用 verifier」。一次例外就是先例。預防：放寬任何「必須」都要走 maintenance.md §2 問使用者；急件的正確做法是縮小改動範圍，不是跳過驗證。
3. **事實漂移**：project.md 慢慢變成當年 README 的翻版——寫著舊事實誤導後人。預防：鐵律 5（同 commit 同步）+ maintenance.md §5 健檢；你現在就可以做一件事——**開工時抽查 project.md 的一個事實**，不對就當場修。
4. **制度檔案膨脹**：每個 session 都往裡加一點，兩個月後 CLAUDE.md 300 行、沒人讀完。預防：maintenance.md §4 的精簡觸發點是硬性數字，超過就處理。
5. **context 撐爆時亂丟工作**：session 快斷時來不及交接。預防：本來就該隨做隨 commit（鐵律 4）；真的要中斷，把未完成事項用 maintenance.md §3 格式補進這封信的下方「交接區」。

## harness 的極限（誠實條款，抄自本 session 的結論）

拆解任務、強制驗證、多答案評審，可以把弱模型的**執行品質**拉起來；但兩樣東西制度補不了：

- **模糊題與品味判斷**（好不好看、語氣對不對、產品該不該做）：按 judgment.md §6 的三步走（做成具體選項 → opus 評審 → 給使用者選），並明說這是品味判斷。
- **「不知道自己不知道」**：弱模型最危險的不是答錯，是自信地答錯。對策只有一個：所有可查證的事都去查（程式碼、文件、實跑），查不到就寫 NOT CONFIRMED。這套制度裡每一條「附證據」的要求，都是在防這件事。

## 交接區

（各 session 未完成事項按 `- (日期) 事項——現況與下一步` 格式追加在此；空的就代表沒有遺留。）
