import React, { useState, useEffect } from 'react';
import { Layout, CheckCircle2, Shield, Database, LayoutDashboard, AppWindow, ArrowRight } from 'lucide-react';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');

  // Toggle theme utility
  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      root.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    // Check backend health
    fetch('http://localhost:5000/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setServerStatus('online');
        } else {
          setServerStatus('error');
        }
      })
      .catch(() => {
        setServerStatus('offline');
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 text-white p-2 rounded-xl shadow-md shadow-primary-500/20">
              <LayoutDashboard size={24} />
            </div>
            <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
              DevTrack
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <span className="text-yellow-400">☀️</span>
              ) : (
                <span className="text-slate-600">🌙</span>
              )}
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-800/50">
              Phase 1
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
            <CheckCircle2 size={16} />
            Project Scaffold Initialized Successfully
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
              DevTrack
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            A production-quality full-stack Project and Issue Management System inspired by Jira and Trello.
            Vite, React 19, Tailwind CSS v4, Express, and MongoDB connection are configured and ready.
          </p>
        </div>

        {/* Status Dashboard Mock */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Backend status */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Database size={24} />
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                serverStatus === 'online'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : serverStatus === 'checking'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  serverStatus === 'online'
                    ? 'bg-emerald-500'
                    : serverStatus === 'checking'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-rose-500'
                }`} />
                {serverStatus.toUpperCase()}
              </span>
            </div>
            <h3 className="font-display font-semibold text-lg mb-1">Backend Server</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Express, Helmet, Cors, and Mongoose connection running on Port 5000.
            </p>
          </div>

          {/* Card 2: Frontend status */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 rounded-xl">
                <AppWindow size={24} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                ACTIVE
              </span>
            </div>
            <h3 className="font-display font-semibold text-lg mb-1">Frontend (Vite)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              React 19 initialized with path alias setup and fast Hot Module Replacement.
            </p>
          </div>

          {/* Card 3: Tailwind v4 status */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 rounded-xl">
                <Layout size={24} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                COMPILED
              </span>
            </div>
            <h3 className="font-display font-semibold text-lg mb-1">Tailwind CSS v4</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Modern styling system using CSS-first configuration and customized theme variables.
            </p>
          </div>
        </div>

        {/* Project Setup Checklist */}
        <div className="mt-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <Shield className="text-primary-500" />
            Phase 1 Infrastructure Check
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Environment configuration loaded (.env)', done: true },
              { label: 'Database connection instance created (config/db.js)', done: true },
              { label: 'Express app server entry points registered (app.js, server.js)', done: true },
              { label: 'Vite configuration and path alias verified', done: true },
              { label: 'React 19 & Tailwind CSS v4 pipeline operational', done: true }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 p-1 rounded-full">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-slate-600 dark:text-slate-300 font-medium text-sm sm:text-base">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => window.open('https://github.com', '_blank')}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-colors cursor-pointer text-sm sm:text-base"
            >
              Get Started with Next Phase
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
