import { ActivityProps } from "../../typedef";


export default function List ({ expenses }: ActivityProps) {

  return (
    <div>
      <ol>
        {expenses.map((expense, index) => (
          <li key={index}>
            <span>{expense.date.toDateString()} {expense.store}</span>
            <span> {expense.amount / 100} </span>
            <span>{expense.category} - {expense.desc}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}