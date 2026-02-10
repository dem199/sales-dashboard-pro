import { createBrowserRouter } from 'react-router-dom';
import Signin from './components/Signin';
import Signup from './components/Signup';
import Header from './components/Header';
import Dashboard from './routes/Dashboard';
import RootRedirect from './routes/RootRedirect';
import ProtectedRoute from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/signin',
    element: <Signin />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Header />
        <Dashboard />
      </ProtectedRoute>
    ),
  },
]);