// ============================================================
// Ray Node-Planning — 核心資料型別
// 設計原則：Phase 1（純視覺化）就把 Phase 2（回饋/互動資料）
// 與 Phase 3（數位任務執行）需要的欄位一併預留好，
// 避免之後要動到既有資料結構、破壞已存的規劃。
// ============================================================

export type NodeStatus = 'not_started' | 'in_progress' | 'done' | 'blocked'

export type Priority = 'low' | 'medium' | 'high'

// 「數位任務」節點類型（Phase 3 會實作，Phase 1 先保留欄位）
export type DigitalTaskType =
  | 'code_script'      // 執行一段程式碼
  | 'ai_agent'          // 呼叫 AI Agent 完成任務
  | 'api_call'          // 呼叫外部 API / Webhook
  | 'file_operation'    // 檔案處理（讀寫、轉檔等）
  | 'notification'      // 發送通知/提醒
  | 'condition_branch'  // 條件分支（if/else）
  | 'manual_checkpoint' // 需要人工確認才能繼續

export interface Attachment {
  id: string
  name: string
  kind: 'file' | 'link' | 'image'
  url: string
  addedAt: number
}

// 人事時地物 + WOOP 規劃欄位
export interface NodeData extends Record<string, unknown> {
  title: string
  what: string            // 事：這個節點具體要做什麼
  who: string[]           // 人：相關人物/負責人
  where: string            // 地：地點
  whenDate?: string        // 時：日期 (yyyy-mm-dd)
  whenTime?: string        // 時：時間 (HH:mm)
  reminderAt?: string      // 提醒時間
  status: NodeStatus
  priority: Priority
  obstacle?: string        // WOOP：可能卡住的地方
  ifThenPlan?: string      // WOOP：if-then 因應計畫
  notes?: string           // 補充說明
  attachments: Attachment[]
  tags: string[]
  createdAt: number
  updatedAt: number

  // ---- Phase 3 預留欄位（數位任務執行）----
  nodeKind: 'planning' | 'digital_task'
  digitalTaskType?: DigitalTaskType
  executionStatus?: 'idle' | 'running' | 'success' | 'error'
  executionConfig?: Record<string, unknown>
  lastRunAt?: number
  lastResult?: string
}

export interface PlanEdgeData extends Record<string, unknown> {
  animated?: boolean       // Phase 3：執行中會設為 true，顯示電流動畫
  condition?: string       // 條件分支用（例如 if-then 的分支標籤）
}

// 開新規劃時的固定引導問題答案（GTD + WOOP 基礎）
export interface WizardAnswers {
  wish: string             // 這個規劃要完成的是什麼
  outcome: string           // 理想中完成的樣子
  steps: string[]           // 拆解出的主要步驟（會變成初始節點）
  obstacle: string          // 可能卡住的地方
  ifThenPlan: string        // if-then 因應計畫
  who: string[]             // 會參與/需要聯絡的人
  where: string              // 地點限制
  whenDate?: string          // 時間限制
}

export interface PlanMeta {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  wizardAnswers: WizardAnswers
}

// ---- Phase 2 預留：使用者回饋與互動資料 ----
export type FeedbackQuestionType = 'text' | 'scale' | 'multiple_choice'

export interface FeedbackQuestion {
  id: string
  question: string
  type: FeedbackQuestionType
  options?: string[]
}

export interface FeedbackResponse {
  questionId: string
  answer: string | number
  timestamp: number
  planId?: string
  nodeId?: string
}

export type InteractionEventType =
  | 'plan_created'
  | 'plan_opened'
  | 'node_created'
  | 'node_moved'
  | 'node_opened'
  | 'node_closed'
  | 'node_status_changed'
  | 'edge_connected'
  | 'edge_deleted'
  | 'wizard_completed'
  | 'feedback_submitted'

export interface InteractionEvent {
  id: string
  type: InteractionEventType
  planId?: string
  nodeId?: string
  timestamp: number
  metadata?: Record<string, unknown>
}
