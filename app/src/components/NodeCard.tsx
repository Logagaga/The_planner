import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlanStore } from '../store/usePlanStore'
import type { NodeStatus, Priority } from '../types'

const STATUS_OPTIONS: { value: NodeStatus; label: string }[] = [
  { value: 'not_started', label: '尚未開始' },
  { value: 'in_progress', label: '進行中' },
  { value: 'done', label: '已完成' },
  { value: 'blocked', label: '卡住了' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
]

export function NodeCard() {
  const openNodeId = usePlanStore((s) => s.openNodeId)
  const activePlanId = usePlanStore((s) => s.activePlanId)
  const plans = usePlanStore((s) => s.plans)
  const updateNodeData = usePlanStore((s) => s.updateNodeData)
  const deleteNode = usePlanStore((s) => s.deleteNode)
  const closeCard = usePlanStore((s) => s.closeCard)

  const node = useMemo(() => {
    if (!activePlanId || !openNodeId) return null
    return plans[activePlanId]?.nodes.find((n) => n.id === openNodeId) ?? null
  }, [activePlanId, openNodeId, plans])

  const [whoInput, setWhoInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [attachmentInput, setAttachmentInput] = useState('')

  if (!node) return null
  const data = node.data

  return (
    <AnimatePresence>
      <motion.div
        className="node-card-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeCard}
      >
        <motion.aside
          className="node-card"
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="node-card__top">
            <input
              className="node-card__title-input"
              value={data.title}
              placeholder="節點標題"
              onChange={(e) => updateNodeData(node.id, { title: e.target.value })}
            />
            <button className="node-card__close" onClick={closeCard} aria-label="關閉">✕</button>
          </div>

          <div className="node-card__status-row">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`status-pill status-pill--${opt.value} ${data.status === opt.value ? 'status-pill--active' : ''}`}
                onClick={() => updateNodeData(node.id, { status: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <section className="node-card__section">
            <label className="node-card__label">事：這個節點要做什麼</label>
            <textarea
              className="node-card__textarea"
              value={data.what}
              onChange={(e) => updateNodeData(node.id, { what: e.target.value })}
              rows={3}
              placeholder="具體描述這個節點的內容"
            />
          </section>

          <div className="node-card__grid">
            <section className="node-card__section">
              <label className="node-card__label">地：地點</label>
              <input
                className="node-card__input"
                value={data.where}
                onChange={(e) => updateNodeData(node.id, { where: e.target.value })}
                placeholder="地點"
              />
            </section>
            <section className="node-card__section">
              <label className="node-card__label">時：日期</label>
              <input
                type="date"
                className="node-card__input"
                value={data.whenDate ?? ''}
                onChange={(e) => updateNodeData(node.id, { whenDate: e.target.value })}
              />
            </section>
          </div>

          <section className="node-card__section">
            <label className="node-card__label">人：相關人物</label>
            <div className="chip-row">
              {data.who.map((w, i) => (
                <span key={i} className="chip">
                  {w}
                  <button onClick={() => updateNodeData(node.id, { who: data.who.filter((_, idx) => idx !== i) })}>✕</button>
                </span>
              ))}
            </div>
            <input
              className="node-card__input"
              value={whoInput}
              placeholder="輸入姓名按 Enter 新增"
              onChange={(e) => setWhoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && whoInput.trim()) {
                  updateNodeData(node.id, { who: [...data.who, whoInput.trim()] })
                  setWhoInput('')
                }
              }}
            />
          </section>

          <section className="node-card__section">
            <label className="node-card__label">優先度</label>
            <div className="node-card__status-row">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`priority-pill ${data.priority === opt.value ? 'priority-pill--active' : ''}`}
                  onClick={() => updateNodeData(node.id, { priority: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <details className="node-card__woop" open={!!(data.obstacle || data.ifThenPlan)}>
            <summary>可能卡住的地方（WOOP）</summary>
            <label className="node-card__label">障礙</label>
            <textarea
              className="node-card__textarea"
              rows={2}
              value={data.obstacle ?? ''}
              onChange={(e) => updateNodeData(node.id, { obstacle: e.target.value })}
              placeholder="可能會卡住的地方"
            />
            <label className="node-card__label">如果卡住了……</label>
            <textarea
              className="node-card__textarea"
              rows={2}
              value={data.ifThenPlan ?? ''}
              onChange={(e) => updateNodeData(node.id, { ifThenPlan: e.target.value })}
              placeholder="如果發生 X，我就做 Y"
            />
          </details>

          <section className="node-card__section">
            <label className="node-card__label">相關檔案 / 連結</label>
            <div className="attachment-list">
              {data.attachments.map((a) => (
                <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="attachment-item">
                  📎 {a.name}
                </a>
              ))}
            </div>
            <input
              className="node-card__input"
              value={attachmentInput}
              placeholder="貼上連結按 Enter 新增"
              onChange={(e) => setAttachmentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && attachmentInput.trim()) {
                  updateNodeData(node.id, {
                    attachments: [
                      ...data.attachments,
                      {
                        id: crypto.randomUUID(),
                        name: attachmentInput.trim(),
                        kind: 'link',
                        url: attachmentInput.trim(),
                        addedAt: Date.now(),
                      },
                    ],
                  })
                  setAttachmentInput('')
                }
              }}
            />
          </section>

          <section className="node-card__section">
            <label className="node-card__label">標籤</label>
            <div className="chip-row">
              {data.tags.map((t, i) => (
                <span key={i} className="chip chip--tag">
                  {t}
                  <button onClick={() => updateNodeData(node.id, { tags: data.tags.filter((_, idx) => idx !== i) })}>✕</button>
                </span>
              ))}
            </div>
            <input
              className="node-card__input"
              value={tagInput}
              placeholder="輸入標籤按 Enter 新增"
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  updateNodeData(node.id, { tags: [...data.tags, tagInput.trim()] })
                  setTagInput('')
                }
              }}
            />
          </section>

          <section className="node-card__section">
            <label className="node-card__label">補充說明</label>
            <textarea
              className="node-card__textarea"
              rows={3}
              value={data.notes ?? ''}
              onChange={(e) => updateNodeData(node.id, { notes: e.target.value })}
            />
          </section>

          <button
            className="node-card__delete"
            onClick={() => {
              deleteNode(node.id)
            }}
          >
            刪除這個節點
          </button>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  )
}
