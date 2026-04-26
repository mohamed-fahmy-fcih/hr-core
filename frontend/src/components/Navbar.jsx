import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { LogOut, LayoutDashboard, ShieldCheck, User, Settings } from 'lucide-react';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-2">
        <div className="bg-primary-600 p-2 rounded-lg">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">HR-Core</span>
      </div>

      <div className="flex items-center space-x-6">
        <Link to="/dashboard" className="flex items-center space-x-1 text-slate-600 hover:text-primary-600 transition-colors">
          <LayoutDashboard size={18} />
          <span className="font-medium">Dashboard</span>
        </Link>
        
        {user?.role === 'admin' && (
          <>
            <Link to="/admin" className="flex items-center space-x-1 text-slate-600 hover:text-primary-600 transition-colors">
              <ShieldCheck size={18} />
              <span className="font-medium">Admin Panel</span>
            </Link>
            <Link to="/skills-management" className="flex items-center space-x-1 text-slate-600 hover:text-primary-600 transition-colors">
              <Settings size={18} />
              <span className="font-medium">Skills</span>
            </Link>
          </>
        )}

        <div className="h-6 w-px bg-slate-200"></div>

        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800">{user?.fullName}</span>
            <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
