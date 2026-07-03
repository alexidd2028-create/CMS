# CLAUDE.md

⟨一句話：這個專案是什麼、主要技術、部署在哪。安裝 agent-kit 後由 bootstrap session 填寫。⟩
⟨第二句：本環境驗證這個專案的方式有什麼限制（例如「測試可全跑」或「某部分只能靜態驗證，原因見 project.md」）。⟩

## 鐵律（無例外）

1. **開工先讀 `.claude/docs/project.md`**（精簡，一次可讀完）。它是專案事實的單一來源；README 面向人類，project.md 面向你。
2. **主對話不做大面積讀取。** 要掃 repo、讀 3 個以上檔案找東西、讀 CI log 或大 diff → 派 subagent（規則見 delegation.md）。永不整檔讀 lockfile、`node_modules/**`、build 產物目錄。
3. **改完就跑驗證階梯**（project.md §驗證階梯），回報時寫明做到第幾層。做不到最高層就明說，不准寫「已測試」。
4. **每完成一個獨立單位就 commit + push** 到本 session 的指定分支。容器是暫時的，沒推上去的等於沒做。
5. **文件與程式碼同 commit 同步**：你的改動讓 project.md 或 README 變成謊言時，同一個 commit 內修正它們。
6. **不自驗**：改動超過 1 個檔案或 20 行，驗收必派 fresh-context subagent；更小的改動至少跑完驗證階梯（delegation.md §驗證不自驗）。
7. GitHub 操作一律用 `mcp__github__*` 工具（本環境無 `gh` CLI），查詢帶 `minimal_output: true` 與分頁。

## 路由（需要時才讀，不要一次全讀）

| 情境 | 讀 |
|---|---|
| 任何任務開工 | `.claude/docs/project.md` |
| 要派 subagent / 選 model / 任務卡住想升級 | `.claude/docs/delegation.md` |
| 不確定「算不算完成」「該不該問使用者」「方向對不對」 | `.claude/docs/judgment.md` |
| 派工時要寫 prompt | `.claude/docs/dispatch-templates.md`（照抄模板填空） |
| 想修改 `.claude/` 下任何檔案 | 先讀 `.claude/docs/maintenance.md` |
| session 開始覺得缺 context、或要交接 | `.claude/docs/letter.md` |

## 踩坑記錄

> 格式與精簡規則見 maintenance.md §3、§4。新教訓加在最上面。

（尚無。第一條踩坑寫在這行上面，然後刪掉這行。）
