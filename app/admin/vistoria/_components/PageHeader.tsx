'use client';

import React from 'react';

export function PageHeader({ icon, title, subtitle, actions, tone = 'from-cyan-500/20 to-blue-500/10 border-cyan-500/10' }: {
  icon: React.ReactNode; title: string; subtitle?: string; actions?: React.ReactNode; tone?: string;
}) {
  return (
    <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br ${tone} flex items-center justify-center border`}>{icon}</div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">{actions}</div>
        </div>
      </div>
    </div>
  );
}

export function Thumb({ src, className = '' }: { src?: string; className?: string }) {
  return src ? (
    <img src={src} alt="" loading="lazy" className={`object-cover ${className}`} />
  ) : (
    <div className={`bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-600 ${className}`}>
      <svg viewBox="0 0 24 24" className="w-1/3 h-1/3" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6" /></svg>
    </div>
  );
}

export function ProgressRing({ value, size = 36 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const color = value >= 80 ? '#34d399' : value >= 50 ? '#fbbf24' : '#f87171';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`${value}% completo`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (value / 100) * c} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={size * 0.28} fontWeight="700" fill="#e2e8f0">{value}</text>
    </svg>
  );
}
