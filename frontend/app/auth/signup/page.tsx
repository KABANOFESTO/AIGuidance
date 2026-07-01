"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useCurrentUserQuery, useRegisterMutation, useResendVerificationMutation } from "@/lib/redux/slices/AuthSlice";
import { getDashboardPath } from "@/lib/auth/navigation";
import { hasValidAccessToken } from "@/lib/auth/session";

const benefits = [
    "Student-only registration",
    "Email verification before login",
    "Personalized academic support",
    "Ready for lecturer and admin oversight",
];

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [register, { isLoading }] = useRegisterMutation();
    const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
    const hasAccessToken = hasValidAccessToken();
    const { data: currentUser } = useCurrentUserQuery(undefined, { skip: !hasAccessToken });

    useEffect(() => {
        if (currentUser?.role) {
            router.replace(getDashboardPath(currentUser.role));
        }
    }, [currentUser, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            await register({ username, email, password, role: "Student" }).unwrap();
            setMessage("Account created. Check your email to verify your account before logging in.");
        } catch (error: any) {
            setMessage(error?.data?.error || error?.data?.detail || "Unable to create the account right now.");
        }
    };

    const handleResend = async () => {
        if (!email.trim()) {
            setMessage("Enter the email address you used to sign up first.");
            return;
        }
        await resendVerification({ email }).unwrap();
        setMessage("If the account exists, a new verification email has been sent.");
    };

    return (
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
            <div
                className="relative hidden flex-col justify-between overflow-hidden px-10 py-10 lg:flex"
                style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e2a78 55%, #7c3aed 100%)" }}
            >
                <div className="max-w-md">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                            <UserRound className="h-6 w-6 text-sky-200" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-white">AIGuidance</p>
                            <p className="text-xs font-medium text-slate-300">Student Guidance System</p>
                        </div>
                    </div>

                    <h1 className="mt-10 text-4xl font-extrabold leading-tight text-white sm:text-[2.6rem]">
                        Start your academic journey with guidance that feels personal
                    </h1>
                    <p className="mt-6 text-base leading-relaxed text-slate-200">
                        Students register here, verify their email, and then access recommendations, chatbot guidance, and learning resources.
                    </p>

                    <ul className="mt-8 space-y-3">
                        {benefits.map((item) => (
                            <li key={item} className="flex items-center gap-3 text-sm text-slate-100">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/90">
                                    <ArrowRight className="h-3 w-3 text-slate-900" />
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-xs text-slate-300">&copy; 2026 AI Student Guidance System</p>
            </div>

            <div className="flex items-center justify-center bg-slate-50 px-6 py-16 lg:px-16">
                <div className="w-full max-w-md">
                    <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800">
                        <ArrowRight className="h-4 w-4 rotate-180" />
                        Back to Home
                    </Link>

                    <div className="rounded-[28px] border border-gray-100 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                <Sparkles className="h-3.5 w-3.5" />
                                Student registration
                            </div>
                            <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Create your account</h2>
                            <p className="mt-2 text-sm text-slate-500">Sign up as a student, then verify your email to activate access.</p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="username" className="text-sm font-semibold text-slate-700">Full Name</label>
                                <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
                                    <UserRound className="mr-3 h-4 w-4 text-slate-400" />
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                                <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
                                    <Mail className="mr-3 h-4 w-4 text-slate-400" />
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

                            <div>
                                <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                                <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
                                    <ShieldCheck className="mr-3 h-4 w-4 text-slate-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Create a password"
                                        className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="ml-3 text-slate-400 transition-colors hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm Password</label>
                                <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
                                    <ShieldCheck className="mr-3 h-4 w-4 text-slate-400" />
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter your password"
                                        className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                                        required
                                    />
                                    <button
                                        type="button"
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="ml-3 text-slate-400 transition-colors hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {message && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1e2a78] to-[#5b21b6] px-4 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                                {isLoading ? "Creating account..." : "Create account"}
                            </button>

                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isResending}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            >
                                {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                                Resend verification email
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link href="/auth" className="font-semibold text-[#1e2a78] hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
