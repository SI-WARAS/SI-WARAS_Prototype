import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, Search, Sun, Moon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['globalSearch', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const { data } = await api.get(`/patients?search=${searchTerm}&limit=5`);
      return data.patients || [];
    },
    enabled: searchTerm.length > 0
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeToggle = () => {
    toast('Dark mode is not available in the current elegant theme.', { icon: '✨' });
  };

  const handleResultClick = (id) => {
    setShowSearch(false);
    setSearchTerm('');
    navigate(`/patients/${id}`);
  };

  return (
    <header className="h-20 bg-white border-b border-transparent flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
      <div className="flex items-center flex-1">
        <div className="relative hidden sm:block w-72" ref={searchRef}>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search patients..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            className="w-full pl-10 pr-12 py-2 bg-[#F8F9FB] border border-transparent focus:border-slate-200 focus:bg-white rounded-full text-[13px] text-slate-600 outline-none transition-all placeholder:text-slate-400"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <span className="text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">⌘K</span>
          </div>

          <AnimatePresence>
            {showSearch && searchTerm && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50"
              >
                {isLoading ? (
                  <div className="p-4 text-center text-[12px] text-slate-500 animate-pulse">Searching...</div>
                ) : searchResults?.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {searchResults.map(patient => (
                      <button 
                        key={patient.id}
                        onClick={() => handleResultClick(patient.id)}
                        className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-50 flex items-center gap-3 transition-colors outline-none"
                      >
                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-[11px]">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-800">{patient.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">ID: {patient.id.substring(0,8)}...</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-[12px] text-slate-500">No patients found.</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Mobile date fallback */}
        <p className="text-[13px] font-medium text-slate-500 sm:hidden">
          {format(new Date(), 'dd MMM yyyy')}
        </p>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        <button onClick={handleThemeToggle} className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors outline-none">
          <Sun className="w-4 h-4" />
        </button>
        
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifications(!showNotifications)} className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors relative outline-none">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-[13px] font-bold text-slate-800">Notifications</h3>
                  <button className="text-[11px] font-medium text-rose-600 hover:text-rose-700 outline-none">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
                  <div className="p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer flex gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[12px] text-slate-800"><span className="font-bold">Budi Santoso</span> has high blood pressure reading (160/95).</p>
                      <p className="text-[10px] text-slate-400 mt-1">10 minutes ago</p>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[12px] text-slate-800">New patient <span className="font-bold">Siti Aminah</span> registered.</p>
                      <p className="text-[10px] text-slate-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>
        <Link to="/settings" className="flex items-center space-x-3 cursor-pointer group pl-1 outline-none">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-semibold text-slate-800 leading-tight group-hover:text-rose-600 transition-colors">{user?.name || 'Administrator'}</p>
            <p className="text-[11px] font-medium text-slate-400">{user?.role?.replace('_', ' ') || 'SYSTEM ADMIN'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm border border-rose-100 group-hover:shadow-md transition-all">
            <User className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
