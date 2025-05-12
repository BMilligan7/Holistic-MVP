import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Logout failed:", error);
      // Optionally, display an error message to the user
    }
    navigate('/login'); // Navigate to login after attempting logout
  };

  return (
    <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <div className="logo">
        <Link to="/">App Name</Link>
      </div>

      <div className="nav-links" style={{ display: 'flex', gap: '1rem' }}>
        {user ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/settings">Settings</Link>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
} 