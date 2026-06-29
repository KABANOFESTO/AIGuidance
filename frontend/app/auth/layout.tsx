"use client";

import { Work_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import Image from "next/image";

const workSans = Work_Sans({
    variable: "--font-work-sans",
    subsets: ["latin"]
});
export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SessionProvider>
            <div className={`${workSans.className} ${workSans.variable} flex items-center justify-center min-h-screen p-4 relative`}>
                <Image
                    src="/auth-bg.png"
                    alt="Background"
                    className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
                    fill
                />
                <div className="w-full flex flex-col md:flex-row bg-transparent shadow-lg rounded-xl overflow-hidden relative z-10">
                    <div style={{ width: "100%" }}>
                        {children}
                    </div>
                </div>
            </div>
        </SessionProvider>
    );
}
