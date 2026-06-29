'use client';

export default function Hero() {
    return (
        <section
            className="relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b4cca 35%, #6d28d9 75%, #7c3aed 100%)',
            }}
        >
            <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-28">

                {/* Left Column */}
                <div>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-300">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z" />
                        </svg>
                        AI-Powered Academic Guidance System
                    </div>

                    {/* Heading */}
                    <h1 className="mt-6 text-5xl font-extrabold leading-tight text-white sm:text-6xl">
                        Your AI
                        <br />
                        <span className="bg-gradient-to-r from-sky-300 via-violet-200 to-pink-200 bg-clip-text text-transparent">
                            Academic Advisor
                        </span>
                        <br />
                        24/7
                    </h1>

                    {/* Description */}
                    <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-200">
                        Replace guesswork with intelligence. Our AI chatbot analyses your
                        grades, interests, and goals to recommend the perfect courses,
                        map your career path, and alert you before you fall behind.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <button className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-violet-700 shadow-lg transition-transform hover:-translate-y-0.5">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="9" width="14" height="10" rx="2" />
                                <path d="M9 9V7a3 3 0 0 1 6 0v2" />
                                <circle cx="9.5" cy="14" r="1" fill="currentColor" />
                                <circle cx="14.5" cy="14" r="1" fill="currentColor" />
                            </svg>
                            Start Chatting Free
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
                            View Demo
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
                        {[
                            { value: '640+', label: 'Active Students' },
                            { value: '99%', label: 'System Uptime' },
                            { value: '<3s', label: 'Response Time' },
                            { value: '94%', label: 'Recommendation Accuracy' },
                        ].map(({ value, label }) => (
                            <div key={label}>
                                <p className="text-2xl font-extrabold text-white">{value}</p>
                                <p className="mt-1 text-xs text-slate-300">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Chat Card */}
                <div className="relative">
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-sm">

                        {/* Chat Header */}
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-violet-600">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="5" y="9" width="14" height="10" rx="2" />
                                    <path d="M9 9V7a3 3 0 0 1 6 0v2" />
                                    <circle cx="9.5" cy="14" r="1" fill="white" />
                                    <circle cx="14.5" cy="14" r="1" fill="white" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">AI Academic Advisor</p>
                                <p className="flex items-center gap-1.5 text-xs text-emerald-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    Online &middot; Ready to help
                                </p>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="mt-4 flex flex-col gap-3">

                            {/* User message */}
                            <div className="flex justify-end">
                                <div className="max-w-[85%] rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-md">
                                    Which career suits me? I love programming and math.
                                </div>
                            </div>

                            {/* Bot response */}
                            <div className="flex justify-start">
                                <div className="max-w-[90%] rounded-xl bg-white/15 px-4 py-3 text-sm text-white shadow-md">
                                    <p className="font-semibold">Based on your profile, I recommend:</p>
                                    <ul className="mt-2 space-y-1">
                                        <li className="flex items-center gap-2">
                                            <span>🎯</span> Software Engineer &mdash; 95% match
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span>🧬</span> Data Scientist &mdash; 88% match
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span>🤖</span> AI Engineer &mdash; 84% match
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* User message */}
                            <div className="flex justify-end">
                                <div className="max-w-[85%] rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-md">
                                    What courses should I take for Data Science?
                                </div>
                            </div>
                        </div>

                        {/* Chat Input */}
                        <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                            <input
                                type="text"
                                placeholder="Ask me anything about your academics..."
                                className="w-full bg-transparent text-sm text-white placeholder-slate-300 outline-none"
                            />
                            <button
                                type="button"
                                aria-label="Send message"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white transition-colors hover:bg-violet-700"
                            >
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}