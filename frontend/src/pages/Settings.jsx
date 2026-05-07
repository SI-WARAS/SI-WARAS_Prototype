import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Bell, Shield } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings updated successfully!');
    }, 1000);
  };

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-[13px] bg-white hover:bg-slate-50 transition-all duration-200 outline-none";
  const labelClass = "block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-12"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Settings</h1>
        <p className="text-[13px] text-slate-500 mt-1">Manage your account preferences and system settings.</p>
      </div>

      <div className="bg-white rounded-[20px] shadow-soft border border-slate-100/50 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Settings Nav */}
          <div className="w-full md:w-64 bg-slate-50/50 border-r border-slate-100/50 p-6">
            <nav className="space-y-1">
              <button className="w-full flex items-center px-4 py-2.5 text-[13px] font-semibold bg-white text-rose-600 rounded-lg shadow-sm border border-slate-100">
                <User className="w-4 h-4 mr-3" /> Profile
              </button>
              <button className="w-full flex items-center px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Lock className="w-4 h-4 mr-3" /> Security
              </button>
              <button className="w-full flex items-center px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-4 h-4 mr-3" /> Notifications
              </button>
              {user?.role === 'ADMIN' && (
                <button className="w-full flex items-center px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <Shield className="w-4 h-4 mr-3" /> System Preferences
                </button>
              )}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Profile Information</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-3xl">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <button type="button" className="px-4 py-2 text-[13px] font-medium bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm outline-none">
                    Change Avatar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" defaultValue={user?.name} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input type="email" defaultValue={user?.email} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <input type="text" value={user?.role || 'Admin'} disabled className={`${inputClass} bg-slate-50 text-slate-400 cursor-not-allowed`} />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100/50 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-6 py-2.5 text-[13px] font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-sm outline-none disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
