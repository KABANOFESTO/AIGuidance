"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MailWarning, ArrowRight } from "lucide-react";
import { useVerifyEmailMutation } from "@/lib/redux/slices/AuthSlice";

export default function VerifyEmailPage() {
    const router = useRouter();
    const params = useParams<{ uidb64: string; token: string }>();
    const [verifyEmail] = useVerifyEmailMutation();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email address...");

    useEffect(() => {
        const run = async () => {
            try {
                const response = await verifyEmail({ uidb64: params.uidb64, token: params.token }).unwrap();
                setStatus("success");
                setMessage(response.message || "Email verified successfully.");
                setTimeout(() => {
                    router.replace("/auth");
                }, 2500);
            } catch (error: any) {
                setStatus("error");
                setMessage(error?.data?.error || "The verification link is invalid or expired.");
            }
        };

        if (params?.uidb64 && params?.token) {
            run();
        }
    }, [params, router, verifyEmail]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-lg rounded-[28px] border border-gray-100 bg-white p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
                    {status === "loading" ? (
                        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                    ) : status === "success" ? (
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    ) : (
                        <MailWarning className="h-8 w-8 text-amber-600" />
                    )}
                </div>
                <h1 className="mt-6 text-3xl font-extrabold text-slate-900">
                    {status === "success" ? "Email verified" : status === "error" ? "Verification failed" : "Verifying email"}
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link href="/auth" className="inline-flex items-center gap-2 rounded-xl bg-[#1e2a78] px-5 py-3 text-sm font-semibold text-white hover:bg-[#16205c]">
                        Go to login
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/auth/signup" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        Create account
                    </Link>
                </div>
                <p className="mt-4 text-xs text-slate-400">You will be redirected to login automatically if verification succeeds.</p>
            </div>
        </main>
    );
}
