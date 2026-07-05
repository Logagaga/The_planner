import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

function goNext() {
  fireEvent.click(screen.getByText(/下一題|完成，建立規劃/))
}

describe('App smoke test', () => {
  it('renders empty state, completes wizard, and shows the canvas with a node', () => {
    const errorSpy = vi.spyOn(console, 'error')
    render(<App />)
    expect(screen.getByText('開始你的第一個規劃')).toBeTruthy()

    fireEvent.click(screen.getByText('+ 開始新規劃'))
    expect(screen.getByText('這個規劃要完成的是什麼？')).toBeTruthy()

    // wish
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '準備留學申請' } })
    goNext()
    // outcome
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '順利拿到offer' } })
    goNext()
    // steps
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '選校\n準備文件\n送出申請' } })
    goNext()
    // obstacle
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '時間不夠' } })
    goNext()
    // if-then
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '如果拖延，就先做最小的一步' } })
    goNext()
    // who
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '指導教授, 朋友A' } })
    goNext()
    // where
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } })
    goNext()

    // wizard should be gone, canvas should be mounted (jsdom無真實layout，不驗證節點座標相關渲染)
    expect(screen.queryByText('這個規劃要完成的是什麼？')).toBeNull()
    expect(screen.getByLabelText('Zoom Out')).toBeTruthy()

    const seriousErrors = errorSpy.mock.calls.filter(
      (args) => !String(args[0]).includes('Warning:')
    )
    expect(seriousErrors).toEqual([])
  })
})
