import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge as rfAddEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react'
import { nanoid } from '../utils/id'
import type { NodeData, PlanEdgeData, PlanMeta, WizardAnswers, InteractionEvent, InteractionEventType } from '../types'

export type PlanNode = Node<NodeData>
export type PlanEdge = Edge<PlanEdgeData>

interface PlanRecord {
  meta: PlanMeta
  nodes: PlanNode[]
  edges: PlanEdge[]
}

interface PlanStoreState {
  plans: Record<string, PlanRecord>
  activePlanId: string | null
  openNodeId: string | null
  wizardOpen: boolean
  events: InteractionEvent[]

  // plan lifecycle
  createPlanFromWizard: (answers: WizardAnswers) => string
  openPlan: (id: string) => void
  deletePlan: (id: string) => void
  listPlans: () => PlanMeta[]

  // wizard
  setWizardOpen: (open: boolean) => void

  // canvas editing
  onNodesChange: (changes: NodeChange<PlanNode>[]) => void
  onEdgesChange: (changes: EdgeChange<PlanEdge>[]) => void
  onConnect: (connection: Connection) => void
  addBlankNode: (position: { x: number; y: number }) => void
  updateNodeData: (nodeId: string, partial: Partial<NodeData>) => void
  deleteNode: (nodeId: string) => void

  // node card
  openCard: (nodeId: string) => void
  closeCard: () => void

  // analytics (Phase 2 基礎)
  logEvent: (type: InteractionEventType, extra?: Partial<InteractionEvent>) => void

  // import/export
  exportActivePlan: () => string
  importPlan: (json: string) => void
}

function blankNodeData(title = '未命名節點'): NodeData {
  const now = Date.now()
  return {
    title,
    what: '',
    who: [],
    where: '',
    status: 'not_started',
    priority: 'medium',
    attachments: [],
    tags: [],
    createdAt: now,
    updatedAt: now,
    nodeKind: 'planning',
  }
}

export const usePlanStore = create<PlanStoreState>()(
  persist(
    (set, get) => ({
      plans: {},
      activePlanId: null,
      openNodeId: null,
      wizardOpen: false,
      events: [],

      createPlanFromWizard: (answers) => {
        const planId = nanoid()
        const now = Date.now()

        const stepTitles = answers.steps.filter((s) => s.trim().length > 0)
        const nodes: PlanNode[] = stepTitles.map((title, i) => ({
          id: nanoid(),
          type: 'planNode',
          position: { x: 120 + i * 260, y: 160 + (i % 2 === 0 ? 0 : 90) },
          data: {
            ...blankNodeData(title),
            who: i === 0 ? answers.who : [],
            where: i === 0 ? answers.where : '',
            whenDate: i === 0 ? answers.whenDate : undefined,
            obstacle: i === 0 ? answers.obstacle : undefined,
            ifThenPlan: i === 0 ? answers.ifThenPlan : undefined,
          },
        }))

        const edges: PlanEdge[] = nodes.slice(1).map((node, i) => ({
          id: nanoid(),
          source: nodes[i].id,
          target: node.id,
          type: 'smoothstep',
          data: { animated: false },
        }))

        const meta: PlanMeta = {
          id: planId,
          title: answers.wish || '未命名規劃',
          createdAt: now,
          updatedAt: now,
          wizardAnswers: answers,
        }

        set((s) => ({
          plans: { ...s.plans, [planId]: { meta, nodes, edges } },
          activePlanId: planId,
          wizardOpen: false,
        }))

        get().logEvent('plan_created', { planId, metadata: { title: meta.title } })
        get().logEvent('wizard_completed', { planId })

        return planId
      },

      openPlan: (id) => {
        set({ activePlanId: id, openNodeId: null })
        get().logEvent('plan_opened', { planId: id })
      },

      deletePlan: (id) => {
        set((s) => {
          const rest = { ...s.plans }
          delete rest[id]
          const nextActive = s.activePlanId === id ? null : s.activePlanId
          return { plans: rest, activePlanId: nextActive }
        })
      },

      listPlans: () => Object.values(get().plans).map((p) => p.meta),

      setWizardOpen: (open) => set({ wizardOpen: open }),

      onNodesChange: (changes) => {
        const activeId = get().activePlanId
        if (!activeId) return
        set((s) => {
          const plan = s.plans[activeId]
          if (!plan) return s
          return {
            plans: {
              ...s.plans,
              [activeId]: { ...plan, nodes: applyNodeChanges(changes, plan.nodes) },
            },
          }
        })
        if (changes.some((c) => c.type === 'position' && c.dragging === false)) {
          get().logEvent('node_moved', { planId: activeId })
        }
      },

      onEdgesChange: (changes) => {
        const activeId = get().activePlanId
        if (!activeId) return
        set((s) => {
          const plan = s.plans[activeId]
          if (!plan) return s
          return {
            plans: {
              ...s.plans,
              [activeId]: { ...plan, edges: applyEdgeChanges(changes, plan.edges) },
            },
          }
        })
      },

      onConnect: (connection) => {
        const activeId = get().activePlanId
        if (!activeId) return
        set((s) => {
          const plan = s.plans[activeId]
          if (!plan) return s
          const newEdge: PlanEdge = {
            id: nanoid(),
            source: connection.source!,
            target: connection.target!,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
            type: 'smoothstep',
            data: { animated: false },
          }
          return {
            plans: {
              ...s.plans,
              [activeId]: { ...plan, edges: rfAddEdge(newEdge, plan.edges) },
            },
          }
        })
        get().logEvent('edge_connected', { planId: activeId })
      },

      addBlankNode: (position) => {
        const activeId = get().activePlanId
        if (!activeId) return
        const newNode: PlanNode = {
          id: nanoid(),
          type: 'planNode',
          position,
          data: blankNodeData(),
        }
        set((s) => {
          const plan = s.plans[activeId]
          if (!plan) return s
          return {
            plans: { ...s.plans, [activeId]: { ...plan, nodes: [...plan.nodes, newNode] } },
          }
        })
        get().logEvent('node_created', { planId: activeId, nodeId: newNode.id })
        get().openCard(newNode.id)
      },

      updateNodeData: (nodeId, partial) => {
        const activeId = get().activePlanId
        if (!activeId) return
        set((s) => {
          const plan = s.plans[activeId]
          if (!plan) return s
          const nodes = plan.nodes.map((n) =>
            n.id === nodeId
              ? { ...n, data: { ...n.data, ...partial, updatedAt: Date.now() } }
              : n
          )
          return { plans: { ...s.plans, [activeId]: { ...plan, nodes } } }
        })
        if (partial.status) {
          get().logEvent('node_status_changed', { planId: activeId, nodeId, metadata: { status: partial.status } })
        }
      },

      deleteNode: (nodeId) => {
        const activeId = get().activePlanId
        if (!activeId) return
        set((s) => {
          const plan = s.plans[activeId]
          if (!plan) return s
          return {
            plans: {
              ...s.plans,
              [activeId]: {
                ...plan,
                nodes: plan.nodes.filter((n) => n.id !== nodeId),
                edges: plan.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
              },
            },
            openNodeId: s.openNodeId === nodeId ? null : s.openNodeId,
          }
        })
      },

      openCard: (nodeId) => {
        set({ openNodeId: nodeId })
        get().logEvent('node_opened', { nodeId, planId: get().activePlanId ?? undefined })
      },

      closeCard: () => {
        const { openNodeId, activePlanId } = get()
        if (openNodeId) get().logEvent('node_closed', { nodeId: openNodeId, planId: activePlanId ?? undefined })
        set({ openNodeId: null })
      },

      logEvent: (type, extra) => {
        const event: InteractionEvent = {
          id: nanoid(),
          type,
          timestamp: Date.now(),
          ...extra,
        }
        set((s) => ({ events: [...s.events, event].slice(-2000) }))
      },

      exportActivePlan: () => {
        const { activePlanId, plans } = get()
        if (!activePlanId) return ''
        return JSON.stringify(plans[activePlanId], null, 2)
      },

      importPlan: (json) => {
        try {
          const parsed = JSON.parse(json) as PlanRecord
          if (!parsed.meta?.id) return
          set((s) => ({
            plans: { ...s.plans, [parsed.meta.id]: parsed },
            activePlanId: parsed.meta.id,
          }))
        } catch (e) {
          console.error('匯入失敗，JSON 格式不正確', e)
        }
      },
    }),
    { name: 'ray-node-planning-store' }
  )
)
