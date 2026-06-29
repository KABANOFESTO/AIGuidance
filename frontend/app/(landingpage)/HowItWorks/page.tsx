'use client';

const steps = [
    {
        number: '01',
        title: 'Create Your Profile',
        description:
            'Enter your academic goals, interests, learning preferences, and career aspirations.',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
        ),
    },
    {
        number: '02',
        title: 'Chat with AI',
        description:
            'Engage with our intelligent chatbot to get personalised guidance on courses and careers.',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
        ),
    },
    {
        number: '03',
        title: 'Get Recommendations',
        description:
            'Receive AI-driven course and career recommendations based on your data.',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44A2.5 2.5 0 0 1 4.5 17v-9A2.5 2.5 0 0 1 2 5.5 2.5 2.5 0 0 1 4.5 3 2.5 2.5 0 0 1 9.5 2z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44A2.5 2.5 0 0 0 19.5 17v-9A2.5 2.5 0 0 0 22 5.5 2.5 2.5 0 0 0 19.5 3 2.5 2.5 0 0 0 14.5 2z" />
            </svg>
        ),
    },
    {
        number: '04',
        title: 'Track Progress',
        description:
            'Monitor your academic journey with visual analytics and at-risk alerts.',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
            </svg>
        ),
    },
];

export default function HowItWorks() {
    return (
        <section
            id="performance"
            className="py-20"
            style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
            }}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-10">

                {/* Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-bold text-violet-700">
                        Process
                    </span>
                    <h2 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 sm:text-[2.75rem]">
                        How It Works
                    </h2>
                </div>

                {/* Steps */}
                <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map(({ number, title, description, icon }) => (
                        <div key={number} className="flex flex-col items-center text-center">
                            <div className="relative">
                                <div
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-md"
                                    style={{ background: '#1e2a6b' }}
                                >
                                    {icon}
                                </div>
                                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[11px] font-bold text-white shadow">
                                    {number}
                                </span>
                            </div>
                            <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
                            <p className="mt-3 max-w-[230px] text-sm leading-relaxed text-slate-500">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}