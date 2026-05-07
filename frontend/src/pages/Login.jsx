import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setServerError('');
      await login(data.username, data.password);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-rose-100 selection:text-rose-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-rose-600 rounded-2xl shadow-[0_8px_30px_rgb(225,29,72,0.3)] flex items-center justify-center transform transition-transform hover:scale-105">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-bold text-slate-900 tracking-tight">
          SI-WARAS
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-slate-500">
          Sistem Informasi Warasing Desa
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-[13px] font-medium border border-rose-100 flex items-center">
                {serverError}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Username</label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  {...register("username", { required: "Username is required" })}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white sm:text-[13px] transition-all duration-200 outline-none"
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && <p className="mt-1.5 text-[12px] font-medium text-rose-500">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative rounded-xl shadow-sm">
                <input
                  type="password"
                  {...register("password", { required: "Password is required" })}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-slate-900 bg-slate-50/50 hover:bg-white focus:bg-white sm:text-[13px] transition-all duration-200 outline-none"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1.5 text-[12px] font-medium text-rose-500">{errors.password.message}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-[14px] font-semibold text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-500/20 transition-all duration-200"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-8 flex justify-center gap-6 text-slate-400 border-t border-slate-100 pt-6">
            <div className="flex items-center text-[11px] font-medium tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Secure Access
            </div>
            <div className="flex items-center text-[11px] font-medium tracking-wide uppercase">
              <HeartPulse className="w-3.5 h-3.5 mr-1.5" /> Healthcare Standard
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
