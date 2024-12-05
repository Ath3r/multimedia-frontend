import { useContext, useState } from 'react';
import { AuthContext } from '../../context/auth-context';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

// Login Component
const Login = () => {
	const { login, signup } = useContext(AuthContext);
	const navigate = useNavigate();
	const [isSignup, setIsSignup] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm();

	const handleSignup = async (data) => {
		setError('');
		setLoading(true);
		try {
			const result = await signup(data);
			if (result.success) {
				navigate('/dashboard');
			} else {
				setError(result.error);
			}
		} catch (err) {
			setError(err.message || 'An unexpected error occurred');
		} finally {
			setLoading(false);
		}
	};

	const handleLogin = async (data) => {
		setError('');
		setLoading(true);
		try {
			const result = await login(data);
			if (result.success) {
				navigate('/dashboard');
			} else {
				setError(result.error);
			}
		} catch (err) {
			setError(err.message || 'An unexpected error occurred');
		} finally {
			setLoading(false);
		}
	};

	const onSubmit = async (data) => {
		if (isSignup) {
			await handleSignup(data);
		} else {
			await handleLogin(data);
		}
	};

	return (
		<div className='flex justify-center items-center h-screen bg-gray-100'>
			<div className='bg-white p-8 rounded-lg shadow-md w-96'>
				<h2 className='text-2xl font-bold mb-6 text-center'>
					{isSignup ? 'Sign Up' : 'Sign In'}
				</h2>
				{error && (
					<div className='mb-4 p-2 bg-red-100 text-red-700 rounded'>
						{error}
					</div>
				)}
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className='mb-4'>
						<input
							type='email'
							placeholder='Email'
							{...register('email', {
								required: 'Email is required',
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: 'Invalid email address',
								},
							})}
							className='w-full p-2 border rounded'
							disabled={loading}
						/>
						{errors.email && (
							<p className='mt-1 text-sm text-red-600'>
								{errors.email.message}
							</p>
						)}
					</div>
					<div className='mb-4'>
						<input
							type='password'
							placeholder='Password'
							{...register('password', {
								required: 'Password is required',
								minLength: {
									value: 6,
									message: 'Password must be at least 6 characters',
								},
							})}
							className='w-full p-2 border rounded'
							disabled={loading}
						/>
						{errors.password && (
							<p className='mt-1 text-sm text-red-600'>
								{errors.password.message}
							</p>
						)}
					</div>
					<button
						type='submit'
						className='w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300'
						disabled={loading}>
						{loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Sign In'}
					</button>
				</form>
				<p className='mt-4 text-center text-sm text-gray-600'>
					{isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
					<button
						onClick={() => {
							setIsSignup(!isSignup);
							setError('');
							reset();
						}}
						className='text-blue-500 hover:text-blue-600'
						disabled={loading}>
						{isSignup ? 'Sign In' : 'Sign Up'}
					</button>
				</p>
			</div>
		</div>
	);
};

export default Login;
