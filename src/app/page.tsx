"use client"

import { useEffect, useState } from "react"
import operatorData from "../../operators.json"

interface RepayBracket {
  min: number
  max: number | null
  single: number
  return: number
}

interface Operator {
  name: string
  repays: RepayBracket[]
}

const operators: Operator[] = [...operatorData].sort((op1, op2) =>
  op1.name.localeCompare(op2.name)
)

const TopBar = () => (
  <div className="bg-blue-800 p-4">
    <h1 className="font-bold text-2xl">Delay Repay Calculator</h1>
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
        className="text-black h-10 rounded-xl w-44 text-center px-2"
        value={dateText}
        onChange={(e) => onChangeText(e, setDateText)}
      />
      <input
        aria-label="Time"
        type="time"
        className="text-black h-10 rounded-xl w-24 text-center px-2"
        value={timeText}
        onChange={(e) => onChangeText(e, setTimeText)}
      />
    </div>
  )
}

const OperatorSelector = (props: {
  operator: Operator | undefined
  setOperator: SetState<Operator | undefined>
}) => {
  const [selected, setSelected] = useState(-1)
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let index = Number.parseInt(e.target.value)
    setSelected(index)
    let newOperator = index === -1 ? undefined : operators[index]
    props.setOperator(newOperator)
  }
  return (
    <div>
      <select
        className="h-10 w-72 px-4 text-black rounded-xl bg-white"
        value={selected}
        onChange={handleChange}
      >
        <option key={-1} value={-1}></option>
        {operators.map((op, i) => {
          return (
            <option key={i} value={i}>
              {op.name}
            </option>
          )
        })}
      </select>
    </div>
  )
}

const getDelayStyle = (delay: number | undefined, repayBracket: RepayBracket | undefined) =>
  delay === undefined
    ? "bg-white"
    : delay < 15 || repayBracket === undefined
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
  repayBracket: RepayBracket | undefined
  setRepayBracket: SetState<RepayBracket | undefined>
}) => {
  let { delay, setDelay, repayBracket, setRepayBracket } = props
  const [operator, setOperator] = useState<Operator | undefined>(undefined)
  const [expected, setExpected] = useState<Date | undefined>(new Date())
  const [actual, setActual] = useState<Date | undefined>(new Date())
  const getRepayBracket = (operator: Operator | undefined, delay: number) =>
    !operator
      ? undefined
      : operator.repays.find(
          (bracket) =>
            (!bracket.min || bracket.min <= delay) &&
            (!bracket.max || bracket.max >= delay)
        )
  const getDelayText = (
    delay: number | undefined,
    repayBracket: RepayBracket | undefined
  ) => {
    if (!delay) {
      return "No compensation"
    } else if (delay < 0) {
      return "Early"
    } else if (delay === 0) {
      return "On time"
    } else {
      if (repayBracket === undefined) {
        return "No compensation"
      } else {
        let string =
          !repayBracket.min && !repayBracket.max
            ? "Delayed"
            : !repayBracket.min
            ? `≤ ${repayBracket.max} minutes`
            : !repayBracket.max
            ? `≥ ${repayBracket.min} minutes`
            : `${repayBracket.min}-${repayBracket.max} minutes`
        return string
      }
    }
  }
  useEffect(() => {
    if (!expected || !actual) {
      setDelay(undefined)
      setRepayBracket(undefined)
    } else {
      let newDelay = (actual.getTime() - expected.getTime()) / 1000 / 60
      setDelay(newDelay)
      setRepayBracket(getRepayBracket(operator, newDelay))
    }
  }, [expected, actual, operator])
  return (
    <div>
      <h2 className="font-bold text-xl">Delay details</h2>
      <div className="flex flex-col desktop:flex-row gap-4">
        <div>
          <div className="mt-4 mb-2">Expected arrival</div>
          <DateAndTimePicker date={expected} setDate={setExpected} />
        </div>
        <div>
          <div className="mt-4 mb-2">Actual arrival</div>
          <DateAndTimePicker date={actual} setDate={setActual} />
        </div>
        <div>
          <div className="mt-4 mb-2">Operator</div>
          <OperatorSelector operator={operator} setOperator={setOperator} />
        </div>
      </div>
      <div className={`my-6 text-lg`}>
        {props.delay === undefined ? (
          ""
        ) : (
          <div className="flex flex-col desktop:flex-row gap-4">
            <div className="flex flex-row gap-4">
              <div className="py-1">Delayed {props.delay} minutes</div>
              {!operator ? (
                ""
              ) : (
                <div
                  className={`${getDelayStyle(
                    props.delay, props.repayBracket
                  )} rounded-lg px-2 py-1 font-bold`}
                >
                  {getDelayText(delay, repayBracket)}
                </div>
              )}
            </div>
            {!operator || !repayBracket ? (
              ""
            ) : (
              <div className="flex flex-row gap-4">
                <div className="py-1">Single</div>
                <div
                  className={`${getDelayStyle(
                    props.delay, props.repayBracket
                  )} rounded-lg px-2 py-1 font-bold`}
                >
                  {repayBracket.single * 100}%
                </div>
                <div className="py-1">Return</div>
                <div
                  className={`${getDelayStyle(
                    props.delay, props.repayBracket
                  )} rounded-lg px-2 py-1 font-bold`}
                >
                  {repayBracket.return * 100}%
                </div>
              </div>
            )}
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
    let priceNumber = Number.parseFloat(priceText)
    if (!Number.isNaN(priceNumber)) {
      updateTicket(ret, priceNumber)
    } else {
      updateTicket(ret, undefined)
    }
  }, [priceText, ret])
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
            type="number"
            step="0.01"
            min="0"
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

const TicketList = (props: {
  delay: number | undefined
  repayBracket: RepayBracket | undefined
}) => {
  let { delay, repayBracket } = props
  console.log(repayBracket)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [nextId, setNextId] = useState(0)
  const [repay, setRepay] = useState(0)
  const [cost, setCost] = useState(0)
  const updateTicket = (
    id: number,
    ret: boolean | undefined,
    price: number | undefined
  ) => {
    setTickets((oldTickets) =>
      oldTickets.map((t) => (t.id === id ? { id, ret, price } : t))
    )
  }
  const addTicket = () => {
    setTickets((oldTickets) => [
      ...oldTickets,
      { id: nextId, ret: false, price: 0 },
    ])
    setNextId(nextId + 1)
  }
  const removeTicket = (id: number) => {
    setTickets((oldTickets) => oldTickets.filter((t) => t.id !== id))
  }
  const computeTotalTicketCost = (tickets: Ticket[]) => {
    return tickets
      .map((ticket) => (!ticket.price ? 0 : ticket.price))
      .reduce((prev, cur) => prev + cur, 0)
  }
  const computeTotalDelayRepay = (tickets: Ticket[]) => {
    return tickets
      .map((ticket) =>
        !ticket.price || ticket.ret === undefined || !delay || !repayBracket
          ? 0
          : ticket.price *
            (ticket.ret ? repayBracket.return : repayBracket.single)
      )
      .reduce((prev, cur) => prev + cur, 0)
  }
  useEffect(() => {
    setRepay(computeTotalDelayRepay(tickets))
    setCost(computeTotalTicketCost(tickets))
  }, [tickets, delay, repayBracket])
  return (
    <div>
      <h2 className="font-bold text-xl mb-4">Tickets</h2>
      <div className="flex flex-row gap-4 mb-6">
        <div className="flex flex-row gap-4">
          <div className="py-2">Total cost</div>
          <div className="p-2 bg-blue-800 rounded-lg font-bold">
            {cost.toLocaleString("en-GB", {
              style: "currency",
              currency: "GBP",
            })}
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <div className="py-2">Delay repay</div>
          <div
            className={`rounded-lg p-2 ${getDelayStyle(props.delay, props.repayBracket)} font-bold`}
          >
            {repay.toLocaleString("en-GB", {
              style: "currency",
              currency: "GBP",
            })}
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
  const [repayBracket, setRepayBracket] = useState<RepayBracket | undefined>(
    undefined
  )
  return (
    <div className="w-mobileContent tablet:w-tabletContent desktop:w-content m-5 tablet:mx-auto">
      <DelayCalculator
        delay={delay}
        setDelay={setDelay}
        repayBracket={repayBracket}
        setRepayBracket={setRepayBracket}
      />
      <TicketList delay={delay} repayBracket={repayBracket} />
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
