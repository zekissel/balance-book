import { Account, Transaction } from "../../typedef"

interface StatsPageProps { transactions: Transaction[], accounts: Account[] }
export default function StatsInfo ({ transactions, accounts }: StatsPageProps) {



  return (
    <div className='stats-stats'>
      <h4>Statistics by Category</h4>

      { transactions.length }
      { accounts.length }
    </div>
  )
}