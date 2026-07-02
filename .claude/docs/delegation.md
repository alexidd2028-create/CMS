# 模型調度守則

> 目的：主對話（指揮官）保持乾淨的 context 做判斷；粗重工作派出去；驗收不由做的人自己做。
> 派工時的 prompt 一律照抄 `dispatch-templates.md` 的模板填空，不要即興發揮。

## 1. 指揮官不下場

主對話**禁止**親自做以下事情，一律派 subagent，只讓結論進主對話：

| 工作 | 派給誰 | 附註 |
|---|---|---|
| 掃 repo / 找「某東西定義在哪」/ 讀 3 個以上檔案回答一個問題 | `Explore` | prompt 裡指定廣度：`medium` 或 `very thorough` |
| 查網頁 / 查官方文件 / 查 Claude Code 或 API 用法 | `general-purpose`；Claude 相關問題用 `claude-code-guide` | 不憑記憶回答可查證的事 |
| 批次改檔（同一模式套用到多個檔案） | `general-purpose`，model 見 §3 | 先在主對話解出一個範例，再降級批次套用 |
| 讀 CI log、大 PR diff、任何預期輸出很長的 GitHub 查詢 | `general-purpose` | 只回失敗原因與相關行，不回貼原文 |
| 驗收已完成的工作 | `verifier`（自訂 agent，見 §6） | 絕不派給做這件事的同一個 agent |
| 規劃多檔大改動 | `Plan` | 回實作計畫，主對話決定採不採用 |

主對話**可以**親自做：讀單一已知路徑的檔案、單次精準 Grep、小 edit（≤3 個檔案且總 diff 預估 ≤60 行；超過就派實作 subagent）、跑驗證指令、git 操作、與使用者對話。判準：**「我需要的是結論還是原文？」需要結論就派工。**

## 2. 派工三件套（每個派工 prompt 必含，缺一件就不要送出）

1. **目標與動機**：要做什麼、為什麼（動機讓 subagent 在邊界情況做出對的取捨）。
2. **驗收條件**：可勾選的清單，subagent 完成前自查。壞例：「確保品質」。好例：「`cd client && npm run lint` 0 error；新增的欄位在 EntryForm.jsx 與 PublicDetail.jsx 都會顯示」。
3. **回報格式**：明確規定回什麼（見 §4）。

## 3. model 與 effort 怎麼指定

- **model**：`Agent` 工具的 `model` 參數。本環境可用值以當下 Agent 工具 schema 的 enum 為準；2026-07 時為 `haiku`、`sonnet`、`opus`（`fable` 在 enum 中但一般 session 未必可用——呼叫失敗就改用 opus）。省略 = 繼承主對話模型。
- **effort**：Agent 工具呼叫**沒有** effort 參數。effort 只能在自訂 agent 定義（`.claude/agents/*.md` frontmatter）裡設：`effort: low|medium|high|xhigh|max`。需要高 effort 的任務 → 用 `verifier` 這類自訂 agent，或在 prompt 裡明寫「逐條檢查、寧慢勿漏」。
- **選型預設**：

| 任務 | model |
|---|---|
| 機械性批次套用（模式已解出）、格式轉換、簡單查找 | `haiku` |
| 一般搜尋、實作、審查、研究（預設） | `sonnet` |
| 主模型（sonnet）自己卡住兩輪的難題、架構取捨、高風險判斷第二意見 | `opus` |

## 4. 回報合約（寫進每個派工 prompt 的「回報格式」欄）

- 只回：**結論 + 檔案:行號證據 + 驗收條件逐條勾選結果**。
- 禁止回貼大段原始碼或 log；引用以 5 行為上限。
- 長產物（報告、清單、生成的程式碼說明）**落檔到 repo 或 scratchpad，回傳路徑**，不要塞進回覆。
- 沒找到 / 做不到 / 不確定，就明說並附上試過什麼；禁止編造。

## 5. 升降級路徑

- **haiku 錯一次** → 直接升 `sonnet` 重派，不重試 haiku。
- **sonnet 在同一個子任務連錯兩次** → 升 `opus`，且 prompt 必須帶完整失敗軌跡：兩次分別嘗試了什麼、錯誤訊息原文、目前猜測的原因。不帶軌跡的升級會重蹈覆轍。
- **降級**：一旦在主對話或 opus 解出「可複製的模式」（例如一個檔案的正確改法），把模式寫成明確步驟，降回 `sonnet`/`haiku` 批次套用到其餘檔案。
- **重試上限**：同一件事（同一方法）最多兩輪。第三次之前必須換方法、升模型、或按 `judgment.md` §何時該問 停下來問使用者。「再跑一次一樣的指令看看」不算換方法。

## 6. 驗證不自驗

做的人不驗收自己的產出。**門檻**（與 CLAUDE.md 鐵律 6、judgment.md §2 一致）：改動超過 1 個檔案或超過 20 行，驗收必派 fresh-context 的 `verifier` agent；更小的改動可免派，但驗證階梯照跑。派法（定義在 `.claude/agents/verifier.md`；若該 agent type 不可用，改派 `general-purpose` + `dispatch-templates.md` §審查模板，效果等同）：

- **檔案類產出**：verifier 實際 Read 檔案，逐條對照驗收條件（read-back，不是看做事者的自述）。
- **程式碼**：verifier 跑 project.md 的驗證階梯 + 讀 diff 找邏輯錯誤。
- **高風險判斷**（不可逆操作、架構決定、對外發布）：加第二意見——派 `opus` 給同一問題但**不給**第一個答案，比較兩答案；分歧就升級處理或問使用者。
- verifier 回報 FAIL 時：修正 → 再驗。連兩輪 FAIL 同一條 → 走 §5 升級路徑。

## 7. 一個完整範例（照這個密度寫派工 prompt）

```
[派給 Explore，廣度 medium]
目標：找出 client 端所有直接呼叫 fetch 而沒有經過 client/src/api.js 的地方。
動機：我們要在 api.js 統一加上錯誤處理，繞過它的呼叫會漏掉。
驗收條件：
- [ ] 搜尋涵蓋 client/src 全部 .jsx/.js 檔
- [ ] 每個發現附 檔案:行號
- [ ] 若一處都沒有，明說「未發現」而不是省略
回報格式：條列每處 檔案:行號 + 一句話說明該呼叫做什麼。不要貼程式碼原文。
```
