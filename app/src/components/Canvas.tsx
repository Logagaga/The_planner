import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { usePlanStore } from '../store/usePlanStore'
import { PlanNode } from './PlanNode'

const nodeTypes = { planNode: PlanNode }

function CanvasInner() {
  const activePlanId = usePlanStore((s) => s.activePlanId)
  const plan = usePlanStore((s) => (activePlanId ? s.plans[activePlanId] : undefined))
  const onNodesChange = usePlanStore((s) => s.onNodesChange)
  const onEdgesChange = usePlanStore((s) => s.onEdgesChange)
  const onConnect = usePlanStore((s) => s.onConnect)
  const addBlankNode = usePlanStore((s) => s.addBlankNode)
  const { screenToFlowPosition } = useReactFlow()

  const edgesWithStyle = useMemo(
    () =>
      (plan?.edges ?? []).map((e) => ({
        ...e,
        animated: !!e.data?.animated,
        markerEnd: { type: MarkerType.ArrowClosed },
      })),
    [plan?.edges]
  )

  const handlePaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      addBlankNode(position)
    },
    [screenToFlowPosition, addBlankNode]
  )

  if (!plan) return null

  return (
    <ReactFlow
      nodes={plan.nodes}
      edges={edgesWithStyle}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onPaneClick={undefined}
      onDoubleClick={handlePaneDoubleClick}
      fitView
      minZoom={0.2}
      maxZoom={2}
      defaultEdgeOptions={{ type: 'smoothstep' }}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--canvas-dot)" />
      <Controls showInteractive={false} />
      <MiniMap pannable zoomable className="plan-minimap" />
    </ReactFlow>
  )
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  )
}
