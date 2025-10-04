import { useEffect, useState } from "react";
import "./Clock.css";

const Clock = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const weekdays = [
    "日曜日",
    "月曜日",
    "火曜日",
    "水曜日",
    "木曜日",
    "金曜日",
    "土曜日",
  ];

  const formattedDate = `${dateTime.getFullYear()}/${String(dateTime.getMonth() + 1).padStart(2, "0")}/${String(dateTime.getDate()).padStart(2, "0")}`;
  const formattedTime = `${String(dateTime.getHours()).padStart(2, "0")}:${String(dateTime.getMinutes()).padStart(2, "0")}`;
  const formattedWeekday = weekdays[dateTime.getDay()];

  return (
    <>
      <div className="clock">
        <div className="date">
          {formattedDate} {formattedWeekday}
        </div>
        <div className="time">{formattedTime}</div>
      </div>
    </>
  );
};

export default Clock;
