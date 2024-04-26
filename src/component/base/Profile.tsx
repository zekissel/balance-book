import { invoke } from '@tauri-apps/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../typedef';
import { addDays } from '../../typeassist';
import ProfileLink from '../link/ProfileLink';
import '../../styles/Profile.css';

interface ProfileProps {
	user: User;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	logout: () => void;
	refreshAcct: () => void;
	refreshTrans: () => void;
}
export default function Profile({
	user,
	setUser,
	logout,
	refreshAcct,
	refreshTrans,
}: ProfileProps) {
	const [email, setEmail] = useState(user.email ?? '');
	const [password, setPassword] = useState('');
	const [pass2, setPass2] = useState('');
	const [fname, setFname] = useState(user.fname ?? '');
	const [lname, setLname] = useState(user.lname ?? '');
	const [dob, setDob] = useState(
		localStorage.getItem('dob') ? new Date(localStorage.getItem('dob') as string) : null,
	);

	const [oldPass, setOldPass] = useState('');
	const [error, setError] = useState('');
	useEffect(() => {
		const timer = setTimeout(() => setError(''), 5000);
		return () => clearTimeout(timer);
	}, [error]);

	const updateUser = async () => {
		setError('');
		if (password !== pass2) {
			setError('Passwords do not match');
			setOldPass('');
			return;
		}

		const data = {
			id: user.id,
			password: oldPass,
			newPass: password.length > 0 ? password : undefined,
			email: email !== '' ? email : undefined,
			fname: fname !== '' ? fname : undefined,
			lname: lname !== '' ? lname : undefined,
			dob: dob ? new Date(dob.toDateString()) : undefined,
		};
		await invoke('fix_user', data)
			.then((data) => {
				if (data !== null) {
					const user = data as User;
					setUser(user);
					if (user.email) localStorage.setItem('useremail', user.email);
					else localStorage.removeItem('useremail');
					if (user.fname) localStorage.setItem('userf', user.fname);
					else localStorage.removeItem('userf');
					if (user.lname) localStorage.setItem('userl', user.lname);
					else localStorage.removeItem('userl');
					if (user.dob) localStorage.setItem('dob', user.dob.toDateString());
					else localStorage.removeItem('dob');
					setError('User updated');
				}
				else setError('Incorrect password');
			})
			.catch((err) => setError(err))
			.finally(() => setOldPass(''))
	};

	const deleteUser = async () => {
		await invoke('remove_user', { id: user.id, password: oldPass })
			.then((resp) => {
				if (resp as boolean === false) { setError('Unable to delete user'); return }
				localStorage.removeItem(`${user.uname}.inst.status`);
				localStorage.removeItem(`${user.uname}.sync.s.date`);
				localStorage.removeItem(`${user.uname}.sync.t.date`);
				logout();
				navigate('/');
			})
			.catch((err) => setError(err))
			.finally(() => setOldPass(''));
	}
	const [confirmDelete, setConfirmDelete] = useState(false);

	const navigate = useNavigate();
	const [stateFinancial, setStateFinancial] = useState(true);

	return (
		<div className="page-root">
			<menu className="dynamic-menu">
				<div className="dynamic-menu-main">
					<button
						id={stateFinancial ? 'dynamic-menu-current' : undefined}
						onClick={() => setStateFinancial(true)}
					>
						<img src='/financial.svg'/>	Financial
					</button>
					<button
						id={!stateFinancial ? 'dynamic-menu-current' : undefined}
						onClick={() => setStateFinancial(false)}
					>
						<img src='/personal.svg'/> Personal
					</button>
				</div>

				<div className="dynamic-menu-main">
					<button
						onClick={() => {
							navigate('/');
							logout();
						}}
					>
						<img src='/logout.svg'/> Logout
					</button>
				</div>
			</menu>

			<div className="page-main">
				{stateFinancial ? (
					<div className="profile-personal">
						<ProfileLink user={user} setUser={setUser} refreshAcct={refreshAcct} refreshTrans={refreshTrans} />
					</div>
				) : (
					<div className="profile-personal">

						<div className='profile-card'>
							<menu>
								<label>Username: </label>
								<input type="text" placeholder="Username" value={user.uname} readOnly />
								<label>Recovery Email: </label>
								<input
									type="email"
									placeholder="(not implemented)"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>

								<label>Full Name: </label>
								<input
									type="text"
									placeholder="First name"
									value={fname}
									onChange={(e) => setFname(e.target.value)}
								/>
								<input
									type="text"
									placeholder="Last name"
									value={lname}
									onChange={(e) => setLname(e.target.value)}
								/>
								<label htmlFor="dob">Date of Birth: </label>
								<input
									id="dob"
									type="date"
									value={dob ? dob.toISOString().substring(0, 10) : undefined}
									onChange={(e) =>
										setDob(
											addDays(
												new Date(
													new Date(e.target.value).toUTCString().split(' ').slice(0, 4).join(' '),
												),
												0,
											),
										)
									}
								/>
							</menu>

							<menu>
								<label>Confirm Password: </label>
								<input
									type="password"
									placeholder="Current password"
									value={oldPass}
									onChange={(e) => setOldPass(e.target.value)}
								/>
								<label>Upate Password: </label>
								<input
									type="password"
									placeholder="New password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
								<input
									type="password"
									placeholder="Confirm password"
									value={pass2}
									onChange={(e) => setPass2(e.target.value)}
								/>

								<div>
									<button className='save-user' onClick={updateUser}>Save</button>

									<button onClick={() => setConfirmDelete(!confirmDelete)}>Delete User</button>
								</div>

								{ confirmDelete &&
									<div className='confirm-overlay'>
										<label>Are you sure you want to delete your user data and all associated accounts and transactions?</label>
										<input type='password' placeholder='Enter password' value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
										<button onClick={deleteUser} disabled={oldPass === ''}>Yes</button>
										<button onClick={() => setConfirmDelete(false)}>No</button>
									</div>
								}

								{error !== '' && <em>{error}</em>}
							</menu>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
