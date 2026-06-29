'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer
            style={{
                background: '#0a0f1f',
                borderTop: '2px solid transparent',
                borderImage: 'linear-gradient(to right, #0ea5e9, #7c3aed) 1',
            }}
        >
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row lg:px-10">

                {/* Brand */}
                <div className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="9" width="14" height="10" rx="2" />
                        <path d="M9 9V7a3 3 0 0 1 6 0v2" />
                        <circle cx="9.5" cy="14" r="1" fill="#7dd3fc" />
                        <circle cx="14.5" cy="14" r="1" fill="#7dd3fc" />
                        <path d="M3 13h2M19 13h2" />
                    </svg>
                    <span className="text-sm font-bold text-white">
                        AI<span className="text-sky-400">Guidance</span> System
                    </span>
                </div>

                {/* Tagline */}
                <p className="text-sm text-gray-400">
                    &copy; 2024 AI Student Guidance System. Built with intelligence, designed for success.
                </p>

                {/* Links */}
                <div className="flex items-center gap-5 text-sm text-gray-400">
                    <Link href="#" className="transition-colors hover:text-white">
                        Privacy
                    </Link>
                    <Link href="#" className="transition-colors hover:text-white">
                        Terms
                    </Link>
                    <Link href="#" className="transition-colors hover:text-white">
                        Support
                    </Link>
                </div>
            </div>
        </footer>
    );
}