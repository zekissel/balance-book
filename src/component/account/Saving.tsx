import { Account } from "../../typedef";

interface SavingProps { accounts: Account[] }
export default function SavingAccounts({ accounts }: SavingProps) {

  return (
    <main>
      { accounts.map(a => (<li>{ a.name } {a.type}</li>)) }
    </main>
  )
}