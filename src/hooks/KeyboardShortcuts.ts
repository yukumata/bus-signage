import { useEffect } from 'react'

type ShortcutHandler = (event: KeyboardEvent) => void

interface Shortcut {
  keys: string[]
  handler: ShortcutHandler
  disableDefault?: boolean
}

export const KeyboardShortcuts = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKeys: string[] = []
      if (event.ctrlKey) pressedKeys.push('Control')
      if (event.shiftKey) pressedKeys.push('Shift')
      if (event.altKey) pressedKeys.push('Alt')
      if (event.metaKey) pressedKeys.push('Meta')
      pressedKeys.push(event.key)

      const match = shortcuts.find(
        (sc) =>
          sc.keys.length === pressedKeys.length &&
          sc.keys.every(
            (k, i) => k.toLowerCase() === pressedKeys[i].toLowerCase()
          )
      )

      if (match) {
        if (match.disableDefault) {
          event.preventDefault()
        }
        match.handler(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
