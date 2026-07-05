# Ray Node-Planning — Phase 1：純視覺化規劃

節點式規劃APP的第一階段：拖曳建立節點、連線、展開卡片填寫人事時地物，並用固定引導問題（GTD + WOOP）開啟新規劃。

## 本機執行方式（給第一次用的人）

需要先安裝 [Node.js](https://nodejs.org/)（建議 LTS 版本）。

```bash
# 1. 安裝套件（第一次或套件更新後執行一次即可）
npm install

# 2. 啟動開發伺服器
npm run dev
```

啟動後終端機會顯示一個網址（通常是 http://localhost:5173），用瀏覽器打開就可以看到APP。

```bash
# 建置成正式版（產生 dist 資料夾，之後上線用）
npm run build
```

## 目前功能（Phase 1）

- 「+ 新規劃」：一次一題的引導式問答（想完成什麼／理想樣子／拆解步驟／可能卡住的地方／因應計畫／相關人物／地點限制），完成後自動依步驟建立節點與連線。
- 主畫布：拖曳節點、拉線連接、雙擊空白處新增節點。
- 節點卡片：點兩下節點展開，填寫狀態、優先度、人事時地物、WOOP（障礙／因應計畫）、附件連結、標籤、補充說明。
- 多規劃切換、匯出/匯入 JSON（目前資料存在瀏覽器 localStorage）。

## 資料結構

完整欄位定義在 `src/types.ts`，已預留 Phase 2（使用者回饋、互動事件紀錄，見 `usePlanStore.ts` 的 `logEvent`／`events`）與 Phase 3（`digitalTaskType`、`executionStatus` 等數位任務執行欄位）需要的欄位，之後不需要更動既有資料結構。

## 技術選型

- [React](https://react.dev/) + [Vite](https://vitejs.dev/) + TypeScript
- [@xyflow/react](https://reactflow.dev/)（節點畫布引擎）
- [zustand](https://github.com/pmndrs/zustand)（狀態管理 + localStorage 持久化）
- [framer-motion](https://www.framer.com/motion/)（動畫，卡片滑入、按鈕回饋等手感細節）
