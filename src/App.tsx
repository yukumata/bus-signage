import { useState } from 'react'
import './App.css'
import Clock from './components/Clock'
import Timetable from './components/Timetable'
import { KeyboardShortcuts } from './hooks/KeyboardShortcuts';

function App() {
  const [maxItems, setMaxItems] = useState(3);

  KeyboardShortcuts([
    {
      keys: ["Control", "i"],
      handler: () => {
        alert("infomation")
      },
      disableDefault: true
    },
    {
      keys: ["Control", "S"],
      handler: () => {
        alert("Settings")
      },
      disableDefault: true
    },
    ...Array.from({ length: 10}, (_, i) => ({
      keys: [i.toString()],
      handler: () => {
        if (i ===0) {
          setMaxItems(999);
        } else {
          setMaxItems(i);
        }
      },
      disableDefault: true
    }))
  ])

  return (
    <>
      <title>Bus Signage</title>
      <link href="https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@400;500;700;800;900&family=M+PLUS+Rounded+1c:wght@400;500;700;800;900&display=swap" rel="stylesheet"></link>
      <div className="screen">
        <div className="section0">
          <Clock />
          <img src=".\logo_white-min.png" alt="logo" width="500" />
        </div>
        <div className="section1">
          <Timetable maxItems={maxItems} />
        </div>
      </div>
    </>
  )
}

export default App
