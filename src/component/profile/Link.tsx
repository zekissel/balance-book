import { useCallback, useState, useEffect } from 'react';
//import { start, cancel, onUrl, onInvalidUrl } from '@fabianlars/tauri-plugin-oauth';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { User } from '../../typedef';
import { useNavigate } from 'react-router-dom';
import {
	usePlaidLink,
	PlaidLinkOnSuccess,
	PlaidLinkOnEvent,
	PlaidLinkOnExit,
	PlaidLinkOptions,
} from 'react-plaid-link';

function getServerURL(_port: number) {
	// in Plaid production environment: change to hosted server (https://your-server.com)
	//return `https://us-central1-balance-book-auth.cloudfunctions.net/balance`;
	return `http://localhost:${_port}`
}

export interface PlaidKey { client_id: string; secret: string; }
interface PlaidLinkWithOAuthProps {
	user: User;
	pKey: PlaidKey;
}
const PlaidLink = ({ user, pKey }: PlaidLinkWithOAuthProps) => {
	const navigate = useNavigate();

	const port = 1422;
	const [token, setToken] = useState<string | null>(sessionStorage.getItem('link_token'));
	const [state, setState] = useState<string | null>(sessionStorage.getItem('auth_state'));

	const redirect = state ? `${getServerURL(port)}/callback?oauth_state_id=${state}` : undefined;

	useEffect(() => {
		if (state !== null) {
			console.log('>Likely redirect from Plaid<');
			return;
		}

		const unlisten = listen('oauth://url', (data) => {
			if (!data.payload) return;

			const url = new URL(data.payload as string);
			const recievedState = new URLSearchParams(url.search).get('oauth_state_id');

			console.log(data.payload, recievedState);
			if (recievedState) {
				sessionStorage.setItem('auth_state', recievedState);
				setState(recievedState);
				navigate(0);
			}
		});

		const createLinkToken = async () => {
			const resp = await invoke('authenticate', {
				userId: user.id,
				key: pKey,
				redirectUri: `${getServerURL(port)}/callback`,
			});
			const link_token = resp as string;
			console.log('link_token', link_token);
			sessionStorage.setItem('link_token', link_token);
			setToken(link_token);
		};

		createLinkToken();
		invoke('plugin:oauth|start', { config: { ports: [port] } });

		return () => {
			unlisten?.then((u) => u());
			invoke('plugin:oauth|cancel', { port: port });
		};
	}, []);

	// send public_token to server: https://plaid.com/docs/api/link/
	const onSuccess = useCallback<PlaidLinkOnSuccess>(async (publicToken, metadata) => {
		console.log(publicToken, metadata);
		await invoke('authorize', { userId: user.id, publicToken: publicToken, key: pKey });

		sessionStorage.removeItem('auth_state');
		sessionStorage.removeItem('link_token');
	}, []);
	// log onEvent callbacks from Link: https://plaid.com/docs/link/web/#onevent
	const onEvent = useCallback<PlaidLinkOnEvent>(async (eventName, metadata) => {
		console.log(eventName, metadata);
		if (eventName === 'OPEN_OAUTH') {
			await invoke('open_link', {
				url: `https://cdn.plaid.com/link/v2/stable/link.html?isWebview=true&token=${sessionStorage.getItem('link_token')}`,
			});
		}
	}, []);
	// log onExit callbacks from Link, handle errors
	const onExit = useCallback<PlaidLinkOnExit>((error, metadata) => {
		sessionStorage.removeItem('link_token');
		sessionStorage.removeItem('auth_state');
		console.log(error, metadata);
	}, []);

	const config: PlaidLinkOptions = {
		token,//: sessionStorage.getItem('link_token'),
		onSuccess,
		onEvent,
		onExit,
		receivedRedirectUri: redirect,
	};
	
	const { open, ready, error, /* exit, error */ } = usePlaidLink(config);

	useEffect(() => {
		if (ready) { open(); }
		if (error) console.error(error);
	}, [ready, open, error]);

	// No need to render a button on OAuth redirect as link opens instantly
	return state ? (
		<></>
	) : (
		<button onClick={() => open()} disabled={!ready}>
			Start Plaid Process
		</button>
	);
};

export default PlaidLink;
