import './App.css'
import Clock from './components/Clock'
import Timetable from './components/Timetable'

function App() {
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
          <Timetable />
        </div>
      </div>
    </>
  )
}

export default App
