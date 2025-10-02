import { useEffect, useState } from 'react'
import './Timetable.css'

interface Departure {
  time: string
  note: string
}

interface RouteSchedule {
  destination?: string
  Weekday: Departure[]
  Saturday: Departure[]
  Holiday?: Departure[]
}

interface StopSchedule {
  [routeName: string]: RouteSchedule
}

interface PublicBusTimetable {
  [stopName: string]: StopSchedule
}

interface SchoolBusTimetable {
  [routeName: string]: RouteSchedule
}

const BusTimetableDisplay = ({
  schedule,
  currentTime,
  dayType,
  upcomingCount = 4,
}: {
  schedule?: RouteSchedule
  currentTime: Date
  dayType: 'Weekday' | 'Saturday' | 'Holiday'
  upcomingCount?: number
}) => {
  if (!schedule) {
    return <div className="departures">時刻表データがありません</div>
  }

  const departures = schedule[dayType] || []
  const currentTimeStr = `${String(currentTime.getHours()).padStart(2, '0')}${String(currentTime.getMinutes()).padStart(2, '0')}`

  const upcoming = departures
    .filter((dep) => dep.time > currentTimeStr)
    .slice(0, upcomingCount)
  if (upcoming.length === 0) {
    return <div className="departures">本日の運行は終了しました</div>
  }
  return (
    <div className="departures">
      {upcoming.map((dep, index) => (
        <div
          key={index}
          className={`departure-item ${index === 0 ? 'highlight' : ''}`}
        >
          <span className="departure-time">
            {dep.time.slice(0, 2)}:{dep.time.slice(2)}
          </span>
          {dep.note && <span className="departure-note">{dep.note}</span>}
        </div>
      ))}
    </div>
  )
}

function Timetable({ maxItems }: { maxItems: number }) {
  const [publicBusTimetable, setPublicBusTimetable] =
    useState<PublicBusTimetable | null>(null)
  const [schoolBusTimetable, setSchoolBusTimetable] =
    useState<SchoolBusTimetable | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [schoolBusType, setSchoolBusType] = useState<string | null>(null)

  const getDayType = (date: Date): 'Weekday' | 'Saturday' | 'Holiday' => {
    const day = date.getDay()
    if (day === 0) return 'Holiday'
    if (day === 6) return 'Saturday'
    return 'Weekday'
  }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const parsePublicBusXml = (xmlDoc: Document): PublicBusTimetable => {
      const timetable: PublicBusTimetable = {}
      const stops = xmlDoc.getElementsByTagName('Stop')
      for (const stop of stops) {
        const stopName = stop.getAttribute('name')
        if (!stopName) continue
        timetable[stopName] = {}
        const routes = stop.getElementsByTagName('Route')
        for (const route of routes) {
          const routeName = route.getAttribute('name')
          const destination = route.getAttribute('destination')
          if (!routeName) continue
          const schedule: RouteSchedule = {
            destination: destination || '',
            Weekday: [],
            Saturday: [],
            Holiday: [],
          }
          const weekdays = route
            .getElementsByTagName('Weekday')[0]
            ?.getElementsByTagName('Departure')
          if (weekdays)
            schedule.Weekday = Array.from(weekdays).map((d) => ({
              time: d.getAttribute('time') || '',
              note: d.getAttribute('note') || '',
            }))

          const saturdays = route
            .getElementsByTagName('Saturday')[0]
            ?.getElementsByTagName('Departure')
          if (saturdays)
            schedule.Saturday = Array.from(saturdays).map((d) => ({
              time: d.getAttribute('time') || '',
              note: d.getAttribute('note') || '',
            }))

          const holidays = route
            .getElementsByTagName('Holiday')[0]
            ?.getElementsByTagName('Departure')
          if (holidays)
            schedule.Holiday = Array.from(holidays).map((d) => ({
              time: d.getAttribute('time') || '',
              note: d.getAttribute('note') || '',
            }))

          timetable[stopName][routeName] = schedule
        }
      }
      return timetable
    }

    const parseSchoolBusXml = (xmlDoc: Document): SchoolBusTimetable => {
      const timetable: SchoolBusTimetable = {}
      const routes = xmlDoc.getElementsByTagName('Route')
      for (const route of routes) {
        const routeName = route.getAttribute('name')
        if (!routeName) continue
        const schedule: RouteSchedule = {
          Weekday: [],
          Saturday: [],
        }
        const weekdays = route
          .getElementsByTagName('Weekday')[0]
          ?.getElementsByTagName('Departure')
        if (weekdays)
          schedule.Weekday = Array.from(weekdays).map((d) => ({
            time: d.getAttribute('time') || '',
            note: d.getAttribute('note') || '',
          }))

        const saturdays = route
          .getElementsByTagName('Saturday')[0]
          ?.getElementsByTagName('Departure')
        if (saturdays)
          schedule.Saturday = Array.from(saturdays).map((d) => ({
            time: d.getAttribute('time') || '',
            note: d.getAttribute('note') || '',
          }))

        timetable[routeName] = schedule
      }
      return timetable
    }
    const loadTimetables = async () => {
      try {
        const parser = new DOMParser()
        const publicBusRes = await fetch('./Timetable/PublicBus.xml')
        const publicBusText = await publicBusRes.text()
        const publicBusXml = parser.parseFromString(
          publicBusText,
          'application/xml'
        )
        setPublicBusTimetable(parsePublicBusXml(publicBusXml))

        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        const todayStr = `${yyyy}-${mm}-${dd}`
        const dailyFile = `./Timetable/SchoolBus_${todayStr}.xml`
        const regularFile = `./Timetable/SchoolBus_Regular.xml`
        let schoolBusText: string
        try {
          const schoolBusRes = await fetch(dailyFile)
          if (!schoolBusRes.ok) {
            throw new Error('Daily file not found')
          }
          schoolBusText = await schoolBusRes.text()
          if (!schoolBusText.trimStart().startsWith('<?xml'))
            throw new Error('Invalid daily XML')
        } catch {
          const schoolBusRes = await fetch(regularFile)
          schoolBusText = await schoolBusRes.text()
        }
        const schoolBusXml = parser.parseFromString(
          schoolBusText,
          'application/xml'
        )
        const schoolBusTag = schoolBusXml.getElementsByTagName('Timetable')[0]
        if (schoolBusTag) {
          setSchoolBusType(schoolBusTag.getAttribute('type'))
        }
        setSchoolBusTimetable(parseSchoolBusXml(schoolBusXml))
      } catch (error) {
        console.error('Error loading or parsing timetable XML:', error)
      }
    }
    loadTimetables()
  }, [])
  const dayType = getDayType(currentTime)
  const isLoading = !publicBusTimetable || !schoolBusTimetable

  return (
    <>
      <div className="timetable-field">
        <div className="table1">
          <div className="label1">公共バス(西東京バス)</div>
          {isLoading ? (
            <div className="loading">読込中...</div>
          ) : (
            <>
              <div className="timetable1">
                <div className="bus">
                  <div className="bus-info">
                    <div className="busname">
                      工学院大学{' '}
                      <span className="destination">
                        工02 直通 JR・京王八王子駅行
                      </span>
                    </div>
                    <BusTimetableDisplay
                      schedule={publicBusTimetable?.['工学院大学']?.['K02']}
                      currentTime={currentTime}
                      dayType={dayType}
                      upcomingCount={maxItems}
                    />
                  </div>
                </div>
                <div className="bus">
                  <div className="bus-info">
                    <div className="busname">
                      工学院大学{' '}
                      <span className="destination">高月03 拝島駅行</span>
                    </div>
                    <BusTimetableDisplay
                      schedule={publicBusTimetable?.['工学院大学']?.['T03']}
                      currentTime={currentTime}
                      dayType={dayType}
                      upcomingCount={maxItems}
                    />
                  </div>
                </div>
                <div className="bus">
                  <div className="bus-info">
                    <div className="busname">
                      工学院大学西{' '}
                      <span className="destination">工01 楢原町行</span>
                    </div>
                    <BusTimetableDisplay
                      schedule={publicBusTimetable?.['工学院大学西']?.['K01-n']}
                      currentTime={currentTime}
                      dayType={dayType}
                      upcomingCount={maxItems}
                    />
                  </div>
                </div>
                <div className="bus">
                  <div className="bus-info">
                    <div className="busname">
                      工学院大学西{' '}
                      <span className="destination">
                        工01 JR・京王八王子駅行
                      </span>
                    </div>
                    <BusTimetableDisplay
                      schedule={publicBusTimetable?.['工学院大学西']?.['K01-h']}
                      currentTime={currentTime}
                      dayType={dayType}
                      upcomingCount={maxItems}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="table2">
          <div className="label2">
            スクールバス
            {schoolBusType === '臨時' && (
              <div className="if-temporary">臨時</div>
            )}
          </div>
          {isLoading ? (
            <div className="loading">読込中...</div>
          ) : (
            <>
              <div className="timetable2">
                <div className="bus">
                  <div className="bus-info">
                    <div className="busname">JR八王子駅南口行</div>
                    <BusTimetableDisplay
                      schedule={schoolBusTimetable?.['JR八王子駅南口行']}
                      currentTime={currentTime}
                      dayType={dayType}
                      upcomingCount={maxItems}
                    />
                  </div>
                </div>
                <div className="bus">
                  <div className="bus-info">
                    <div className="busname">京王八王子駅行</div>
                    <BusTimetableDisplay
                      schedule={schoolBusTimetable?.['京王八王子行']}
                      currentTime={currentTime}
                      dayType={dayType}
                      upcomingCount={maxItems}
                    />
                  </div>
                </div>
                <div className="bus">
                  <div className="bus-info">
                    <div className="busname">南大沢駅行</div>
                    <BusTimetableDisplay
                      schedule={schoolBusTimetable?.['南大沢駅行']}
                      currentTime={currentTime}
                      dayType={dayType}
                      upcomingCount={maxItems}
                    />
                  </div>
                </div>
                <div className="bus">
                  <div className="bus-info">
                    <div className="busname">拝島駅行</div>
                    <BusTimetableDisplay
                      schedule={schoolBusTimetable?.['拝島行']}
                      currentTime={currentTime}
                      dayType={dayType}
                      upcomingCount={maxItems}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Timetable
