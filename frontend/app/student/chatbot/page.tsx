"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Briefcase, Check, MessageSquare, Send, Sparkles, User } from "lucide-react";
import { useGetChatHistoryQuery, useSendChatMessageMutation } from "@/lib/redux/slices/ChatbotSlice";

type ChatRole = "bot" | "user";

type ChatMessage = {
    id: string;
    role: ChatRole;
    text: string;
    time: string;
};

function formatTime(value?: string) {
    if (!value) return "";
    try {
        return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
        return "";
    }
}

function BotAvatar() {
    return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white" style={{ background: "linear-gradient(135deg, #4338ca, #0ea5e9)" }}>
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
    const isUser = message.role === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[75%] items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                {isUser ? <UserAvatar /> : <BotAvatar />}
                <div>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? "rounded-br-md bg-[#1e2a78] text-white" : "rounded-bl-md bg-gray-50 text-gray-800"}`}>
                        {message.text}
                    </div>
                    <div className={`mt-1.5 text-xs text-gray-400 ${isUser ? "text-right" : "text-left"}`}>{message.time}</div>
                </div>
            </div>
        </div>
    );
}

export default function AiAcademicAdvisorPage() {
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
    const [quickReply, setQuickReply] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [sendChatMessage, { isLoading: sending }] = useSendChatMessageMutation();
    const { data: history = [], refetch } = useGetChatHistoryQuery(sessionId, { skip: false });

    const initialPrompts = [
        "What courses should I take next?",
        "What career suits me best?",
        "How is my performance this semester?",
        "Help me understand my attendance risk.",
    ];

    const messages = useMemo(() => {
        const historyMessages = history.flatMap((item: any) => ([
            { id: `u-${item.id}`, role: "user" as const, text: item.user_message, time: formatTime(item.created_at) },
            { id: `b-${item.id}`, role: "bot" as const, text: item.bot_response, time: formatTime(item.created_at) },
        ]));
        return [...historyMessages, ...localMessages];
    }, [history, localMessages]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, sending]);

    useEffect(() => {
        if (quickReply) {
            const timer = window.setTimeout(() => setQuickReply(null), 2200);
            return () => window.clearTimeout(timer);
        }
    }, [quickReply]);

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || sending) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setLocalMessages((prev) => [...prev, { id: `tmp-u-${Date.now()}`, role: "user", text: trimmed, time: timestamp }]);
        setInput("");

        try {
            const response: any = await sendChatMessage({ message: trimmed, session_id: sessionId }).unwrap();
            setSessionId(response.session_id ?? sessionId);
            setLocalMessages((prev) => [
                ...prev,
                {
                    id: `tmp-b-${Date.now()}`,
                    role: "bot",
                    text: response.response,
                    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
            ]);
            setQuickReply(Array.isArray(response.suggestions) && response.suggestions.length ? response.suggestions[0] : null);
            refetch();
        } catch {
            setLocalMessages((prev) => [
                ...prev,
                {
                    id: `tmp-err-${Date.now()}`,
                    role: "bot",
                    text: "I could not reach the advisor service just now. Please try again in a moment.",
                    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
            ]);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">AI Academic Advisor</h1>
                        <p className="mt-1 text-sm text-gray-500">Live chatbot powered by your academic profile and knowledge base</p>
                    </div>
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                            <div className="flex items-center gap-2 font-semibold">
                                <Sparkles className="h-4 w-4" />
                            Conversation Engine
                            </div>
                        <p className="mt-1 text-xs text-blue-600">{history.length} live messages loaded</p>
                        </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
                    <div className="flex h-[760px] flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <BotAvatar />
                                <div>
                                    <div className="text-sm font-bold text-gray-900">AI Advisor</div>
                                    <div className="text-xs text-gray-400">Online and connected to your student data</div>
                                </div>
                            </div>
                            <button onClick={() => refetch()} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                                Refresh
                            </button>
                        </div>

                        <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                            {messages.length ? messages.map((m) => <MessageBubble key={m.id} message={m} />) : (
                                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                                    Start a conversation below. The chatbot will answer from your live academic and career data.
                                </div>
                            )}
                            {sending && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                                    Advisor is typing...
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 border-t border-gray-100 px-6 py-4">
                            {initialPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => sendMessage(prompt)}
                                    className="rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage(input);
                            }}
                            className="flex items-center gap-3 border-t border-gray-100 px-6 py-4"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask your advisor anything..."
                                className="flex-1 rounded-full bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1e2a78]/20"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || sending}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7c3aed] text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl bg-gradient-to-br from-[#1e2a78] via-[#3730a3] to-[#0ea5e9] p-6 text-white shadow-sm">
                            <h2 className="text-base font-bold">Advisor Scope</h2>
                            <ul className="mt-4 space-y-2 text-sm text-white/90">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Course recommendations</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Career guidance</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Performance analysis</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4" /> Attendance and risk alerts</li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900">Recent Topics</h2>
                            <div className="mt-4 space-y-3">
                                {(history.slice(0, 5) as any[]).map((item) => (
                                    <button key={item.id} onClick={() => sendMessage(item.user_message)} className="flex w-full items-start gap-3 text-left hover:opacity-80">
                                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">{item.intent || "general"}</div>
                                            <div className="text-xs text-gray-400">{item.user_message.slice(0, 70)}</div>
                                        </div>
                                    </button>
                                ))}
                                {!history.length && <p className="text-sm text-gray-400">No history yet. Your sessions will appear here after chatting.</p>}
                            </div>
                        </div>

                        {quickReply && (
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
                                <div className="text-sm font-bold text-emerald-700">Suggested follow-up</div>
                                <button onClick={() => sendMessage(quickReply)} className="mt-2 text-left text-sm text-emerald-700 underline">
                                    {quickReply}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
