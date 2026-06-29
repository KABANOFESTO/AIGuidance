'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer
            style={{
                background: 'linear-gradient(180deg, #0d1b2e 0%, #080f1c 100%)',
                borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-10">

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">

                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
                                style={{ background: '#7c3aed' }}
                            >
                                <Image src="/logo.png" alt="UoK MailAI" width={24} height={24} />
                            </div>
                            <div>
                                <p className="text-base font-bold text-white">UoK MailAI</p>
                                <p
                                    className="text-xs font-semibold uppercase text-gray-500"
                                    style={{ letterSpacing: '0.2em' }}
                                >
                                    Auto-Reply System
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 text-sm leading-relaxed text-gray-400">
                            AI-powered email automation built for the University of Kigali.
                            Faster responses, smarter workflows.
                        </p>

                        <div className="mt-5 flex gap-3">
                            {/* GitHub */}
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-violet-300"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.167 6.839 9.49.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                </svg>
                            </a>

                            {/* LinkedIn */}
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-violet-300"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>

                            {/* Twitter/X */}
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Twitter"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-violet-300"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3
                            className="mb-4 text-xs font-semibold uppercase text-gray-500"
                            style={{ letterSpacing: '0.18em' }}
                        >
                            Product
                        </h3>
                        <ul className="space-y-2">
                            {['Features', 'Pipeline', 'Performance', 'Roles', 'Changelog'].map((item) => (
                                <li key={item}>
                                    <a
                                        href={`#${item.toLowerCase()}`}
                                        className="text-sm text-gray-400 transition-colors hover:text-violet-300"
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3
                            className="mb-4 text-xs font-semibold uppercase text-gray-500"
                            style={{ letterSpacing: '0.18em' }}
                        >
                            Resources
                        </h3>
                        <ul className="space-y-2">
                            {[
                                { label: 'Documentation', href: '#' },
                                { label: 'API Reference', href: '#' },
                                { label: 'Research Paper', href: '#' },
                                { label: 'Privacy Policy', href: '#' },
                                { label: 'Terms of Use', href: '#' },
                            ].map(({ label, href }) => (
                                <li key={label}>
                                    <a
                                        href={href}
                                        className="text-sm text-gray-400 transition-colors hover:text-violet-300"
                                    >
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Institution Column */}
                    <div>
                        <h3
                            className="mb-4 text-xs font-semibold uppercase text-gray-500"
                            style={{ letterSpacing: '0.18em' }}
                        >
                            Institution
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm text-gray-400">
                                <svg
                                    className="mt-0.5 shrink-0"
                                    style={{ color: '#a78bfa' }}
                                    width="14"
                                    height="14"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                                University of Kigali, Rwanda
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-400">
                                <svg
                                    className="mt-0.5 shrink-0"
                                    style={{ color: '#a78bfa' }}
                                    width="14"
                                    height="14"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                mailai@uok.ac.rw
                            </li>
                            <li className="flex items-start gap-2 text-sm text-gray-400">
                                <svg
                                    className="mt-0.5 shrink-0"
                                    style={{ color: '#a78bfa' }}
                                    width="14"
                                    height="14"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 8v4l3 3" />
                                </svg>
                                Mon &ndash; Fri, 8:00 AM &ndash; 5:00 PM CAT
                            </li>
                        </ul>

                        {/* LPDP Badge */}
                        <div
                            className="mt-5 inline-flex items-center gap-2 rounded-lg px-3 py-2"
                            style={{
                                background: 'rgba(139, 92, 246, 0.08)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                            }}
                        >
                            <svg
                                style={{ color: '#a78bfa' }}
                                width="13"
                                height="13"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span className="text-xs font-medium" style={{ color: '#c4b5fd' }}>
                                Rwanda LPDP Law No. 058/2021
                            </span>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div
                    className="h-px"
                    style={{
                        background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)',
                    }}
                />

                {/* Bottom Bar */}
                <div className="flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
                    <p className="text-xs text-gray-500">
                        &copy; 2025 University of Kigali &middot; AI Research Project &middot; Rwanda LPDP Law No. 058/2021
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <Link href="#" className="transition-colors hover:text-gray-300">
                            Privacy
                        </Link>
                        <span className="text-gray-700">&middot;</span>
                        <Link href="#" className="transition-colors hover:text-gray-300">
                            Terms
                        </Link>
                        <span className="text-gray-700">&middot;</span>
                        <Link href="#" className="transition-colors hover:text-gray-300">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}