'use client';

import Link from 'next/link';
import { useState } from 'react';

const benefits = [
    'AI-driven course recommendations',
    'Real-time performance tracking',
    '24/7 chatbot academic advisor',
    'Career path mapping & guidance',
];

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: wire up real authentication
    };

    return (
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">

            {/* Left Panel */}
            <div
                className="relative hidden flex-col justify-between overflow-hidden px-10 py-10 lg:flex"
                style={{
                    background: 'linear-gradient(160deg, #1e3a8a 0%, #4338ca 55%, #7c3aed 100%)',
                }}
            >
                {/* Back link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-200 transition-colors hover:text-white"
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    Back to Home
                </Link>

                {/* Middle content */}
                <div className="max-w-md">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="9" width="14" height="10" rx="2" />
                                <path d="M9 9V7a3 3 0 0 1 6 0v2" />
                                <circle cx="9.5" cy="14" r="1" fill="white" />
                                <circle cx="14.5" cy="14" r="1" fill="white" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white">AIGuidance</p>
                            <p className="text-xs font-medium text-slate-300">Student Guidance System</p>
                        </div>
                    </div>

                    <h1 className="mt-10 text-4xl font-extrabold leading-tight text-white sm:text-[2.6rem]">
                        Intelligent guidance
                        <br />
                        for every student
                    </h1>

                    <p className="mt-6 text-base leading-relaxed text-slate-200">
                        Sign in to access personalised course recommendations, career guidance, and AI-powered academic support.
                    </p>

                    <ul className="mt-8 space-y-3">
                        {benefits.map((item) => (
                            <li key={item} className="flex items-center gap-3 text-sm text-slate-100">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/90">
                                    <svg width="11" height="11" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer */}
                <p className="text-xs text-slate-300">&copy; 2024 AI Student Guidance System</p>
            </div>

            {/* Right Panel */}
            <div className="flex items-center justify-center bg-slate-50 px-6 py-16 lg:px-16">
                <div className="w-full max-w-md">

                    {/* Mobile back link */}
                    <Link
                        href="/"
                        className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 lg:hidden"
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        Back to Home
                    </Link>

                    <h2 className="text-3xl font-extrabold text-slate-900">Welcome back</h2>
                    <p className="mt-2 text-sm text-slate-500">Sign in to your account to continue.</p>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                                Email Address
                            </label>
                            <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
                                <svg width="16" height="16" className="mr-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@university.edu"
                                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                                Password
                            </label>
                            <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
                                <svg width="16" height="16" className="mr-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="ml-3 text-slate-400 transition-colors hover:text-slate-600"
                                >
                                    {showPassword ? (
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Sign In to Dashboard
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}