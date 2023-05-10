import React from 'react';
import { useState } from 'react';
import './App.css'
import loadable from './helper/loadable';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { token } from './hooks/useAuth';
const Login = loadable(() => import('./pages/authen/login'));
const Home = loadable(() => import('./pages/home/index'));
function App() {

  const AuthProvider = ({ children }: any) => {
    const AuthContext = React.createContext(null);
    const [token, setToken] = useState(null);

    const handleLogin = async () => {
      // const token = await fakeAuth();

      // setToken(token);
    };

    const handleLogout = () => {
      setToken(null);
    };

    const value: any = {
      token,
      onLogin: handleLogin,
      onLogout: handleLogout,
    };

    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  };

  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
