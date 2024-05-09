import { Account } from "../../typedef";

interface OtherProps { accounts: Account[] }
export default function OtherAccounts({ accounts }: OtherProps) {

  return (
    <main>
      { accounts.map(a => (<li>{ a.name } {a.type}</li>)) }
    </main>
  )
}