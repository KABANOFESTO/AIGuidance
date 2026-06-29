'use client';

const roles = [
    {
        title: 'Students',
        stat: '640+',
        statColor: 'text-blue-700',
        description:
            'Chat with AI advisor, view recommendations, track performance, and explore career paths.',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
        ),
    },
    {
        title: 'Administrators',
        stat: '38',
        statColor: 'text-violet-700',
        description:
            'Manage users, update knowledge base, monitor system performance and generate reports.',
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-700',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
    },
    {
        title: 'Academic Advisors',
        stat: '24',
        statColor: 'text-cyan-600',
        description:
            'Review student progress, support complex cases, and oversee AI recommendations.',
        iconBg: 'bg-cyan-100',
        iconColor: 'text-cyan-600',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21v-2a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v2" />
                <path d="M19 8l1.5 1.5L23 7" />
            </svg>
        ),
    },
    {
        title: 'Lecturers',
        stat: '52',
        statColor: 'text-emerald-600',
        description:
            'Upload course materials, view class analytics, and provide learning feedback.',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <path d="M9 7h6M9 11h4" />
            </svg>
        ),
    },
];

export default function Roles() {
    return (
        <section id="roles" className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">

                {/* Header */}
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-bold text-cyan-700">
                        User Roles
                    </span>
                    <h2 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 sm:text-[2.75rem]">
                        Built for Every Stakeholder
                    </h2>
                </div>

                {/* Cards */}
                <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {roles.map(({ title, stat, statColor, description, icon, iconBg, iconColor }) => (
                        <div
                            key={title}
                            className="rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
                                    {icon}
                                </div>
                                <span className={`text-2xl font-extrabold ${statColor}`}>{stat}</span>
                            </div>
                            <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}