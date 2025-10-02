import { useState, useEffect } from 'react'
import './App.css'
import Clock from './components/Clock'
import Timetable from './components/Timetable'
import { KeyboardShortcuts } from './hooks/KeyboardShortcuts'
import Overlay from './components/Overlay'
import { Params } from './hooks/Params'

function App() {
  const [maxItems, setMaxItems] = useState(4)
  const [showOverlay, setShowOverlay] = useState(false)

  const params = Params()
  const backgroundImage = params.get('background-image')
  const backgroundImagePosition = params.get('background-image-position')

  useEffect(() => {
    const section0 = document.querySelector(".section0") as HTMLElement;
    if (section0) {
      section0.style.setProperty(
        "--section0-bg",
        backgroundImage ? `url(${backgroundImage})` : "none"
      );
      section0.style.setProperty(
        "--section0-bg-position",
        backgroundImagePosition ? backgroundImagePosition : "center"
      );
    }
  }, [backgroundImage, backgroundImagePosition]);

  KeyboardShortcuts([
    {
      keys: ['Control', 'S'],
      handler: () => {
        if (showOverlay) {
          setShowOverlay(false)
        } else {
          setShowOverlay(true)
        }
      },
      disableDefault: true,
    },
    ...Array.from({ length: 10 }, (_, i) => ({
      keys: [i.toString()],
      handler: () => {
        if (i === 0) {
          setMaxItems(999)
        } else {
          setMaxItems(i)
        }
      },
      disableDefault: true,
    })),
  ])

  return (
    <>
      <title>Bus Signage</title>
      <link
        href="https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@400;500;700;800;900&family=M+PLUS+Rounded+1c:wght@400;500;700;800;900&display=swap"
        rel="stylesheet"
      ></link>
      <div className="screen">
        <div className="section0">
          <Clock />
          <img src=".\logo_white-min.png" alt="logo" width="500" />
        </div>
        <div className="section1">
          <Timetable maxItems={maxItems} />
        </div>
        <Overlay showOverlay={showOverlay} setShowOverlay={setShowOverlay} />
      </div>
    </>
  )
}

export default App
