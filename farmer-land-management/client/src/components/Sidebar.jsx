import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Farmers', path: '/farmers', icon: '👨‍🌾' },
    { name: 'Lands', path: '/lands', icon: '🌱' }, // ✅ The new link
    { name: 'Schemes', path: '/schemes', icon: '📜' },
    { name: 'Enrollments', path: '/enrollments', icon: '📝' },
  ];

  return (
    <div className="bg-green-900 text-white w-64 min-h-screen flex flex-col transition-all duration-300">
      
      {/* App Logo/Title */}
      <div className="p-6 border-b border-green-800 flex items-center gap-3">
        <span className="text-2xl">🌾</span>
        <h1 className="text-xl font-bold tracking-wide">AgriManager</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 transition-colors ${
                isActive 
                  ? 'bg-green-800 border-r-4 border-green-400 text-white' 
                  : 'text-green-100 hover:bg-green-800 hover:text-white'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-green-800">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-200 hover:text-white hover:bg-red-900/50 rounded transition-colors"
        >
          <span className="mr-3">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;