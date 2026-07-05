import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import type { PlanNode as PlanNodeType } from '../store/usePlanStore'
import { usePlanStore } from '../store/usePlanStore'

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  not_started: { color: 'var(--status-not-started)', label: '尚未開始' },
  in_progress: { color: 'var(--status-in-progress)', label: '進行中' },
  done: { color: 'var(--status-done)', label: '已完成' },
  blocked: { color: 'var(--status-blocked)', label: '卡住了' },
}

function PlanNodeComponent({ id, data, selected }: NodeProps<PlanNodeType>) {
  const openCard = usePlanStore((s) => s.openCard)
  const status = STATUS_STYLE[data.status] ?? STATUS_STYLE.not_started

  return (
    <motion.div
      className={`plan-node ${selected ? 'plan-node--selected' : ''}`}
      style={{ borderColor: status.color }}
      onDoubleClick={() => openCard(id)}
      whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      layout
    >
      <Handle type="target" position={Position.Top} className="plan-node__handle" />
      <div className="plan-node__header">
        <span className="plan-node__status-dot" style={{ background: status.color }} />
        <span className="plan-node__title">{data.title || '未命名節點'}</span>
      </div>
      {data.what && <div className="plan-node__what">{data.what}</div>}
      <div className="plan-node__meta">
        {data.where && <span className="plan-node__chip">📍 {data.where}</span>}
        {data.who.length > 0 && <span className="plan-node__chip">👤 {data.who.join('、')}</span>}
        {data.attachments.length > 0 && (
          <span className="plan-node__chip">📎 {data.attachments.length}</span>
        )}
      </div>
      <button
        className="plan-node__expand"
        onClick={(e) => {
          e.stopPropagation()
          openCard(id)
        }}
        aria-label="展開節點卡片"
      >
        展開 →
      </button>
      <Handle type="source" position={Position.Bottom} className="plan-node__handle" />
    </motion.div>
  )
}

export const PlanNode = memo(PlanNodeComponent)
