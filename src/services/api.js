import axios from 'axios';

const api = axios.create({
	baseURL: `${window.location.origin}/api/v1`,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor
api.interceptors.request.use(
	(config) => {
		if (config.url.includes('/auth/refresh')) {
			const token = localStorage.getItem('refreshToken');
			config.headers.Authorization = `Bearer ${token}`;
		} else {
			const accessToken = localStorage.getItem('accessToken');
			if (accessToken) {
				config.headers.Authorization = `Bearer ${accessToken}`;
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

// TODO: Fix this logic for refresh token
// api.interceptors.response.use(
// 	(response) => response,
// 	async (error) => {
// 		const originalRequest = error.config;

// 		// If error is not 401 or request already retried, reject
// 		if (error.response?.status !== 401 || originalRequest._retry) {
// 			return Promise.reject(error);
// 		}

// 		if (isRefreshing) {
// 			// If token refresh is in progress, queue the request
// 			return new Promise((resolve, reject) => {
// 				failedQueue.push({ resolve, reject });
// 			})
// 				.then((token) => {
// 					originalRequest.headers.Authorization = `Bearer ${token}`;
// 					return api(originalRequest);
// 				})
// 				.catch((err) => Promise.reject(err));
// 		}

// 		originalRequest._retry = true;
// 		isRefreshing = true;

// 		try {
// 			const { accessToken } = await axios.post('/auth/refresh');
// 			processQueue(null, accessToken);
// 			originalRequest.headers.Authorization = `Bearer ${accessToken}`;
// 			return api(originalRequest);
// 		} catch (refreshError) {
// 			processQueue(refreshError, null);
// 			// If refresh token fails, redirect to login
// 			window.location.href = '/login';
// 			return Promise.reject(refreshError);
// 		} finally {
// 			isRefreshing = false;
// 		}
// 	}
// );

export default api;
