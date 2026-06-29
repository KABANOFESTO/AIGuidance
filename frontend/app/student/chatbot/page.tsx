"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    Briefcase,
    User,
    Send,
    MessageSquare,
    Check,
} from "lucide-react";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

type Sender = "bot" | "user";

interface ChatMessage {
    id: string;
    sender: Sender;
    text: string;
    time: string;
}

interface HistoryItem {
    id: string;
    title: string;
    timeAgo: string;
}

interface SuggestedPrompt {
    id: string;
    label: string;
}

// ----------------------------------------------------------------------------
// Static config
// ----------------------------------------------------------------------------

const CAPABILITIES = [
    "Course recommendations",
    "Career path guidance",
    "Performance analysis",
    "Study plan creation",
    "Assignment help",
    "Academic Q&A",
];

const HISTORY: HistoryItem[] = [
    { id: "h1", title: "Career guidance session", timeAgo: "1 day ago" },
    { id: "h2", title: "Course selection help", timeAgo: "2 days ago" },
    { id: "h3", title: "Performance review", timeAgo: "3 days ago" },
    { id: "h4", title: "Study strategies", timeAgo: "4 days ago" },
];

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
    { id: "p1", label: "What courses should I take?" },
    { id: "p2", label: "What career suits me?" },
    { id: "p3", label: "How is my performance?" },
    { id: "p4", label: "I need help with attendance" },
];

const INITIAL_MESSAGES: ChatMessage[] = [
    {
        id: "m1",
        sender: "bot",
        text: "Hello Alex! 👋 I'm your AI Academic Advisor. I'm here to help with course recommendations, career guidance, performance analysis, and any academic queries. How can I help you today?",
        time: "09:00",
    },
];

// ----------------------------------------------------------------------------
// Canned response logic — replace with a real API call to your AI backend
// ----------------------------------------------------------------------------

function getBotReply(userText: string): string {
    const text = userText.toLowerCase();

    if (text.includes("course")) {
        return "Based on your academic profile and interests in programming, I recommend: Advanced Algorithms (CS401), Machine Learning Fundamentals (CS450), and Data Structures (CS301). These align with your strong performance in mathematics and programming. Would you like details on any of these?";
    }
    if (text.includes("career")) {
        return "Looking at your strengths in programming and problem-solving, Software Engineering, Data Science, and Machine Learning Engineering are strong matches for you. Want me to break down what each path typically involves?";
    }
    if (text.includes("performance")) {
        return "Your current GPA is 3.8, placing you in the top 15% of your class. Attendance has dipped slightly to 85% this semester — keeping that up will help protect your grades in courses like CS302.";
    }
    if (text.includes("attendance")) {
        return "Your attendance in Databases (CS302) has dropped to 72%, which puts your final grade at risk. I'd recommend attending all remaining sessions and reaching out to your instructor about catching up on missed material.";
    }
    return "Thanks for the question! I'm still learning the specifics of your request — could you tell me a bit more about what you'd like help with (courses, career planning, performance, or attendance)?";
}

function getCurrentTime(): string {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ----------------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------------

function BotAvatar() {
    return (
        <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: "linear-gradient(135deg, #4338ca, #0ea5e9)" }}
        >
            <Briefcase className="h-4 w-4" />
        </div>
    );
}

function UserAvatar() {
    return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e2a78] text-white">
            <User className="h-4 w-4" />
        </div>
    );
}

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.sender === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`flex max-w-[70%] items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"
                    }`}
            >
                {isUser ? <UserAvatar /> : <BotAvatar />}
                <div>
                    <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
                                ? "rounded-br-md bg-[#1e2a78] text-white"
                                : "rounded-bl-md bg-gray-50 text-gray-800"
                            }`}
                    >
                        {message.text}
                    </div>
                    <div
                        className={`mt-1.5 text-xs text-gray-400 ${isUser ? "text-right" : "text-left"
                            }`}
                    >
                        {message.time}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex justify-start">
            <div className="flex items-end gap-2.5">
                <BotAvatar />
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-gray-50 px-4 py-3.5">
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function AiAcademicAdvisorPage() {
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages, isTyping]);

    const sendMessage = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const userMessage: ChatMessage = {
            id: `u-${Date.now()}`,
            sender: "user",
            text: trimmed,
            time: getCurrentTime(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        setTimeout(() => {
            const botMessage: ChatMessage = {
                id: `b-${Date.now()}`,
                sender: "bot",
                text: getBotReply(trimmed),
                time: getCurrentTime(),
            };
            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
        }, 1100 + Math.random() * 600);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        AI Academic Advisor
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Chat with your intelligent AI advisor — powered by NLP and your
                        academic data
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
                    {/* Chat panel */}
                    <div className="flex h-[760px] flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
                        {/* Chat header */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <BotAvatar />
                                <div>
                                    <div className="text-sm font-bold text-gray-900">
                                        AI Academic Advisor
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Online • Analysing your profile
                                    </div>
                                </div>
                            </div>
                            <div className="hidden items-center gap-2 sm:flex">
                                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                                    NLP Enabled
                                </span>
                                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
                                    GPT-4 Powered
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 space-y-6 overflow-y-auto px-6 py-6"
                        >
                            {messages.map((m) => (
                                <MessageBubble key={m.id} message={m} />
                            ))}
                            {isTyping && <TypingIndicator />}
                        </div>

                        {/* Suggested prompts */}
                        <div className="flex flex-wrap gap-2 border-t border-gray-100 px-6 py-4">
                            {SUGGESTED_PROMPTS.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => sendMessage(p.label)}
                                    className="rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <form
                            onSubmit={handleSubmit}
                            className="flex items-center gap-3 border-t border-gray-100 px-6 py-4"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask your AI advisor anything..."
                                className="flex-1 rounded-full bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1e2a78]/20"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                aria-label="Send message"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7c3aed] text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* AI Capabilities */}
                        <div
                            className="rounded-2xl p-6 text-white shadow-sm"
                            style={{
                                background:
                                    "linear-gradient(135deg, #5b21b6, #2563eb, #06b6d4)",
                            }}
                        >
                            <h2 className="mb-4 text-base font-bold">AI Capabilities</h2>
                            <ul className="space-y-2.5">
                                {CAPABILITIES.map((cap) => (
                                    <li
                                        key={cap}
                                        className="flex items-center gap-2 text-sm font-medium"
                                    >
                                        <Check className="h-4 w-4 shrink-0" />
                                        {cap}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Chat history */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-base font-bold text-gray-900">
                                Chat History
                            </h2>
                            <div className="space-y-4">
                                {HISTORY.map((h) => (
                                    <button
                                        key={h.id}
                                        onClick={() =>
                                            sendMessage(`Let's continue our "${h.title}" chat`)
                                        }
                                        className="flex w-full items-start gap-3 text-left transition hover:opacity-70"
                                    >
                                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">
                                                {h.title}
                                            </div>
                                            <div className="text-xs text-gray-400">{h.timeAgo}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}