import { usePlanStore } from './store/usePlanStore'
import { Toolbar } from './components/Toolbar'
import { Canvas } from './components/Canvas'
import { NodeCard } from './components/NodeCard'
import { GuidedWizard } from './components/GuidedWizard'
import './App.css'

function EmptyState() {
  const setWizardOpen = usePlanStore((s) => s.setWizardOpen)
  return (
    <div className="empty-state">
      <div className="empty-state__inner">
        <h1>開始你的第一個規劃</h1>
        <p>用幾個引導問題，把想做的事拆成看得見的節點。</p>
        <button className="empty-state__cta" onClick={() => setWizardOpen(true)}>
          + 開始新規劃
        </button>
      </div>
    </div>
  )
}

function App() {
  const activePlanId = usePlanStore((s) => s.activePlanId)

  return (
    <div className="app-shell">
      <Toolbar />
      <main className="app-main">
        {activePlanId ? <Canvas /> : <EmptyState />}
      </main>
      <NodeCard />
      <GuidedWizard />
    </div>
  )
}

export default App
