'use client';

const features = [
    {
        title: 'AI Chatbot Advisor',
        description:
            '24/7 intelligent academic advisor powered by NLP that understands your goals and guides your journey.',
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600',
        linkColor: 'text-violet-600',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="9" width="14" height="10" rx="2" />
                <path d="M9 9V7a3 3 0 0 1 6 0v2" />
                <circle cx="9.5" cy="14" r="1" fill="currentColor" />
                <circle cx="14.5" cy="14" r="1" fill="currentColor" />
            </svg>
        ),
    },
    {
        title: 'Smart Course Recommender',
        description:
            'Personalised course suggestions using collaborative and content-based filtering tailored to your grades.',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        linkColor: 'text-blue-700',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
        ),
    },
    {
        title: 'Career Path Guide',
        description:
            'AI-driven career mapping using interest frameworks to match you with the perfect career trajectory.',
        iconBg: 'bg-cyan-100',
        iconColor: 'text-cyan-600',
        linkColor: 'text-cyan-600',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
        ),
    },
    {
        title: 'Performance Analyser',
        description:
            'Real-time progress tracking, at-risk detection, and visual reports to keep you on the path to success.',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        linkColor: 'text-emerald-600',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
        ),
    },
];

export default function Features() {
    return (
        <section id="features" className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">

                {/* Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700">
                        Core Modules
                    </span>
                    <h2 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 sm:text-[2.75rem]">
                        Four Intelligent Modules,
                        <br />
                        One Unified Platform
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-slate-500">
                        Every feature is powered by machine learning and built to adapt to each
                        student&apos;s unique academic journey.
                    </p>
                </div>

                {/* Cards */}
                <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map(({ title, description, icon, iconBg, iconColor, linkColor }) => (
                        <div
                            key={title}
                            className="rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg"
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
                                {icon}
                            </div>
                            <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
                            <a
                                href="#"
                                className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${linkColor} transition-colors hover:opacity-80`}
                            >
                                Learn more
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}