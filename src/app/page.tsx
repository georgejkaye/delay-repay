"use client"

import { useEffect, useState } from "react"

const TopBar = () => (
  <div className="bg-blue-800 p-4">
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
  let { date, setDate } = props
  const [dateText, setDateText] = useState(
    props.date
      ? `${props.date.getFullYear().toString().padStart(4, "0")}-${(
          props.date.getMonth() + 1
        )
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
      setDate(undefined)
    } else {
      let { year, month, day } = dateResult
      let { hour, minute } = timeResult
      setDate(new Date(year, month, day, hour, minute))
    }
  }, [dateText, timeText, setDate])
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
        className="text-black p-2 rounded-xl w-44 text-center"
        value={dateText}
        onChange={(e) => onChangeText(e, setDateText)}
      />
      <input
        aria-label="Time"
        type="time"
        className="text-black p-2 rounded-xl w-24 text-center"
        value={timeText}
        onChange={(e) => onChangeText(e, setTimeText)}
      />
    </div>
  )
}

const getDelayStyle = (delay: number | undefined) =>
  delay === undefined
    ? "bg-white"
    : delay < 15
    ? "bg-green-500"
    : delay < 30
    ? "bg-yellow-600"
    : delay < 60
    ? "bg-orange-400"
    : delay < 120
    ? "bg-red-500"
    : "bg-red-800"

const DelayCalculator = (props: {
  delay: number | undefined
  setDelay: SetState<number | undefined>
}) => {
  let { delay, setDelay } = props
  const [expected, setExpected] = useState<Date | undefined>(new Date())
  const [actual, setActual] = useState<Date | undefined>(new Date())
  const getDelayText = (delay: number) =>
    delay < 0
      ? "Early"
      : delay === 0
      ? "On time"
      : delay < 15
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
  }, [expected, actual, setDelay])
  return (
    <div>
      <h2 className="font-bold text-xl">Delay details</h2>
      <div className="flex flex-col desktop:flex-row gap-2">
        <div>
          <div className="mt-4 mb-2">Expected arrival</div>
          <DateAndTimePicker date={expected} setDate={setExpected} />
        </div>
        <div>
          <div className="mt-4 mb-2">Actual arrival</div>
          <DateAndTimePicker date={actual} setDate={setActual} />
        </div>
      </div>
      <div className={`my-6 text-lg`}>
        {props.delay === undefined ? (
          ""
        ) : (
          <div className="flex flex-row gap-2">
            <div className="py-1">Delayed {props.delay} minutes</div>
            <div
              className={`${getDelayStyle(
                props.delay
              )} rounded-lg px-2 py-1 font-bold`}
            >
              {getDelayText(props.delay)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface Ticket {
  id: number
  ret: boolean | undefined
  price: number | undefined
}

const Ticket = (props: {
  ret: boolean | undefined
  price: number | undefined
  updateTicket: (r: boolean | undefined, p: number | undefined) => void
  removeTicket: () => void
}) => {
  let { ret, price, updateTicket, removeTicket } = props
  const enabledStyle = "bg-blue-800 text-gray-200"
  const disabledStyle = "bg-gray-700 text-black hover:bg-gray-600"
  const singleStyle = !props.ret ? enabledStyle : disabledStyle
  const returnStyle = props.ret ? enabledStyle : disabledStyle
  const onClickReturnType = (ret: boolean) =>
    props.updateTicket(ret, props.price)
  const [priceText, setPriceText] = useState("")
  const onChangePriceText = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPriceText(e.target.value)
  useEffect(() => {
    let priceNumber = Number.parseInt(priceText)
    if (!Number.isNaN(priceNumber)) {
      updateTicket(ret, priceNumber)
    } else {
      updateTicket(ret, undefined)
    }
  }, [priceText, updateTicket, ret])
  return (
    <div className="flex flex-col desktop:flex-row rounded-xl w-96 gap-4">
      <div className="flex flex-row w-full align-items-center gap-4">
        <div className="flex flex-row gap-2">
          <button
            disabled={!props.ret}
            className={`${singleStyle} p-2 rounded-xl flex flex-row gap-2`}
            onClick={(e) => onClickReturnType(false)}
          >
            <div>Single</div>
            <div>{!props.ret ? "✔" : "✘"}</div>
          </button>
          <button
            disabled={props.ret}
            className={`${returnStyle} p-2 rounded-xl flex flex-row gap-2`}
            onClick={(e) => onClickReturnType(true)}
          >
            <div>Return</div>
            <div>{props.ret ? "✔" : "✘"}</div>
          </button>
        </div>
        <div className="flex flex-row items-center flex-1 mx-auto justify-center">
          <div className="mr-2">£</div>
          <input
            className="rounded-xl p-2 w-24 text-black"
            type="text"
            placeholder="Price"
            value={priceText}
            onChange={onChangePriceText}
          ></input>
        </div>
        <button
          className="text-red-600 hover:text-red-300 p-2 px-3 rounded-xl"
          onClick={(e) => props.removeTicket()}
        >
          ✘
        </button>
      </div>
    </div>
  )
}

const getDelayRepay = (price: number, delay: number, ret: boolean) => {
  let base = delay < 15 ? 0 : delay < 30 ? 0.25 : delay < 60 ? 0.5 : 1
  let multiplier = ret && delay < 120 ? 0.5 : 1
  return price * base * multiplier
}

const TicketList = (props: { delay: number | undefined }) => {
  let { delay } = props
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [nextId, setNextId] = useState(0)
  const [repay, setRepay] = useState(0)
  const [cost, setCost] = useState(0)
  const updateTicket = (
    id: number,
    ret: boolean | undefined,
    price: number | undefined
  ) => {
    let newArray = [...tickets.filter((t) => t.id !== id), { id, ret, price }]
    setTickets(newArray)
  }
  const addTicket = () => {
    setTickets([...tickets, { id: nextId, ret: false, price: 0 }])
    setNextId(nextId + 1)
  }
  const removeTicket = (id: number) => {
    setTickets(tickets.filter((t) => t.id !== id))
  }
  const computeTotalTicketCost = (tickets: Ticket[]) => {
    return tickets
      .map((ticket) => (!ticket.price ? 0 : ticket.price))
      .reduce((prev, cur) => prev + cur, 0)
  }
  const computeTotalDelayRepay = (tickets: Ticket[]) => {
    return tickets
      .map((ticket) =>
        !ticket.price || ticket.ret === undefined || !props.delay
          ? 0
          : getDelayRepay(ticket.price, props.delay, ticket.ret)
      )
      .reduce((prev, cur) => prev + cur, 0)
  }
  useEffect(() => {
    setRepay(computeTotalDelayRepay(tickets))
    setCost(computeTotalTicketCost(tickets))
  }, [tickets, delay])
  return (
    <div>
      <h2 className="font-bold text-xl mb-4">Tickets</h2>
      <div className="flex flex-row gap-4 mb-6">
        <div className="flex flex-row gap-4">
          <div className="py-2">Total cost</div>
          <div className="p-2 bg-blue-800 rounded-lg font-bold">
            {" "}
            £{cost.toFixed(2)}
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <div className="py-2">Delay repay</div>
          <div
            className={`rounded-lg p-2 ${getDelayStyle(props.delay)} font-bold`}
          >
            £{repay.toFixed(2)}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 my-4">
        {Array.from(tickets.values()).map((ticket) => (
          <Ticket
            key={ticket.id}
            ret={ticket.ret}
            price={ticket.price}
            updateTicket={(r, p) => updateTicket(ticket.id, r, p)}
            removeTicket={() => removeTicket(ticket.id)}
          />
        ))}
        <button
          className="w-48 rounded-xl my-4 p-2 bg-blue-800 hover:bg-blue-600"
          onClick={(e) => addTicket()}
        >
          Add ticket
        </button>
      </div>
    </div>
  )
}

const MainSection = () => {
  const [delay, setDelay] = useState<number | undefined>(undefined)
  return (
    <div className="w-mobileContent tablet:w-tabletContent desktop:w-content m-5 tablet:mx-auto">
      <DelayCalculator delay={delay} setDelay={setDelay} />
      <TicketList delay={delay} />
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
