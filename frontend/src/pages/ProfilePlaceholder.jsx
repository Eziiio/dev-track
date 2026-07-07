import React from 'react';
import { User } from 'lucide-react';

function ProfilePlaceholder() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-2xl mx-auto space-y-4 shadow-sm mt-8">
      <div className="bg-primary-50 dark:bg-primary-950/30 text-primary-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-primary-100 dark:border-primary-800/40">
        <User size={32} />
      </div>
      <h2 className="font-display text-2xl font-bold">Profile Settings</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
        Update your name, avatar, and manage your account credentials. This feature is coming in **Phase 13: Profile & Settings**.
      </p>
    </div>
  );
}

export default ProfilePlaceholder;
