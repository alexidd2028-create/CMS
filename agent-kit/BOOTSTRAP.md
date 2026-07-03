# BOOTSTRAP：安裝後第一個 session 要貼的 prompt

> 前提：已按 README.md 第 1 步把檔案複製進新 repo（`.claude/docs/`、`.claude/agents/`、根目錄 `CLAUDE.md`）。
> 把下面整段貼給新 repo 的第一個 session（模型 sonnet 等級即可）。

---

這個 repo 剛安裝了一套 AI session 制度檔（`.claude/docs/` 下的 delegation、judgment、dispatch-templates、maintenance，`.claude/agents/verifier.md`，以及根目錄含 ⟨⟩ 空格的 CLAUDE.md）。它們引用兩個還不存在的檔案：`.claude/docs/project.md` 與 `.claude/docs/letter.md`。請完成安裝：

1. **生成 `.claude/docs/project.md`**。先派 Explore subagent 掃描 repo（跳過 lockfile、node_modules、build 產物），然後寫出以下小節，每個事實都要對得上程式碼，不確定的標「NOT CONFIRMED」：
   - 這是什麼（3 行內）
   - 架構與部署拓撲（表格：部分/技術/部署到哪/設定檔）
   - 檔案地圖（改東西先看哪裡，10 行左右）
   - **驗證階梯**：由低到高列出本專案可實跑的驗證層（語法/lint → build/typecheck → 測試 → 實跑），**每條指令先自己跑過、確認可用與目前結果，才准寫進去**。某層做不到就寫明原因。若本專案測試可全跑，把「測試全過」列為交付必要條件，不設豁免。
   - 慣例（命名、錯誤處理、程式碼風格——從現有程式碼歸納，不要發明）
   - 部署/環境注意（本環境看不到或控不了的東西）
2. **填 CLAUDE.md 的 ⟨⟩ 空格**（開頭兩句），其餘內容不動。
3. **生成 `.claude/docs/letter.md`**，含三節：本專案最大的錯誤類別（從驗證階梯的缺口推）、建議的首批任務（≤3 項、按價值排序）、空的「交接區」。
4. **派 `verifier` agent 驗收**（agent type 不可用就派 general-purpose 並附上 `.claude/agents/verifier.md` frontmatter 以下的規則正文），驗收條件：
   - project.md 中每個路徑存在、每條驗證指令實跑可用
   - CLAUDE.md 無殘留 ⟨⟩ 空格
   - 三份新檔與既有制度檔無互相矛盾的規則
5. verifier 回 FAIL 就修到 PASS，然後全部 commit + push 到本 session 指定分支。回報：驗收逐條結果 + 驗證階梯做到第幾層 + commit hash。
