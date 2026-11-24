import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md',
}: TabsProps<T>) {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-xs sm:text-sm px-3.5 py-1.5 gap-2',
  }[size];

  return (
    <div
      className={`inline-flex items-center p-1 rounded-lg bg-slate-900/90 light:bg-slate-200/70 border border-slate-800 light:border-slate-300 ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center font-medium rounded-md transition-all duration-150 whitespace-nowrap shrink-0 ${sizeClasses} ${
              isActive
                ? 'bg-slate-800 text-white shadow-sm light:bg-white light:text-slate-900'
                : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-950'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${
                  isActive
                    ? 'bg-slate-700 text-slate-200 light:bg-slate-100 light:text-slate-700'
                    : 'bg-slate-800/80 text-slate-400 light:bg-slate-300 light:text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
