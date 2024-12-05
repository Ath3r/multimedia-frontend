import api from './api';

const handleError = (error) => {
	const message =
		error.response?.data?.message ||
		error.message ||
		'An unexpected error occurred';
	return new Error(message);
};

const setTokens = (tokens) => {
	if (tokens.accessToken) {
		localStorage.setItem('accessToken', tokens.accessToken);
	}
	if (tokens.refreshToken) {
		localStorage.setItem('refreshToken', tokens.refreshToken);
	}
};

const clearTokens = () => {
	localStorage.removeItem('accessToken');
	localStorage.removeItem('refreshToken');
};

const authService = {
	async login(credentials) {
		try {
			const response = await api.post('/auth/login', credentials);
			if (response.data.accessToken) {
				setTokens(response.data);
			}
			return response.data;
		} catch (error) {
			throw handleError(error);
		}
	},

	async logout() {
		try {
			const refreshToken = localStorage.getItem('refreshToken');
			await api.post('/auth/logout', { refreshToken });
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			clearTokens();
		}
	},

	async signup(credentials) {
		try {
			const response = await api.post('/auth/signup', credentials);
			if (response.data.accessToken) {
				setTokens(response.data);
			}
			return response.data;
		} catch (error) {
			throw handleError(error);
		}
	},

	async profile() {
		try {
			const response = await api.get('/user/me');
			return response.data;
		} catch (error) {
			throw handleError(error);
		}
	},

	async refreshToken() {
		try {
			const refreshToken = localStorage.getItem('refreshToken');
			if (!refreshToken) {
				throw new Error('No refresh token available');
			}

			const response = await api.post('/auth/refresh');
			if (response.data.accessToken) {
				setTokens(response.data);
			}
			return response.data;
		} catch (error) {
			clearTokens();
			throw handleError(error);
		}
	},

	getTokens() {
		return {
			accessToken: localStorage.getItem('accessToken'),
			refreshToken: localStorage.getItem('refreshToken'),
		};
	},

	isAuthenticated() {
		return true;
	},
};

export default authService;
