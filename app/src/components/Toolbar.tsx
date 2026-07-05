import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlanStore } from '../store/usePlanStore'

export function Toolbar() {
  const plans = usePlanStore((s) => s.listPlans())
  const activePlanId = usePlanStore((s) => s.activePlanId)
  const openPlan = usePlanStore((s) => s.openPlan)
  const setWizardOpen = usePlanStore((s) => s.setWizardOpen)
  const exportActivePlan = usePlanStore((s) => s.exportActivePlan)
  const importPlan = usePlanStore((s) => s.importPlan)
  const deletePlan = usePlanStore((s) => s.deletePlan)

  const [menuOpen, setMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeTitle = plans.find((p) => p.id === activePlanId)?.title ?? '尚未選擇規劃'

  const handleExport = () => {
    const json = exportActivePlan()
    if (!json) return
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTitle}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => importPlan(reader.result as string)
    reader.readAsText(file)
  }

  return (
    <header className="toolbar">
      <div className="toolbar__brand">Ray Node-Planning</div>

      <div className="toolbar__plan-switch">
        <button className="toolbar__plan-btn" onClick={() => setMenuOpen((o) => !o)}>
          {activeTitle} ▾
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="toolbar__dropdown"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {plans.length === 0 && <div className="toolbar__dropdown-empty">還沒有規劃</div>}
              {plans.map((p) => (
                <div key={p.id} className="toolbar__dropdown-item">
                  <button
                    className={p.id === activePlanId ? 'active' : ''}
                    onClick={() => {
                      openPlan(p.id)
                      setMenuOpen(false)
                    }}
                  >
                    {p.title}
                  </button>
                  <button className="toolbar__dropdown-delete" onClick={() => deletePlan(p.id)}>刪除</button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="toolbar__actions">
        <button className="toolbar__btn toolbar__btn--primary" onClick={() => setWizardOpen(true)}>
          + 新規劃
        </button>
        <button className="toolbar__btn" onClick={handleExport} disabled={!activePlanId}>
          匯出 JSON
        </button>
        <button className="toolbar__btn" onClick={() => fileInputRef.current?.click()}>
          匯入 JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImportFile(file)
            e.target.value = ''
          }}
        />
      </div>
    </header>
  )
}
