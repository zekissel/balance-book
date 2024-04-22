import { invoke } from '@tauri-apps/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loading from '../../assets/loading.svg';
import { User, DataState } from '../../typedef';
import Float from '../home/Float';

interface AuthProps {
	verify: (user: User) => void;
	logout: () => void;
}
export default function Auth({ verify, logout }: AuthProps) {
	const [dataState, setDataState] = useState(DataState.Success);
	const [error, setError] = useState('');
	useEffect(() => {
		const timer = setTimeout(() => setError(''), 5000);
		return () => clearTimeout(timer);
	}, [error]);
	useEffect(() => {
		const timer = setTimeout(() => setDataState(DataState.Success), 5000);
		return () => clearTimeout(timer);
	}, [dataState]);
	useEffect(() => {
		localStorage.removeItem('userid');
		localStorage.removeItem('username');
		localStorage.removeItem('useremail');
		localStorage.removeItem('userf');
		localStorage.removeItem('userl');
		localStorage.removeItem('dob');
	}, []);

	const [name, setName] = useState(localStorage.getItem('username') ?? '');
	const [pass, setPass] = useState(localStorage.getItem('pass') ?? '');
	const [confirmPass, setConfirmPass] = useState('');
	const navigate = useNavigate();

	const enterLogin = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') login();
	};
	const login = async () => {
		setDataState(DataState.Loading);
		await invoke('login', { name: name, password: pass })
			.then((data) => {
				if (data === null) {
					logout();
					setError('Invalid credentials');
					setDataState(DataState.Error);
				} else {
					setDataState(DataState.Success);
					confirmUser(data as User);
				}
			})
			.catch(() => setDataState(DataState.Error))
			.finally(() => setPass(''));
	};
	const [showRegister, setShowRegister] = useState(false);
	const toggleRegister = () => setShowRegister(!showRegister);
	const register = async () => {
		if (pass === confirmPass) {
			setDataState(DataState.Loading);
			await invoke('register', { name: name, password: pass })
				.then((data) => {
					if (data === null) {
						logout();
						setError('Username already in use');
						setDataState(DataState.Error);
					} else {
						setDataState(DataState.Success);
						confirmUser(data as User);
					}
				})
				.catch(() => setDataState(DataState.Error));
		} else setError('Passwords do not match');
	};

	const confirmUser = (data: User) => {
		const user = data as User;
		user.dob = user.dob ? new Date(user.dob) : null;
		verify(user);
		navigate('/home');
	};

	const handleRegister = () => {
		if (!showRegister) {
			toggleRegister();
			return;
		}
		if (name.length > 0 && pass.length > 0 && confirmPass.length > 0) {
			register();
			return;
		}
	};

	return (
		<div className="no-auth">
			<Float />
			<div className="auth-field">
				<input
					type="text"
					placeholder="Username"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
				<input
					type="password"
					placeholder="Password"
					value={pass}
					onChange={(e) => setPass(e.target.value)}
					onKeyDown={enterLogin}
				/>
				{showRegister && (
					<input
						type="password"
						placeholder="Confirm Password"
						value={confirmPass}
						onChange={(e) => setConfirmPass(e.target.value)}
					/>
				)}
				{!showRegister && <button onClick={login}>Login</button>}
				<button onClick={handleRegister} disabled={dataState === DataState.Loading}>
					Register
				</button>
				{showRegister && (
					<button onClick={toggleRegister} disabled={dataState === DataState.Loading}>
						Cancel
					</button>
				)}
				{error !== '' && <p>{error}</p>}
				{dataState === DataState.Error && <p>Something went wrong</p>}
				{dataState === DataState.Loading && (
					<div className="stats-graph app-loading">
						<img className='loading-spinner' src={loading} alt='loading' />
					</div>
				)}
			</div>
		</div>
	);
}