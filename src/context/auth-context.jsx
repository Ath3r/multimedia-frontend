import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import authService from '../services/auth.service';
import { toast } from 'react-toastify';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const initAuth = async () => {
			if (authService.isAuthenticated()) {
				try {
					const userData = await authService.profile();
					setUser(userData);
				} catch (error) {
					console.error('Token validation failed:', error);
				}
			}
			setLoading(false);
		};

		initAuth();
	}, []);

	const login = async (credentials) => {
		try {
			await authService.login(credentials);
			await getProfile();

			return { success: true };
		} catch (error) {
			toast.error(error.message);
			console.error('Login error:', error);
			return { success: false, error: error?.message };
		}
	};

	const getProfile = async () => {
		const data = await authService.profile();
		setUser(data);
	};

	const signup = async (credentials) => {
		try {
			await authService.signup(credentials);
			await getProfile();
			return { success: true };
		} catch (error) {
			return { success: false, error: error.message };
		}
	};

	const logout = async () => {
		try {
			await authService.logout();
		} finally {
			setUser(null);
		}
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	const value = {
		user,
		login,
		logout,
		signup,
		isAuthenticated: authService.isAuthenticated,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
	children: PropTypes.node.isRequired,
};
