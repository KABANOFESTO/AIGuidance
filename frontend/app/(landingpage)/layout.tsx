import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Ai-Guidance - Your AI Learning Companion",
    description: "Ai-Guidance is your AI learning companion, providing personalized guidance and support for your educational journey.",
    icons: {
        icon: '/favicon.ico',
        shortcut: '/logo.png',
        apple: '/logo.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={`${inter.className} antialiased min-h-screen flex flex-col relative`}>
            {/* Background Video */}
            <video
                autoPlay
                muted
                loop
                playsInline
                className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
            >
                <source src="/animation/wave.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            {/* Content Wrapper */}
            <div className="relative z-10 bg-black/50 min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
            </div>
            <div>

            </div>
        </div>
    );
}
