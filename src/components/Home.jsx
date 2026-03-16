import React, { useState } from 'react';
import Login from '../auth/Login';
import StaffAdvisorDashboard from '../roles/staffAdvisor/StaffAdvisorDashboard';
import PTADashboard from '../roles/pta/PTADashboard';
import StudentDashboard from '../roles/student/StudentDashboard';

function Home() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const renderDashboard = () => {
    if (!user) return <Login onLogin={handleLogin} />;

    switch (user.role) {
      case 'pta':
        return <PTADashboard user={user} onLogout={handleLogout} />;
      case 'staff_advisor':
        return <StaffAdvisorDashboard user={user} onLogout={handleLogout} />;
      case 'student':
        return <StudentDashboard user={user} onLogout={handleLogout} />;
      default:
        return <StaffAdvisorDashboard user={user} onLogout={handleLogout} />; // Default to staff advisor for safety
    }
  };

  return (
    <>
      {renderDashboard()}
    </>
  );
}

export default Home;
