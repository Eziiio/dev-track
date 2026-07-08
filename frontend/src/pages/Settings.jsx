import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Monitor, Globe, Check, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

function Settings() {
  const [theme, setTheme] = useState('light');
  const [sidebarLayout, setSidebarLayout] = useState('expanded');
  const [language, setLanguage] = useState('en');
  
  // Notification States
  const [notifyTaskAssign, setNotifyTaskAssign] = useState(true);
  const [notifyProjectActivity, setNotifyProjectActivity] = useState(false);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(true);

  // Sync settings with localStorage on mount
  useEffect(() => {
    // Theme
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Sidebar
    const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    setSidebarLayout(collapsed ? 'collapsed' : 'expanded');

    // Language
    const lang = localStorage.getItem('pref-lang') || 'en';
    setLanguage(lang);

    // Notifications
    setNotifyTaskAssign(localStorage.getItem('notify-task-assign') !== 'false');
    setNotifyProjectActivity(localStorage.getItem('notify-project-activity') === 'true');
    setNotifyWeeklyDigest(localStorage.getItem('notify-weekly-digest') !== 'false');
  }, []);

  const handleThemeChange = (newTheme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    toast.success(`Theme switched to ${newTheme} mode!`);
  };

  const handleSidebarChange = (e) => {
    const value = e.target.value;
    setSidebarLayout(value);
    localStorage.setItem('sidebar-collapsed', value === 'collapsed' ? 'true' : 'false');
    toast.success(`Sidebar layout set to ${value}!`);
  };

  const handleLanguageChange = (e) => {
    const value = e.target.value;
    setLanguage(value);
    localStorage.setItem('pref-lang', value);
    toast.success(`Language changed!`);
  };

  const toggleNotification = (key, value, setter) => {
    setter(value);
    localStorage.setItem(key, value ? 'true' : 'false');
    toast.success('Notification preferences updated!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Visual Header */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
        <div className="bg-primary-50 dark:bg-primary-950/30 text-primary-500 p-3 rounded-xl border border-primary-100 dark:border-primary-800/40 shrink-0">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-slate-850 dark:text-white">Workspace Preferences</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Customize notification channels, sidebar defaults, languages, and theme displays.
          </p>
        </div>
      </section>

      {/* Settings Grid Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Card: Notifications settings */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between h-[390px]">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
              <Bell size={16} className="text-primary-500" />
              Notification Settings
            </h3>
            
            <div className="space-y-5 mt-5">
              {/* Notification 1 */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="space-y-0.5 max-w-[80%]">
                  <p className="font-bold text-slate-700 dark:text-slate-250">Task Assignments</p>
                  <p className="text-[10px] sm:text-xs text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
                    Receive immediate email alerts when a task is assigned to your profile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('notify-task-assign', !notifyTaskAssign, setNotifyTaskAssign)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    notifyTaskAssign ? 'bg-primary-600' : 'bg-slate-250 dark:bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      notifyTaskAssign ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Notification 2 */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="space-y-0.5 max-w-[80%]">
                  <p className="font-bold text-slate-700 dark:text-slate-250">Collaborator Activity</p>
                  <p className="text-[10px] sm:text-xs text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
                    Get weekly summaries of logs, creations, and edits made on active projects.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('notify-project-activity', !notifyProjectActivity, setNotifyProjectActivity)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    notifyProjectActivity ? 'bg-primary-600' : 'bg-slate-250 dark:bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      notifyProjectActivity ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Notification 3 */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="space-y-0.5 max-w-[80%]">
                  <p className="font-bold text-slate-700 dark:text-slate-250">Weekly Digest Reports</p>
                  <p className="text-[10px] sm:text-xs text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
                    Receive automated summary metrics and project status digests on Mondays.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification('notify-weekly-digest', !notifyWeeklyDigest, setNotifyWeeklyDigest)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    notifyWeeklyDigest ? 'bg-primary-600' : 'bg-slate-250 dark:bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      notifyWeeklyDigest ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 italic">Auto-saves preferences dynamically.</p>
        </section>

        {/* Right Card: Interface layout settings */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between h-[390px]">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
              <Monitor size={16} className="text-primary-500" />
              Interface Settings
            </h3>

            <div className="space-y-4 mt-5">
              {/* Default Sidebar */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="font-bold text-slate-750 dark:text-slate-250">Default Sidebar Layout</label>
                <select
                  value={sidebarLayout}
                  onChange={sidebarLayout === 'expanded' ? handleSidebarChange : handleSidebarChange} // Reusable
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold outline-none focus:border-primary-500 text-slate-600 dark:text-slate-300"
                >
                  <option value="expanded">Expanded (Default)</option>
                  <option value="collapsed">Collapsed</option>
                </select>
              </div>

              {/* Language Selection */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="font-bold text-slate-750 dark:text-slate-250 flex items-center gap-1">
                  <Globe size={14} className="text-slate-400" />
                  Language
                </label>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold outline-none focus:border-primary-500 text-slate-600 dark:text-slate-300"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 italic">Interface default selections apply on workspace refreshes.</p>
        </section>

      </div>

      {/* Row 3: Visual Theme Selection */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
          <Eye size={16} className="text-primary-500" />
          Choose Workspace Theme
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`flex flex-col text-left rounded-xl border p-4 transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-slate-50 dark:bg-slate-950 border-primary-500 ring-2 ring-primary-500/10'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="h-24 w-full bg-slate-100 rounded-lg mb-3 flex items-center justify-center border border-slate-200/50">
              {/* Fake dashboard mockup */}
              <div className="w-[80%] h-[70%] bg-white rounded shadow-sm border border-slate-200 flex p-1 gap-1">
                <div className="w-[20%] h-full bg-slate-100 rounded" />
                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-[20%] bg-slate-100 rounded" />
                  <div className="flex-1 bg-slate-50 rounded border border-slate-100" />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-bold text-slate-800 dark:text-white">Light Mode</span>
              {theme === 'light' && (
                <span className="bg-primary-500 text-white rounded-full p-0.5 border border-white">
                  <Check size={8} />
                </span>
              )}
            </div>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`flex flex-col text-left rounded-xl border p-4 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-50 dark:bg-slate-950 border-primary-500 ring-2 ring-primary-500/10'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="h-24 w-full bg-slate-950 rounded-lg mb-3 flex items-center justify-center border border-slate-850">
              {/* Fake dashboard mockup */}
              <div className="w-[80%] h-[70%] bg-slate-900 rounded shadow-sm border border-slate-800 flex p-1 gap-1">
                <div className="w-[20%] h-full bg-slate-950 rounded" />
                <div className="flex-1 flex flex-col gap-1">
                  <div className="h-[20%] bg-slate-950 rounded" />
                  <div className="flex-1 bg-slate-850 rounded border border-slate-800" />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-bold text-slate-800 dark:text-white">Dark Mode</span>
              {theme === 'dark' && (
                <span className="bg-primary-500 text-white rounded-full p-0.5 border border-slate-900">
                  <Check size={8} />
                </span>
              )}
            </div>
          </button>
        </div>
      </section>

    </div>
  );
}

export default Settings;
