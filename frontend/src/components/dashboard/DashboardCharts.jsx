import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { PieChart as PieIcon, BarChart2, AlertCircle } from 'lucide-react';

function DashboardCharts({ charts = {}, projectProgress = [] }) {
  const statusStats = charts.statusStats || {};
  const priorityStats = charts.priorityStats || {};

  // 1. Prepare Status Donut Data
  const statusData = [
    { name: 'To Do', value: statusStats['To Do'] || 0, color: '#64748b' }, // Slate
    { name: 'In Progress', value: statusStats['In Progress'] || 0, color: '#3b82f6' }, // Blue
    { name: 'Review', value: statusStats['Review'] || 0, color: '#a855f7' }, // Purple
    { name: 'Done', value: statusStats['Done'] || 0, color: '#10b981' } // Emerald
  ].filter((item) => item.value > 0);

  const totalTasksCount = Object.values(statusStats).reduce((sum, val) => sum + val, 0);

  // 2. Prepare Priority Donut Data
  const priorityData = [
    { name: 'Low', value: priorityStats['Low'] || 0, color: '#10b981' }, // Emerald
    { name: 'Medium', value: priorityStats['Medium'] || 0, color: '#f59e0b' }, // Amber
    { name: 'High', value: priorityStats['High'] || 0, color: '#f43f5e' } // Rose
  ].filter((item) => item.value > 0);

  // 3. Prepare Project Bar Data (Pending vs Completed stacked workload)
  const projectData = projectProgress.map((p) => ({
    name: p.title.length > 18 ? `${p.title.substring(0, 18)}...` : p.title,
    Completed: p.completedTasks || 0,
    Pending: Math.max(0, (p.totalTasks || 0) - (p.completedTasks || 0))
  }));

  // Reusable custom tooltip for donut slices
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataObj = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-lg text-xs font-semibold text-slate-700 dark:text-slate-200">
          <p className="font-bold text-slate-850 dark:text-white mb-1">{dataObj.name}</p>
          <p className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dataObj.color }} />
            Tasks: <span className="font-extrabold text-slate-850 dark:text-white">{dataObj.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Reusable custom tooltip for bar workload
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataObj = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs font-semibold text-slate-700 dark:text-slate-200 space-y-1.5">
          <p className="font-bold text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-1 mb-1">{dataObj.name}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
              {entry.name}: <span className="font-extrabold text-slate-850 dark:text-white">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const hasTaskMetrics = totalTasksCount > 0;

  return (
    <div className="space-y-6">
      
      {/* Donut distributions row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Task Status Donut */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[340px]">
          <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
            <PieIcon size={16} className="text-primary-500" />
            Task Status Distribution
          </h3>
          
          {hasTaskMetrics && statusData.length > 0 ? (
            <div className="relative flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', fontWeight: '600' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Central text overlay */}
              <div className="absolute top-[43%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total</p>
                <p className="text-2xl font-extrabold text-slate-850 dark:text-white">{totalTasksCount}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
              <AlertCircle size={28} className="text-slate-350" />
              <p className="text-xs font-medium">No task status metrics logged.</p>
            </div>
          )}
        </div>

        {/* Task Priority Donut */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[340px]">
          <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
            <PieIcon size={16} className="text-primary-500" />
            Task Priority Distribution
          </h3>
          
          {hasTaskMetrics && priorityData.length > 0 ? (
            <div className="relative flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', fontWeight: '600' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute top-[43%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active</p>
                <p className="text-2xl font-extrabold text-slate-850 dark:text-white">
                  {priorityData.reduce((acc, curr) => acc + curr.value, 0)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
              <AlertCircle size={28} className="text-slate-350" />
              <p className="text-xs font-medium">No task priority metrics logged.</p>
            </div>
          )}
        </div>
      </div>

      {/* Stacked Workload Bar Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[360px]">
        <h3 className="font-display text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
          <BarChart2 size={16} className="text-primary-500" />
          Project Task Comparison & Workload
        </h3>

        {projectData.length > 0 ? (
          <div className="flex-1 mt-4">
            <ResponsiveContainer width="100%" height="95%">
              <BarChart
                data={projectData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-slate-100)" className="dark:stroke-slate-800" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '600' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '600' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'var(--color-slate-50)', opacity: 0.15 }} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconSize={10}
                  iconType="square"
                  wrapperStyle={{ fontSize: '11px', fontWeight: '600', paddingBottom: '15px' }}
                />
                <Bar dataKey="Completed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Pending" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
            <AlertCircle size={28} className="text-slate-350" />
            <p className="text-xs font-medium">No project comparisons available.</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default DashboardCharts;
