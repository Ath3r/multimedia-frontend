import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/auth-context';
import Login from './pages/Login/login';
import Dashboard from './pages/Dashboard/dashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
	const { user } = useContext(AuthContext);

	if (!user) {
		console.log('No user');
		return <Navigate to='/login' />;
	}

	return children;
};

// Main App Component
function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path='/login' element={<Login />} />
					<Route
						path='/dashboard'
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
					<Route path='/' element={<Navigate to='/dashboard' />} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
