# agent-kit：AI session 制度套件（通用版）

一套讓任何專案的 AI session（不論模型強弱）穩定產出的制度檔案。與具體專案零耦合——這裡沒有任何關於某個 codebase 的事實，事實由安裝時生成的 `project.md` 承載。

## 安裝到新專案（三步）

1. **複製檔案**（在新 repo 根目錄執行；`⟨kit 來源⟩` 換成本套件所在路徑，例如 clone 下來的上游 repo）：
   ```sh
   mkdir -p .claude
   cp -r ⟨kit 來源⟩/agent-kit/docs .claude/docs
   cp -r ⟨kit 來源⟩/agent-kit/agents .claude/agents
   cp ⟨kit 來源⟩/agent-kit/CLAUDE.template.md CLAUDE.md
   ```
2. **開一個新 session，貼上 `BOOTSTRAP.md` 裡的 prompt**。它會掃描 repo、生成 `project.md`（專案事實 + 實跑過的驗證階梯）、填完 CLAUDE.md 的空格、生成 letter.md，並派 verifier 驗收。
3. **看驗收報告**：verifier 回 `VERDICT: PASS` 且全部 commit + push 後，安裝完成。

## 檔案地圖

| 檔案 | 裝到哪 | 是什麼 |
|---|---|---|
| `CLAUDE.template.md` | repo 根目錄改名 `CLAUDE.md` | 每個 session 的入口：鐵律 + 路由表（含 ⟨⟩ 待填空格） |
| `docs/delegation.md` | `.claude/docs/` | 模型調度：誰下場、怎麼派工、升降級、驗證不自驗 |
| `docs/judgment.md` | `.claude/docs/` | 判斷 rubric：何時升級/算完成/該問/該換路/品質底線 |
| `docs/dispatch-templates.md` | `.claude/docs/` | 五種任務型態的派工 prompt 模板 |
| `docs/maintenance.md` | `.claude/docs/` | 這套檔案本身怎麼安全地更新與精簡 |
| `agents/verifier.md` | `.claude/agents/` | fresh-context 驗收 agent 定義 |
| `BOOTSTRAP.md` | 不用裝 | 安裝後第一個 session 要貼的 prompt |

安裝後由 bootstrap 生成（不在套件裡）：`.claude/docs/project.md`（專案事實）、`.claude/docs/letter.md`（該專案的雷區與交接區）。

## 設計原則（改套件前先讀）

- **標準與事實分離**：套件檔案只放「怎麼做事的標準」，永不放「某專案的事實」。事實只住在 project.md。
- **寫給弱模型**：每條規則要具體、可執行、有判準與正反例。「保持高品質」這種句子等於沒寫。
- **例子是情境示範**：docs 裡的 ✅/❌ 例子刻意用假想情境，不對應任何真實檔案；驗收文件時不要拿例子裡的路徑查存在性。
- **上游與副本**：本目錄是母版。各專案安裝後的副本可按其 maintenance.md 在地演化；改到「對所有專案都有用」的東西，值得回寫到母版（屬 maintenance.md §2 的變更，先問使用者）。
