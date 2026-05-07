import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Settings, LogOut, Activity, Menu, X, HelpCircle, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(true);

  const getBasePath = (role) => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'HEALTH_WORKER') return '/petugas';
    if (role === 'VILLAGE_HEAD') return '/kepala-desa';
    return '';
  };
  const basePath = getBasePath(user?.role);

  const navItems = [
    { name: 'Dashboard', path: `${basePath}/dashboard`, icon: Home },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'HEALTH_WORKER') {
    navItems.push({ name: 'Patients', path: `${basePath}/patients`, icon: Users });
    navItems.push({ name: 'Medical Records', path: `${basePath}/records`, icon: Activity });
  }

  navItems.push({ name: 'Reports', path: `${basePath}/reports`, icon: FileText });

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'Settings', path: `${basePath}/settings`, icon: Settings });
  }

  const toggleSidebar = () => setIsOpen(!isOpen);

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center justify-between px-6 border-b border-transparent">
        <div className="flex items-center">
          <div className="bg-rose-500 text-white p-1.5 rounded-lg mr-3 shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-[17px] font-bold text-slate-800 tracking-tight">
            SI-WARAS
          </span>
        </div>
        {/* Mobile close button inside sidebar */}
        <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={toggleSidebar}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Menu</p>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out group relative text-[13px] ${
                isActive
                  ? 'bg-rose-50/50 text-rose-700 font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-[3px] before:bg-rose-500 before:rounded-r-full'
                  : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-rose-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 flex flex-col gap-2">
        {showSupport && (
          <div className="bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl p-4 text-white shadow-soft relative overflow-hidden mb-2">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full pointer-events-none"></div>
            <div className="relative z-10 flex items-center justify-between mb-3">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              <button onClick={() => setShowSupport(false)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h4 className="font-semibold text-[13px] relative z-10">Need Support?</h4>
            <p className="text-[11px] text-rose-100 mt-1 mb-4 relative z-10 leading-relaxed">
              Contact administrator for system assistance or premium features.
            </p>
            <button className="w-full py-2 bg-white/10 hover:bg-white text-white hover:text-rose-700 text-[11px] font-bold rounded-lg transition-colors border border-white/20 hover:border-transparent relative z-10">
              Contact Admin
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2.5 text-[13px] text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors duration-200 group font-medium"
          >
            <LogOut className="w-4 h-4 mr-3 text-slate-400 group-hover:text-rose-500 transition-colors" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed bottom-4 right-4 z-50 bg-rose-600 text-white p-3 rounded-full shadow-lg hover:bg-rose-700 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[260px] bg-white border-r border-slate-100 h-screen sticky top-0 flex-col z-10">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="md:hidden fixed inset-y-0 left-0 w-[260px] bg-white shadow-2xl flex flex-col z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
