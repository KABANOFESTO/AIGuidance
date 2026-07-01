"use client";

import { Work_Sans } from "next/font/google";
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
        <div className={`${workSans.className} ${workSans.variable} min-h-screen relative`}>
            <Image
                src="/auth-bg.jfif"
                alt="Background"
                className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
                fill
            />
            <div className="relative z-10 w-full">
                <div style={{ width: "100%" }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
