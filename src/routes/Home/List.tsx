import { Account, Transaction } from "../../typedef";

interface ListProps {
  accounts: Account[];
  transactions: Transaction[];
}
export default function List ({ accounts, transactions }: ListProps) {

  return (
    <div>
      List Component


      <ul>
        { transactions.map((t) => (
          <li key={t.id}>
            <span>{t.timestamp}</span>
            <span>{t.store}</span>
            <span>{t.amount}</span>
            <span>{t.category}</span>
            <span>{t.description}</span>
          </li>
        )) }

        { transactions.length === 0 && <p>No transactions yet.</p> }
      </ul>

    </div>
  )
}