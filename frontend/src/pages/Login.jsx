import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Define Zod schema for input validation
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Route to redirect to after successful login
  const from = location.state?.from?.pathname || '/';

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Welcome back to DevTrack!');
    } catch (error) {
      const apiErrorMsg = error.response?.data?.message || error.message || 'Login failed';
      toast.error(apiErrorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-primary-600 text-white p-3 rounded-2xl shadow-lg shadow-primary-500/20">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Sign in to manage your workspace and tasks
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled={isSubmitting}
                {...register('email')}
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl outline-none transition-all duration-200 text-sm font-medium ${
                  errors.email
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-semibold text-rose-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isSubmitting}
                {...register('password')}
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl outline-none transition-all duration-200 text-sm font-medium ${
                  errors.password
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-xs font-semibold text-rose-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-semibold py-3 px-4 rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Signing you in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Redirect */}
        <div className="text-center pt-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-500 font-bold underline transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
