import React, { useCallback, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import { listen } from "@tauri-apps/api/event";
import { User } from '../../typedef';
import { useNavigate } from 'react-router-dom';
import {
  usePlaidLink,
  PlaidLinkOnSuccess,
  PlaidLinkOnEvent,
  PlaidLinkOnExit,
  PlaidLinkOptions,
} from 'react-plaid-link';

function getLocalURL(port: number) {
  return `http://localhost:${port}`;
}

interface PlaidLinkWithOAuthProps { user: User }
const PlaidLink = ({ user }: PlaidLinkWithOAuthProps) => {
  const navigate = useNavigate();

  const port = 1421;
  const [token, setToken] = useState<string | null>(localStorage.getItem('link_token'));
  const [state, setState] = useState<string | null>(localStorage.getItem('auth_state'));

  const redirect = state ? `http://localhost:${port}/callback?oauth_state_id=${state}` : undefined;


  React.useEffect(() => {

    if (state !== null) { console.log('>Likely redirect from Plaid<'); return }
    

    const unlisten = listen("oauth://url", (data) => {
      if (!data.payload) return;

      const url = new URL(data.payload as string);
      const state = new URLSearchParams(url.search).get("oauth_state_id");

      console.log(data.payload, state);
      if (state) {
        localStorage.setItem('auth_state', state);
        setState(state);
        navigate(0);
      }
    });

    const createLinkToken = async () => {
      const resp = await invoke('authenticate', {
        userId: user.id,
        redirectUri: `${getLocalURL(port)}/callback`,
      })
      const link_token = resp as string;
      console.log('link_token', link_token);
      localStorage.setItem('link_token', link_token);
      setToken(link_token);
    }

    createLinkToken();
    invoke("plugin:oauth|start", { config: { ports: [port] } });


    return () => {
      unlisten?.then((u) => u());
      invoke("plugin:oauth|cancel", { port: port });
    };

  }, []);
  
  // send public_token to server: https://plaid.com/docs/api/tokens/#token-exchange-flow
  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (publicToken, metadata) => {
    console.log(publicToken, metadata);
    await invoke('authorize', { userId: user.id, publicToken: publicToken })
    localStorage.removeItem('auth_state');
  }, []);
  // log onEvent callbacks from Link: https://plaid.com/docs/link/web/#onevent
  const onEvent = useCallback<PlaidLinkOnEvent>((eventName, metadata) => {
    console.log(eventName, metadata);
    if (eventName === 'OPEN_OAUTH') {
      invoke('open_link', { url: `https://cdn.plaid.com/link/v2/stable/link.html?isWebview=true&token=${localStorage.getItem('link_token')}` })
    }
  }, []);
  // log onExit callbacks from Link, handle errors
  const onExit = useCallback<PlaidLinkOnExit>((error, metadata) => {
    localStorage.removeItem('link_token');
    localStorage.removeItem('auth_state');
    console.log(error, metadata);
  }, []);
  
  const config: PlaidLinkOptions = { token, onSuccess, onEvent, onExit, receivedRedirectUri: redirect };
  const { open, ready, /* exit, error */ } = usePlaidLink(config);

  
  React.useEffect(() => {
    if (ready) open();
  }, [ready, open, state]);

  // No need to render a button on OAuth redirect as link opens instantly
  return localStorage.getItem('auth_state') ? (
    <></>
  ) : (
    <button onClick={() => open()} disabled={!ready}>
      Connect a bank account
    </button>
  );
};

export default PlaidLink;