# Ray Node-Planning：技術與行為科學基礎研究

本文件整理兩個領域的知識，作為這個「節點式規劃APP」的思考基礎：一是**節點畫布類APP的技術實作慣例**，二是**人類規劃與學習行為的科學依據**。目的是在動手寫程式之前，先確認架構方向是站在成熟的做法上，而不是從零猜測。

你目前只做過積木式（像 Scratch）的程式設計，所以文中技術名詞會盡量用類比解釋。

---

## 一、這個APP在做什麼（先對齊理解）

一個網頁APP，使用者開啟一個新規劃時，系統先用一連串固定的引導式問題帶使用者想清楚要規劃什麼。之後進入一個乾淨的大畫布，使用者用拖曳的方式建立「節點（Node）」並用線連接，畫出整個計畫的流程或結構。每個節點可以點開變成一張卡片，裡面填人事時地物、相關檔案、相關人物等細節。如果某個節點是「數位任務」，除了用來視覺化，還能真的被程式碼或 AI Agent 執行，讓節點間出現類似電流流動的動畫，表示這一段流程正在執行中。

換句話說，這個APP同時是**視覺化思考工具**（像心智圖、白板）和**真正能跑的工作流引擎**（像自動化工具），只是介面統一成一張畫布。

---

## 二、技術領域：節點畫布類APP怎麼做

### 1. 核心概念：畫布只是「顯示」，真正的東西是資料

不管畫面看起來多花，所有節點畫布APP骨子裡都是同一種資料結構：

- **Nodes（節點）陣列**：每個節點是一筆資料，記錄它的 ID、類型、在畫布上的座標（x, y）、以及它自己的內容（你要的人事時地物、檔案、狀態等）。
- **Edges（連線）陣列**：每條連線記錄「從哪個節點的哪個接點，連到哪個節點的哪個接點」。

畫面上看到的方塊和線，其實都是「照著這份資料畫出來」的結果。使用者拖動一個節點，本質上就是修改那筆資料裡的 x, y 座標；畫面會自動重新畫一次。這個概念在業界叫做**節點圖（Node Graph）資料模型**，n8n、Node-RED、LangGraph 這些工作流工具，以及 React Flow、tldraw 這些畫布工具，底層都是這套邏輯（[React Flow](https://reactflow.dev/)、[n8n workflow JSON 格式說明](https://latenode.com/blog/low-code-no-code-platforms/n8n-setup-workflows-self-hosting-templates/n8n-import-workflow-json-complete-guide-file-format-examples-2025)）。

用 Scratch 類比：Scratch 專案存檔（.sb3）裡也是一份「積木清單＋積木之間怎麼接」的資料，畫面上看到的積木只是把資料畫出來而已，道理相同。

### 2. 畫布怎麼「畫」出來：不用自己刻

如果從零開始寫拖曳、縮放、平移、畫連接線的邏輯會非常花時間。業界已有現成的**畫布引擎函式庫**，直接處理這些底層問題，你只需要告訴它「我的節點資料是什麼」，它就會畫出可拖曳、可連線的畫布：

- **React Flow**（網頁最常見）：專門做節點式UI的函式庫，內建拖曳、縮放、平移、連線、只渲染畫面內看得到的節點（效能優化），非常適合這個APP的主畫布（[React Flow 介紹](https://reactflow.dev/)）。
- **tldraw**：更偏向「無限白板」的SDK，內建即時多人協作能力，如果之後想加「和朋友一起規劃」的功能，這個值得參考（[tldraw sync](https://tldraw.substack.com/p/announcing-tldraw-sync)）。

對於你的APP，React Flow 是比較貼合的起點，因為你要的是「節點＋連線＋卡片」而不是自由畫圖。

### 3. 節點卡片要存哪些檔案類型

依你的需求（人事時地物、相關檔案、相關人物），一個節點的資料建議拆成三層：

1. **結構資料（JSON）**：節點ID、位置、連接關係、標題、類型（一般節點／數位任務節點）。這是畫布運作必須的最小資料，適合存成一份 `.json` 的「專案檔」，類似 n8n 匯出的工作流檔案。
2. **卡片內容（JSON / 資料庫欄位）**：時間、地點、人物、狀態、描述文字。這些是「填表單」性質的資料，適合用結構化欄位存，而不是純文字，方便之後篩選、統計、提醒。
3. **附件檔案（原始檔案）**：使用者上傳的檔案、圖片、文件。這些不會塞進節點的JSON裡，而是存在檔案儲存空間（像雲端硬碟或物件儲存服務），節點資料裡只存一個「連結／檔案ID」指過去。

這種「結構資料 + 附件分開存」的做法，是雲端文件、專案管理工具（Notion、Asana等）共通的慣例，原因是JSON檔如果直接塞入大檔案，會讓存檔、讀取、版本比對都變得笨重。

### 4. 「數位任務」節點怎麼變成真的工作流

這是你APP裡最進階的部分：一個節點不只是畫出來好看，還可以真正執行程式碼或呼叫 AI Agent。業界已有成熟參考模型：

- **n8n / Node-RED**：使用者用拖節點的方式定義自動化流程，執行時系統會按照連線順序，把資料從一個節點傳到下一個節點，這正是你要的「電流流動」動畫背後的邏輯——動畫其實是在視覺化「現在資料跑到哪個節點了」（[n8n vs Node-RED 比較](https://hostadvice.com/blog/ai/automation/n8n-vs-node-red/)）。
- **LangGraph**：專門給 AI Agent 用的節點圖執行引擎，節點可以是「呼叫一個AI模型」、「查資料」、「做決策分支」，並且有「狀態（State）」的概念，這個狀態會隨著執行從一個節點流向下一個節點，還支援檢查點（可以暫停、之後再繼續），對「人生規劃」這種長期、分階段的流程特別有用（[LangGraph架構說明](https://www.ibm.com/think/topics/langgraph)）。

實務建議：畫布本身（給人看、給人手動拖拉）跟真正執行的引擎，可以是兩套系統，靠同一份節點圖JSON溝通。畫布負責「畫和編輯」，執行引擎負責「照著這份圖真的跑一遍」。這樣即使不執行，APP也完全可以當純視覺化規劃工具用。

### 5. 之後想做多人協作，需要什麼

如果之後想讓兩人同時編輯一份規劃，底層需要的技術叫 **CRDT（衝突自由複製資料類型）**，像 Yjs 這類函式庫，或 tldraw 自帶的同步引擎，用來確保兩人同時拖動不同節點時資料不會互相打架（[tldraw多人協作架構](https://tldraw.dev/features/composable-primitives/multiplayer-collaboration)）。這不是第一版必須做的，但知道這個詞，未來要找資源時比較好搜尋。

---

## 三、行為科學領域：怎麼設計「固定引導問題」

你要的「開啟規劃時，用固定問題引導使用者」這個功能，剛好對應到幾個有研究基礎的方法，可以直接拿來設計問題順序，而不用自己憑感覺編。

### 1. GTD（Getting Things Done）的五步流程

David Allen 提出的GTD方法，把任何規劃拆成五個步驟：**收集**（把所有想法先寫下來）、**理清**（這件事能不能做？下一步是什麼？）、**組織**（歸類、排優先序）、**回顧**（定期檢查整體進度）、**執行**（專心做眼前這一步）（[GTD介紹](https://en.wikipedia.org/wiki/Getting_Things_Done)）。這給你的引導問題一個天然順序：先問「這個計畫大概要做什麼」，再問「拆成哪些具體步驟」，再問「每一步的先後順序」，最後才進入畫布排列節點。

### 2. WOOP：把目標和「會卡住的地方」一起想清楚

WOOP（Wish／Outcome／Obstacle／Plan，願望／結果／障礙／計畫）是心理學家 Gabriele Oettingen 和 Peter Gollwitzer 的研究成果，比單純的SMART目標更有效，因為它強迫使用者連「哪裡會卡住」都先想過，並寫成「如果發生X，我就做Y」的具體if-then計畫（[WOOP研究說明](https://mindfulambition.net/woop/)）。研究顯示這種「先想障礙、再定計畫」的做法，比只寫目標的做法完成率明顯更高。

這對你的APP非常契合：在引導問題裡，除了問「你想完成什麼」，建議也問「可能會卡住的地方是什麼」「卡住的時候你打算怎麼做」，這幾個問題的答案，剛好可以變成節點卡片裡「狀態」欄位的預設內容，也呼應你想做的「執行中動畫」——使用者一開始就已經想過卡住時要怎麼辦。

### 3. 為什麼要「一次問一個問題」而不是丟一張大表單

UX研究裡的**漸進揭露（Progressive Disclosure）**和**認知負荷**理論指出，人的短期工作記憶容量有限，一次看到太多欄位／太多選項會導致使用者放棄或亂填；把大任務拆成一步一步的精靈流程（Wizard），並顯示進度，能明顯降低放棄率（[漸進揭露與認知負荷](https://hashbyt.com/blog/onboarding-ux-best-practices)）。

這代表你的「開啟規劃時的固定問題」畫面，應該做成一次一題、有進度顯示，答完才進下一題，而不是一張長表單。

### 4. 為什麼用「節點畫布」而不是列清單

心智圖（Mind Mapping）相關研究指出，視覺化的節點式呈現比純文字清單更符合大腦處理資訊的方式，因為圖像和空間關係比線性文字更容易被記住、也更容易看出整體結構（[心智圖認知科學](https://nesslabs.com/mind-mapping)）。這其實是在幫你確認一件事：你選擇節點畫布而不是待辦清單，這個方向本身是有認知科學支持的，不是單純美觀考量。

---

## 四、把兩邊知識合起來：建議的整體架構

把上面兩塊知識放在一起，這個APP大概分四層：

1. **引導問題層**：新規劃開始時的精靈式問答（依GTD＋WOOP設計固定問題），答案直接變成之後節點卡片的初始內容。
2. **畫布層**：用 React Flow 類的函式庫做拖曳節點、連線，畫面資料就是一份節點圖JSON。
3. **卡片／資料層**：節點的人事時地物、狀態、附件檔案，結構化存起來，附件檔案另外存放，節點只存連結。
4. **執行層（進階）**：對於標記為「數位任務」的節點，另外有一套執行引擎（可參考LangGraph／n8n的模式），照著節點圖的連線順序真正執行程式碼或呼叫AI Agent，並把「目前執行到哪」回報給畫布層，畫布層再把它畫成流動動畫。

第1～3層是APP能不能用的基本盤，第4層是讓它從「畫圖工具」變成「真的會動」的關鍵，可以先做前三層，把整個視覺化規劃流程做穩，第4層之後再疊上去。

---

## 五、下一步

這份文件是研究與方向確認，還沒有進入實作。建議下一步：

1. 確認你想先做「純視覺化規劃」（第1～3層）還是要一開始就把「數位任務執行」（第4層）也做進去，這會影響技術選型的複雜度。
2. 針對「引導式固定問題」，一起把GTD／WOOP的問題順序，改寫成你APP實際會問的具體字句。
3. 定義節點卡片的完整欄位清單（人事時地物之外還要不要加標籤、優先度、提醒時間等）。

---

Sources:
- [Node-Based UIs in React - React Flow](https://reactflow.dev/)
- [N8N Import Workflow JSON: Complete Guide + File Format Examples](https://latenode.com/blog/low-code-no-code-platforms/n8n-setup-workflows-self-hosting-templates/n8n-import-workflow-json-complete-guide-file-format-examples-2025)
- [n8n vs Node-RED Review](https://hostadvice.com/blog/ai/automation/n8n-vs-node-red/)
- [tldraw: Multiplayer Collaboration](https://tldraw.dev/features/composable-primitives/multiplayer-collaboration)
- [Announcing tldraw sync](https://tldraw.substack.com/p/announcing-tldraw-sync)
- [What is LangGraph? - IBM](https://www.ibm.com/think/topics/langgraph)
- [Getting Things Done - Wikipedia](https://en.wikipedia.org/wiki/Getting_Things_Done)
- [WOOP: Gabriele Oettingen's Scientifically Validated Method](https://mindfulambition.net/woop/)
- [Ultimate Guide to Onboarding UX Design](https://hashbyt.com/blog/onboarding-ux-best-practices)
- [The science of mind mapping - Ness Labs](https://nesslabs.com/mind-mapping)
