import React, { useCallback, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import { listen } from "@tauri-apps/api/event";
import { User } from '../../typedef';
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
const PlaidLinkWithOAuth = ({ user }: PlaidLinkWithOAuthProps) => {

  const port = 1421;
  const [token, setToken] = useState<string | null>(localStorage.getItem('link_token'));
  const [state, setState] = useState<string | null>(localStorage.getItem('auth_state'));

  const redirect = state ? `http://localhost:${port}/callback?oauth_state_id=${state}` : undefined;


  React.useEffect(() => {

    if (localStorage.getItem('auth_state')) { console.log('USEEFFECT STOPPED (FROM REDIRECT?)'); return;}
    

    const unlisten = listen("oauth://url", (data) => {
      if (!data.payload) return;

      const url = new URL(data.payload as string);
      const state = new URLSearchParams(url.search).get("oauth_state_id");

      console.log(data.payload, state);
      if (state) {
        setState(state);
        console.log(state);
        localStorage.setItem('auth_state', state);
      }
    });

    const createLinkToken = async () => {
      const resp = await invoke('authenticate', {
        userId: user.id,
        redirectUri: `${getLocalURL(port)}/callback`,
      })
      const link_token = resp as string;
      console.log(link_token);
      setToken(link_token);
      // store link_token temporarily in case of OAuth redirect
      localStorage.setItem('link_token', link_token);
    }

    createLinkToken();

    invoke("plugin:oauth|start", { config: { ports: [port] } });


    () => {
      unlisten?.then((u) => u());
      invoke("plugin:oauth|cancel", { port: port });
    };

  }, []);
  

  const onSuccess = useCallback<PlaidLinkOnSuccess>((publicToken, metadata) => {
    // send public_token to your server: https://plaid.com/docs/api/tokens/#token-exchange-flow
    console.log(publicToken, metadata);
    invoke('authorize', { userId: user.id, publicToken: publicToken })
  }, []);
  const onEvent = useCallback<PlaidLinkOnEvent>((eventName, metadata) => {
    // log onEvent callbacks from Link
    // https://plaid.com/docs/link/web/#onevent
    console.log(eventName, metadata);
  }, []);
  const onExit = useCallback<PlaidLinkOnExit>((error, metadata) => {
    // log onExit callbacks from Link, handle errors
    localStorage.removeItem('link_token');
    localStorage.removeItem('auth_state');
    console.log(error, metadata);
  }, []);
  const config: PlaidLinkOptions = { token, onSuccess, onEvent, onExit, receivedRedirectUri: redirect };
  const { open, ready, /* exit, error */ } = usePlaidLink(config);

  /*
  React.useEffect(() => {
    if (isOAuthRedirect && ready) open();
  }, [ready, open, isOAuthRedirect]);*/

  // No need to render a button on OAuth redirect as link opens instantly
  return localStorage.getItem('auth_state') ? (
    <></>
  ) : (
    <button onClick={() => open()} disabled={!ready}>
      Connect a bank account
    </button>
  );
};

export default PlaidLinkWithOAuth;