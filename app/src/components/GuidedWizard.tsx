import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlanStore } from '../store/usePlanStore'
import type { WizardAnswers } from '../types'

interface StepConfig {
  key: keyof WizardAnswers
  question: string
  hint: string
  multiline?: boolean
  isList?: boolean
}

const STEPS: StepConfig[] = [
  { key: 'wish', question: '這個規劃要完成的是什麼？', hint: '一句話說說你想做的事，會變成規劃的標題。' },
  { key: 'outcome', question: '如果做到了，理想中完成的樣子是？', hint: '想像已經完成的畫面，越具體越好。', multiline: true },
  { key: 'steps', question: '大概拆解成哪些主要步驟？', hint: '一行一個步驟，之後會自動變成畫布上的節點。', multiline: true, isList: true },
  { key: 'obstacle', question: '過程中最可能卡住的地方是什麼？', hint: '先想清楚障礙，完成率會高很多。', multiline: true },
  { key: 'ifThenPlan', question: '如果卡住了，你打算怎麼做？', hint: '試著寫成「如果發生 X，我就做 Y」。', multiline: true },
  { key: 'who', question: '有誰會參與，或是需要聯絡？', hint: '用逗號分隔多個名字，之後也能加入。' },
  { key: 'where', question: '有沒有地點上的限制？', hint: '沒有的話留空即可。' },
]

const initialAnswers: WizardAnswers = {
  wish: '',
  outcome: '',
  steps: [],
  obstacle: '',
  ifThenPlan: '',
  who: [],
  where: '',
}

export function GuidedWizard() {
  const wizardOpen = usePlanStore((s) => s.wizardOpen)
  const setWizardOpen = usePlanStore((s) => s.setWizardOpen)
  const createPlanFromWizard = usePlanStore((s) => s.createPlanFromWizard)

  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<WizardAnswers>(initialAnswers)
  const [rawText, setRawText] = useState('')

  if (!wizardOpen) return null

  const step = STEPS[stepIndex]
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  const commitStep = () => {
    if (step.isList) {
      setAnswers((a) => ({ ...a, steps: rawText.split('\n').map((s) => s.trim()).filter(Boolean) }))
    } else if (step.key === 'who') {
      setAnswers((a) => ({ ...a, who: rawText.split(',').map((s) => s.trim()).filter(Boolean) }))
    } else {
      setAnswers((a) => ({ ...a, [step.key]: rawText }))
    }
  }

  const goNext = () => {
    commitStep()
    if (stepIndex === STEPS.length - 1) {
      const finalAnswers = { ...answers }
      if (step.isList) finalAnswers.steps = rawText.split('\n').map((s) => s.trim()).filter(Boolean)
      else if (step.key === 'who') finalAnswers.who = rawText.split(',').map((s) => s.trim()).filter(Boolean)
      else (finalAnswers as any)[step.key] = rawText
      createPlanFromWizard(finalAnswers)
      setStepIndex(0)
      setAnswers(initialAnswers)
      setRawText('')
      return
    }
    setStepIndex((i) => i + 1)
    setRawText('')
  }

  const goBack = () => {
    if (stepIndex === 0) return
    commitStep()
    setStepIndex((i) => i - 1)
    const prevKey = STEPS[stepIndex - 1].key
    const prevVal = answers[prevKey]
    setRawText(Array.isArray(prevVal) ? prevVal.join(prevKey === 'who' ? ', ' : '\n') : (prevVal as string) ?? '')
  }

  return (
    <AnimatePresence>
      <motion.div
        className="wizard-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="wizard-modal"
          initial={{ y: 30, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          <div className="wizard-progress-track">
            <motion.div
              className="wizard-progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            />
          </div>
          <div className="wizard-step-count">第 {stepIndex + 1} / {STEPS.length} 題</div>

          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <h2 className="wizard-question">{step.question}</h2>
              <p className="wizard-hint">{step.hint}</p>
              {step.multiline ? (
                <textarea
                  autoFocus
                  className="wizard-textarea"
                  rows={4}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={step.isList ? '步驟一\n步驟二\n步驟三' : ''}
                />
              ) : (
                <input
                  autoFocus
                  className="wizard-input"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && goNext()}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="wizard-actions">
            <button className="wizard-btn wizard-btn--ghost" onClick={() => setWizardOpen(false)}>
              取消
            </button>
            <div className="wizard-actions__right">
              {stepIndex > 0 && (
                <button className="wizard-btn wizard-btn--ghost" onClick={goBack}>
                  上一題
                </button>
              )}
              <button className="wizard-btn wizard-btn--primary" onClick={goNext}>
                {stepIndex === STEPS.length - 1 ? '完成，建立規劃' : '下一題'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
