import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'

export interface TerminalHandle {
  reset: (text?: string) => void
  write: (text: string) => void
}

export const Terminal = forwardRef<TerminalHandle>(function Terminal(_, ref) {
  const container = useRef<HTMLDivElement>(null)
  const term = useRef<XTerm | null>(null)

  useEffect(() => {
    const xterm = new XTerm({
      convertEol: true,
      disableStdin: true,
      cursorBlink: false,
      cursorStyle: 'underline',
      fontFamily: 'ui-monospace, Menlo, monospace',
      fontSize: 13,
      scrollback: 10000,
      theme: { background: '#0a0a17', foreground: '#cccccc', cursor: '#0a0a17' },
    })
    const fit = new FitAddon()
    xterm.loadAddon(fit)
    xterm.open(container.current!)
    fit.fit()
    const observer = new ResizeObserver(() => fit.fit())
    observer.observe(container.current!)
    term.current = xterm
    return () => {
      observer.disconnect()
      xterm.dispose()
      term.current = null
    }
  }, [])

  useImperativeHandle(ref, () => ({
    reset: text => {
      term.current?.reset()
      if (text) term.current?.write(text)
    },
    write: text => term.current?.write(text),
  }))

  return <div className="terminal" ref={container} />
})
