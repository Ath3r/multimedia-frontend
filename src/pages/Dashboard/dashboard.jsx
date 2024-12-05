import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/auth-context';
import fileService from '../../services/file.service';
import {
	FiFile,
	FiUpload,
	FiTrash2,
	FiShare2,
	FiDownload,
	FiMove,
	FiTag,
	FiEye,
} from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
	const { user, logout } = useContext(AuthContext);
	const [files, setFiles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [searchQuery, setSearchQuery] = useState('');
	const [isDraggingOver, setIsDraggingOver] = useState(false);

	useEffect(() => {
		loadFiles();
	}, [searchQuery]);

	const loadFiles = async () => {
		try {
			const data = await fileService.listFiles(searchQuery);
			// Ensure each file has a tags property
			const filesWithTags = data.map((file) => ({
				...file,
				tags: file.tags || [], // Default to empty array if no tags
			}));
			setFiles(filesWithTags);
		} catch (error) {
			console.error('Error loading files:', error);
			toast.error('Failed to load files');
		} finally {
			setLoading(false);
		}
	};

	const handleFileUpload = async (event) => {
		const files = Array.from(event.target.files);
		if (files.length === 0) return;

		const uploadPromises = files.map(async (file) => {
			try {
				setUploadProgress(0);
				const tagsStr = prompt('Enter tags (comma separated):');
				if (!tagsStr) return;
				await fileService.uploadFile(file, tagsStr);
				toast.success(`Successfully uploaded ${file.name}`);
			} catch (error) {
				console.error(`Error uploading ${file.name}:`, error);
				toast.error(`Failed to upload ${file.name}`);
			}
		});

		await Promise.all(uploadPromises);
		loadFiles();
	};

	const handleFileDrop = async (event) => {
		event.preventDefault();
		setIsDraggingOver(false);

		const droppedFiles = Array.from(event.dataTransfer.files);
		const uploadPromises = droppedFiles.map(async (file) => {
			try {
				const tagsStr = prompt('Enter tags (comma separated):');
				if (!tagsStr) return;

				const tags = tagsStr
					.split(',')
					.map((tag) => tag.trim())
					.filter((tag) => tag);

				const uploadedFile = await fileService.uploadFile(file);
				await fileService.updateTags(uploadedFile.id, tags);
				toast.success(`Successfully uploaded ${file.name}`);
			} catch (error) {
				console.error(`Error uploading ${file.name}:`, error);
				toast.error(`Failed to upload ${file.name}`);
			}
		});

		await Promise.all(uploadPromises);
		loadFiles();
	};

	const handleDragOver = (event) => {
		event.preventDefault();
		setIsDraggingOver(true);
	};

	const handleDragLeave = () => {
		setIsDraggingOver(false);
	};

	const handleDelete = async (fileId, fileName) => {
		if (!window.confirm('Are you sure you want to delete this item?')) return;

		try {
			await fileService.deleteFile(fileId);
			toast.success(`Successfully deleted ${fileName}`);
			loadFiles();
		} catch (error) {
			console.error('Delete error:', error);
			toast.error(`Failed to delete ${fileName}`);
		}
	};

	const handleDownload = async (fileId, fileName) => {
		try {
			const blob = await fileService.downloadFile(fileId);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			toast.success(`Successfully downloaded ${fileName}`);
		} catch (error) {
			console.error('Download error:', error);
			toast.error(`Failed to download ${fileName}`);
		}
	};

	const handleShare = async (file) => {
		try {
			const url = `${window.location.origin}/api/v1/file/${file.id}/view`;
			await navigator.clipboard.writeText(url);
			toast.success('Public link copied to clipboard!', {
				onClick: () => window.open(url, '_blank'),
			});
		} catch (error) {
			console.error('Share error:', error);
			toast.error(`Failed to generate public link for ${file.name}`);
		}
	};

	const handleTags = async (fileId, currentTags = []) => {
		const tagsStr = prompt(
			'Enter tags (comma separated):',
			currentTags.join(', ')
		);
		if (!tagsStr) return;

		const newTags = tagsStr
			.split(',')
			.map((tag) => tag.trim())
			.filter((tag) => tag);

		try {
			await fileService.updateTags(fileId, newTags);
			toast.success('Tags updated successfully');
			loadFiles();
		} catch (error) {
			console.error('Tags update error:', error);
			toast.error('Failed to update tags');
		}
	};

	return (
		<div className='min-h-screen bg-gray-100'>
			<ToastContainer
				position='bottom-right'
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme='colored'
			/>
			<nav className='bg-white shadow-md p-4'>
				<div className='max-w-7xl mx-auto flex justify-between items-center'>
					<h1 className='text-xl font-bold'>My Drive</h1>
					<div className='flex items-center gap-4'>
						<span>Welcome, {user?.email}!</span>
						<button
							onClick={logout}
							className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'>
							Logout
						</button>
					</div>
				</div>
			</nav>

			<div className='max-w-7xl mx-auto p-6'>
				<div className='mb-6 flex justify-between items-center'>
					<div className='flex gap-4'>
						<label className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer'>
							<FiUpload className='inline mr-2' />
							Upload Files
							<input
								type='file'
								className='hidden'
								onChange={handleFileUpload}
								multiple
							/>
						</label>
					</div>
					<input
						type='text'
						placeholder='Search files...'
						className='px-4 py-2 border rounded-lg w-64'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				{/* Drop Zone Area */}
				<div
					className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
						isDraggingOver
							? 'border-blue-500 bg-blue-50'
							: 'border-gray-300 hover:border-gray-400'
					}`}
					onDrop={handleFileDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}>
					<FiUpload className='mx-auto text-4xl mb-2 text-gray-400' />
					<p className='text-gray-600'>Drag and drop files here to upload</p>
					<p className='text-sm text-gray-500 mt-1'>
						or click the Upload Files button above
					</p>
				</div>

				<div className='bg-white rounded-lg shadow'>
					<div className='p-4 border-b'>
						<h2 className='text-lg font-semibold flex items-center'>
							<FiMove className='mr-2' />
							Files (drag to reorder)
						</h2>
					</div>

					<DragDropContext
						onDragEnd={async (result) => {
							const { destination, source } = result;
							if (!destination) return;
							if (
								destination.droppableId === source.droppableId &&
								destination.index === source.index
							) {
								return;
							}

							try {
								// Reorder within the same list
								const newFiles = Array.from(files);
								const [removed] = newFiles.splice(source.index, 1);
								newFiles.splice(destination.index, 0, removed);
								setFiles(newFiles);
								toast.success('File order updated');
							} catch (error) {
								console.error('Reorder error:', error);
								toast.error('Failed to update file order');
								// Reload files to ensure consistency
								loadFiles();
							}
						}}>
						<Droppable droppableId='files' direction='vertical'>
							{(provided, snapshot) => (
								<div
									ref={provided.innerRef}
									{...provided.droppableProps}
									className={`divide-y ${
										snapshot.isDraggingOver ? 'bg-gray-50' : ''
									}`}>
									{files.map((file, index) => (
										<Draggable
											key={file.id}
											draggableId={file.id}
											index={index}>
											{(provided, snapshot) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													className={`p-4 transition-colors ${
														snapshot.isDragging
															? 'bg-blue-50 shadow-lg'
															: 'hover:bg-gray-50'
													}`}>
													<div className='flex items-center justify-between'>
														<div
															{...provided.dragHandleProps}
															className='flex items-center flex-1 cursor-grab active:cursor-grabbing'>
															<FiFile className='text-gray-500 text-xl mr-3' />
															<div>
																<h3 className='font-medium'>{file.name}</h3>
																<div className='flex items-center gap-2'>
																	<p className='text-sm text-gray-500'>
																		{file.size}
																	</p>
																	<div className='flex items-center text-sm text-gray-500'>
																		<FiEye className='mr-1' />
																		{file.views || 0} views
																	</div>
																</div>
																{file.tags && file.tags.length > 0 && (
																	<div className='flex flex-wrap gap-1 mt-1'>
																		{file.tags.map((tag, i) => (
																			<span
																				key={i}
																				className='bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded'>
																				{tag}
																			</span>
																		))}
																	</div>
																)}
															</div>
														</div>
														<div className='flex gap-3'>
															<button
																onClick={() =>
																	handleDownload(file.id, file.name)
																}
																className='p-2 hover:bg-gray-100 rounded-full transition-colors'
																title='Download'>
																<FiDownload />
															</button>
															<button
																onClick={() => handleTags(file.id, file.tags)}
																className='p-2 hover:bg-gray-100 rounded-full transition-colors'
																title='Edit tags'>
																<FiTag />
															</button>
															<button
																onClick={() => handleShare(file)}
																className='p-2 hover:bg-gray-100 rounded-full transition-colors'
																title='Get public link'>
																<FiShare2 />
															</button>
															<button
																onClick={() => handleDelete(file.id, file.name)}
																className='p-2 hover:bg-gray-100 rounded-full transition-colors text-red-500'
																title='Delete'>
																<FiTrash2 />
															</button>
														</div>
													</div>
												</div>
											)}
										</Draggable>
									))}
									{provided.placeholder}
									{files.length === 0 && !loading && (
										<div className='p-8 text-center text-gray-500'>
											No files yet. Upload some files to get started!
										</div>
									)}
								</div>
							)}
						</Droppable>
					</DragDropContext>
				</div>

				{uploadProgress > 0 && uploadProgress < 100 && (
					<div className='fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg'>
						<div className='text-sm font-medium mb-2'>Uploading...</div>
						<div className='w-64 h-2 bg-gray-200 rounded-full'>
							<div
								className='h-full bg-blue-500 rounded-full'
								style={{ width: `${uploadProgress}%` }}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
