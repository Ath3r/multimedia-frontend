import api from './api';

const fileService = {
	async uploadFile(file, tags = []) {
		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('tags', tags);
			const response = await api.post('/file', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				onUploadProgress: (progressEvent) => {
					const percentCompleted = Math.round(
						(progressEvent.loaded * 100) / progressEvent.total
					);
					console.log(`Upload Progress: ${percentCompleted}%`);
				},
			});
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	},

	async listFiles(query = '') {
		try {
			const response = await api.get(`/file?query=${query}`);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	},

	async deleteFile(fileId) {
		try {
			await api.delete(`/file/${fileId}`);
		} catch (error) {
			throw this.handleError(error);
		}
	},

	async downloadFile(fileId) {
		try {
			const response = await api.get(`/file/${fileId}/download`, {
				responseType: 'blob',
			});
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	},

	async updateTags(fileId, tags = []) {
		try {
			await api.patch(`/file/${fileId}/tags`, { tags });
		} catch (error) {
			throw this.handleError(error);
		}
	},

	async renameFile(fileId, newName) {
		try {
			const response = await api.patch(`/file/${fileId}/rename`, {
				newName,
			});
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	},

	handleError(error) {
		const message =
			error.response?.data?.message ||
			error.message ||
			'An unexpected error occurred';
		return new Error(message);
	},
};

export default fileService;
