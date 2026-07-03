import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

import { useUser } from "../../contexts/user";

import useUserLogin from "../../hooks/useUserLogin";

import style from "./auth.module.scss";


export default function Auth() {
	const { user } = useUser();

	if(!user)
		return <Login />;

	return <LoggedIn />;
}

function Login() {
	const { setUser } = useUser();

	const refLogin = useRef<HTMLDialogElement | null>(null);

	const onClick = (event: React.MouseEvent) => {
		event.stopPropagation();
		refLogin.current?.showModal();
	};

	const hide = () => {
		refLogin.current?.close();
	};

	const userLogin = useUserLogin();

	const onLogin = (event: React.SubmitEvent) => {
		event.preventDefault();
		const username = event.target.username.value.trim();
		const password = event.target.password.value;
		if(!username || !password) {
			toast.error("Заполните все поля");
			return;
		}

		userLogin.mutate({ username, password }, {
			onSuccess: data => {
				localStorage.setItem("ns_token", data.token.access_token);
				localStorage.setItem("ns_user", JSON.stringify(data.user));
				setUser(data.user);
			},
		});
	};

	useEffect(() => {
		function handleClick(event: MouseEvent) {
			if(refLogin.current?.open) {
				const rect = refLogin.current.getBoundingClientRect();
				const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
					rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
				if(!isInDialog)
					hide();
			}
		}
		document.addEventListener("click", handleClick);

		return () => {
			document.removeEventListener("click", handleClick);
		};
	}, []);

	return (
		<div>
			<button className="button" onClick={ onClick }>Войти</button>
			<dialog ref={ refLogin }>
				<form className={ style.login } onSubmit={ onLogin }>
					<div className="row">
						<label htmlFor="username">Имя</label>
						<input type="text" name="username" id="username" />
					</div>
					<div className="row">
						<label htmlFor="password">Пароль</label>
						<input type="password" name="password" id="password" />
					</div>
					<div className="row">
						<button className="button" type="submit" disabled={ userLogin.isPending }>Войти</button>
						<button className="button" type="reset" disabled={ userLogin.isPending } onClick={ hide }>Отмена</button>

					</div>
				</form>
			</dialog>
		</div>
	);
}

function LoggedIn() {
	const { user, setUser } = useUser();
	const refLogin = useRef<HTMLDialogElement | null>(null);

	const onClick = (event: React.MouseEvent) => {
		event.stopPropagation();
		refLogin.current?.showModal();
	};

	const hide = () => {
		refLogin.current?.close();
	};

	const onLogout = () => {
		setUser(null);
		localStorage.removeItem("ns_token");
		localStorage.removeItem("ns_user");
	};

	useEffect(() => {
		function handleClick(event: MouseEvent) {
			if(refLogin.current?.open) {
				const rect = refLogin.current.getBoundingClientRect();
				const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
					rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
				if(!isInDialog)
					hide();
			}
		}
		document.addEventListener("click", handleClick);

		return () => {
			document.removeEventListener("click", handleClick);
		};
	}, []);

	if(!user)
		return;

	return (
		<div>
			<button className="button" onClick={ onClick }>{ user.username } (Меню)</button>
			<dialog ref={ refLogin }>
				<button className="button" type="button" onClick={ onLogout }>Выйти</button>
			</dialog>
		</div>
	);
}