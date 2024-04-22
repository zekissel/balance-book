import { User, Account, Transaction } from '../../typedef';
import Logo from '../home/Logo';
import Preview from '../home/Preview';
import News from '../home/News';
import '../../styles/Page.css';
import '../../styles/Menu.css';

interface HomeProps {
	user: User;
	accounts: Account[];
	transactions: Transaction[];
}
export default function Home({ user, accounts, transactions }: HomeProps) {
	return (
		<div className="page-root">
			<menu className="dynamic-menu">
				<div className="dynamic-menu-main">
					<button>{new Date().toDateString()}</button>
					<button>Welcome, {user.fname !== null ? user.fname : user.uname}!</button>
				</div>

				<div className="dynamic-menu-main">
					<button>
						<a href='https://github.com/zekissel/balance-book' target='_blank' rel='noopener noreferrer'><img src="/github.svg" /> Source</a>
					</button>
				</div>
			</menu>

			<div className="page-main">
				<Logo />

				<Preview accounts={accounts} transactions={transactions} />

				<News />
			</div>
		</div>
	);
}
