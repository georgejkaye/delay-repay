"use client"

import { act, useEffect, useState } from "react"

const TopBar = () => (
  <div className="bg-blue-700 p-4">
    <h1 className="font-bold text-2xl">Delay repay calculator</h1>
  </div>
)

type SetState<T> = React.Dispatch<React.SetStateAction<T>>

const getDateFromText = (str: string) => {
  let year = Number.parseInt(str.substring(0, 4))
  let month = Number.parseInt(str.substring(5, 7))
  let day = Number.parseInt(str.substring(8, 10))
  if (
    !Number.isNaN(year) &&
    !Number.isNaN(month) &&
    !Number.isNaN(day) &&
    year >= 0 &&
    month >= 0 &&
    month <= 12 &&
    day >= 0 &&
    day <= 31
  ) {
    return { year, month, day }
  } else {
    return undefined
  }
}

const getTimeFromText = (str: string) => {
  let minuteIndex = str.length === 4 ? 2 : 3
  let hour = Number.parseInt(str.substring(0, 2))
  let minute = Number.parseInt(str.substring(minuteIndex, minuteIndex + 2))
  if (
    !Number.isNaN(hour) &&
    !Number.isNaN(minute) &&
    hour >= 0 &&
    hour < 24 &&
    minute >= 0 &&
    minute < 60
  ) {
    return { hour, minute }
  } else {
    return undefined
  }
}

const DateAndTimePicker = (props: {
  date: Date | undefined
  setDate: SetState<Date | undefined>
}) => {
  const [dateText, setDateText] = useState(
    props.date
      ? `${props.date.getFullYear().toString().padStart(4, "0")}-${props.date
          .getMonth()
          .toString()
          .padStart(2, "0")}-${props.date
          .getDate()
          .toString()
          .padStart(2, "0")}`
      : ""
  )
  const [timeText, setTimeText] = useState(
    props.date
      ? `${props.date.getHours().toString().padStart(2, "0")}:${props.date
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      : ""
  )
  useEffect(() => {
    let dateResult = getDateFromText(dateText)
    let timeResult = getTimeFromText(timeText)
    if (!dateResult || !timeResult) {
      props.setDate(undefined)
    } else {
      let { year, month, day } = dateResult
      let { hour, minute } = timeResult
      props.setDate(new Date(year, month, day, hour, minute))
    }
  }, [dateText, timeText])
  const onChangeText = (
    e: React.ChangeEvent<HTMLInputElement>,
    setState: SetState<string>
  ) => {
    setState(e.target.value)
  }
  return (
    <div className="flex flex-row gap-4">
      <input
        aria-label="Date"
        type="date"
        className="text-black p-4 rounded-xl w-48 text-center"
        value={dateText}
        onChange={(e) => onChangeText(e, setDateText)}
      />
      <input
        aria-label="Time"
        type="time"
        className="text-black p-4 rounded-xl w-24 text-center"
        value={timeText}
        onChange={(e) => onChangeText(e, setTimeText)}
      />
    </div>
  )
}

const MainSection = () => {
  const [expected, setExpected] = useState<Date | undefined>(new Date())
  const [actual, setActual] = useState<Date | undefined>(new Date())
  const [delay, setDelay] = useState<number | undefined>(undefined)
  const getDelayText = (delay: number) =>
    delay < 15
      ? "Less than 15 minutes"
      : delay < 30
      ? "15-29 minutes"
      : delay < 60
      ? "30-59 minutes"
      : delay < 120
      ? "60-119 minutes"
      : "Over 120 minutes"
  useEffect(() => {
    if (!expected || !actual) {
      setDelay(undefined)
    } else {
      setDelay((actual.getTime() - expected.getTime()) / 1000 / 60)
    }
  }, [expected, actual])
  return (
    <div className="m-5 w-mobileContent tablet:w-tabletContent desktop:w-content mx-auto">
      <div>
        <h2 className="font-bold text-xl">Delay details</h2>
        <div className="flex flex-col tablet:flex-row gap-5">
          <div>
            <div className="mt-4 mb-2">Expected arrival</div>
            <DateAndTimePicker date={expected} setDate={setExpected} />
          </div>
          <div>
            <div className="mt-4 mb-2">Expected arrival</div>
            <DateAndTimePicker date={actual} setDate={setActual} />
          </div>
        </div>
        <div className="my-4 text-lg">
          {!delay
            ? "Enter expected and actual arrival times above"
            : `Delayed ${delay} minutes: ${getDelayText(delay)}`}
        </div>
      </div>
    </div>
  )
}

const Home = () => (
  <main>
    <TopBar />
    <MainSection />
  </main>
)

export default Home
