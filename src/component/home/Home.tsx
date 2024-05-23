import { useState, useEffect, useMemo } from "react"
import { invoke } from '@tauri-apps/api';
import { useSecureStorage } from "../../stronghold";
import Menu, { MenuButton } from "../Menu"
import Logo from "./Logo";
import { User } from "../../typedef";
import { PlaidKey } from "../profile/Link";


interface HomeProps { user: User }
export default function Home({ user }: HomeProps) {

  enum UIState { Dashboard, Budget, News }
  const [state, setState] = useState<UIState>(UIState.Dashboard);

  const { load } = useSecureStorage(user.id, 'r');

  const [retry, setRetry] = useState<number>(0);
  const [pID, setPID] = useState<string>('');
  const [pSecret, setPSecret] = useState<string>('');

  const plaidKey = useMemo(() => {
    return new Object({ client_id: pID, secret: pSecret }) as PlaidKey;
  }, [pID, pSecret]);

  useEffect(() => {
    const loadPlaidInfo = async () => {
      await load('plaid-client-id', user.id).then(id => {if (id !== '') setPID(id)})
        .catch(() => setRetry(retry + 1));
      await load('plaid-secret', user.id).then(secret => {if (secret !== '') setPSecret(secret)})
        .catch(() => setRetry(retry + 1));
    }

    if (retry <= 5) loadPlaidInfo();
  }, [retry]);

  const [loading, setLoading] = useState<boolean>(false);
  const sync = async () => {
    if (pID === '' || pSecret === '') {console.error('no plaid ID or secret'); return};
    setLoading(true);
    await invoke('sync_info', { userId: user.id, key: plaidKey })
      .then((_data) => {
        /* differentiate recently sync'd transactions */
        const recent = _data as string[];
        if (recent.length > 0 ) sessionStorage.setItem('recent', recent.join('&'));
      })
    setLoading(false);
  }

  return (
    <div className='w-full'>
      <Menu
        leftPanel={
          <>
            <MenuButton onClick={() => setState(UIState.Dashboard)} children={<><img src='/menu/dashboard.svg' draggable={false} /> Dashboard</>} active={state === UIState.Dashboard} />
            <MenuButton onClick={() => setState(UIState.Budget)} children={<><img src='/menu/budget.svg' draggable={false} /> Budget</>} active={state === UIState.Budget} />
            <MenuButton onClick={() => setState(UIState.News)} children={<><img src='/menu/news.svg' draggable={false} /> News</>} active={state === UIState.News} />
          </>
        }
        rightPanel={
          <>
            <MenuButton onClick={sync} children={<><img src='/misc/refresh.svg' draggable={false} /> Sync</>} active={loading} disabled={pID === '' || pSecret === ''} />
            <MenuButton onClick={() => {}} children={<a className='flex flex-row' href='https://github.com/zekissel/balance-book' target='_blank' rel='noreferrer nofollow'><img src='/menu/github.svg' draggable={false} />{' '}Source</a>} active={false} />
          </>
        }
      />
      
      <main>
        { state === UIState.Dashboard &&
          <>
            <Logo />
          </>
        }

        { state === UIState.Budget &&
          <>(wip) budget</>
        }

        { state === UIState.News &&
          <>(wip) news</>
        }
      </main>

    </div>
  )
}