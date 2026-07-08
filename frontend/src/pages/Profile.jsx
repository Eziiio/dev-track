import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, Lock, Check, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

// Zod schema matching backend constraints
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal(''))
}).refine((data) => {
  if (data.password && data.password.length < 6) return false;
  return true;
}, {
  message: "Password must be at least 6 characters",
  path: ["password"]
}).refine((data) => {
  if (data.password !== data.confirmPassword) return false;
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const avatarPresets = [
  { label: 'Initial', emoji: '' },
  { label: 'Rocket', emoji: '🚀' },
  { label: 'Coder', emoji: '💻' },
  { label: 'Fox', emoji: '🦊' },
  { label: 'Alien', emoji: '👾' },
  { label: 'Designer', emoji: '🎨' },
  { label: 'Scientist', emoji: '🧪' },
  { label: 'Panda', emoji: '🐼' },
  { label: 'Pizza', emoji: '🍕' },
  { label: 'Champion', emoji: '🏆' }
];

function Profile() {
  const { user, updateProfile } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  // Prepopulate form fields
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: ''
      });
      setSelectedAvatar(user.avatar || '');
    }
  }, [user, reset]);

  const onSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        avatar: selectedAvatar
      };

      // Only submit password if provided
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await updateProfile(payload);
      if (res.success) {
        toast.success('Profile settings updated successfully!');
        reset({
          name: formData.name,
          email: formData.email,
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      const apiErrorMsg = error.response?.data?.message || error.message || 'Update failed';
      toast.error(apiErrorMsg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner Profile Summary Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
        
        {/* Avatar Display */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-2xl bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-display font-extrabold flex items-center justify-center text-4xl border border-primary-200/20 select-none">
            {selectedAvatar ? selectedAvatar : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
          </div>
        </div>

        {/* User Info Details */}
        <div className="text-center md:text-left space-y-2">
          <h2 className="font-display text-2xl font-bold text-slate-800 dark:text-white flex flex-col sm:flex-row sm:items-center gap-2">
            {user?.name || 'User Profile'}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-primary-150">
              <Shield size={12} />
              {user?.role}
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{user?.email}</p>
          <p className="text-xs text-slate-400 dark:text-slate-550 font-bold">
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
          </p>
        </div>
      </section>

      {/* Main Settings Form Fields */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
          
          {/* Avatar presets grid */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-655 dark:text-slate-300">
              Choose Avatar Preset
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
              {avatarPresets.map((preset) => {
                const isSelected = selectedAvatar === preset.emoji;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSelectedAvatar(preset.emoji)}
                    className={`h-12 rounded-xl flex items-center justify-center text-xl font-bold border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-500 ring-2 ring-primary-500/20'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:bg-slate-100/50 dark:hover:bg-slate-850/50'
                    }`}
                    title={preset.label}
                  >
                    {preset.emoji ? (
                      preset.emoji
                    ) : (
                      <span className="text-xs text-slate-400 font-bold">None</span>
                    )}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 bg-primary-600 text-white rounded-full p-0.5 border border-white dark:border-slate-900">
                        <Check size={8} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <UserIcon size={16} />
                </span>
                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  disabled={isSubmitting}
                  {...register('name')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl outline-none transition-all duration-200 text-sm font-medium ${
                    errors.name
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  disabled={isSubmitting}
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl outline-none transition-all duration-200 text-sm font-medium ${
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-655 dark:text-slate-300" htmlFor="password">
                New Password <span className="text-xs text-slate-400 font-normal">(Leave empty to keep current)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  {...register('password')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl outline-none transition-all duration-200 text-sm font-medium ${
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-655 dark:text-slate-300" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  {...register('confirmPassword')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-xl outline-none transition-all duration-200 text-sm font-medium ${
                    errors.confirmPassword
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-semibold text-rose-500 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions Submit */}
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-955 font-semibold text-sm cursor-pointer shadow-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

        </form>
      </section>

    </div>
  );
}

export default Profile;
