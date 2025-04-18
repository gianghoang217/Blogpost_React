import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsLoggedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setUserName(user?.name || user?.username || 'there');
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error fetching current user:', error);
        setUserName('there'); // fallback
        setIsLoggedIn(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="dashboard">
<header className="dashboard-header">
  <nav className="dashboard-nav">
    <div className="nav-left">
      <ul>
        <li>
          <Link to="/home">Home</Link>
        </li>
        <li>
          <Link to="/posts">👋 Hi, {userName}! Let's write!</Link>
        </li>
      </ul>
    </div>
    <div className="nav-right">
              {isLoggedIn ? (
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <button className="login-button" onClick={() => navigate('/login')}>
                Login
              </button>
            )}
    </div>
  </nav>
</header>
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
