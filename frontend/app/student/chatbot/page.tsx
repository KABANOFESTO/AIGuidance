"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Briefcase, Check, MessageSquare, Send, Sparkles, User, RefreshCw, Bot, Lightbulb, ShieldCheck, ArrowRight } from "lucide-react";
import { useGetChatHistoryQuery, useSendChatMessageMutation } from "@/lib/redux/slices/ChatbotSlice";
import { toast } from "sonner";

type ChatRole = "bot" | "user";

type ChatMessage = {
    id: string;
    role: ChatRole;
    text: string;
    time: string;
};

type ChatSuggestion = {
    question: string;
    answer: string;
    category: string;
};

type ChatbotResponse = {
    session_id?: string;
    response?: string;
    suggestions?: ChatSuggestion[];
    follow_ups?: string[];
    next_action?: string;
    intent?: string;
    confidence?: number;
    response_mode?: string;
    mode_label?: string;
};

const RESPONSE_MODES = [
    { value: "short", label: "Short" },
    { value: "medium", label: "Medium" },
    { value: "detailed", label: "Detailed" },
] as const;

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
            <Bot className="h-4 w-4" />
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
            <div className={`flex max-w-[78%] items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                {isUser ? <UserAvatar /> : <BotAvatar />}
                <div>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${isUser ? "rounded-br-md bg-[#1e2a78] text-white" : "rounded-bl-md border border-gray-100 bg-white text-gray-800"}`}>
                        {message.text}
                    </div>
                    <div className={`mt-1.5 text-xs text-gray-400 ${isUser ? "text-right" : "text-left"}`}>{message.time}</div>
                </div>
            </div>
        </div>
    );
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {icon}
                {label}
            </div>
            <div className="mt-2 text-lg font-bold text-gray-900">{value}</div>
        </div>
    );
}

export default function AiAcademicAdvisorPage() {
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
    const [followUps, setFollowUps] = useState<string[]>([]);
    const [relatedAnswers, setRelatedAnswers] = useState<ChatSuggestion[]>([]);
    const [lastMeta, setLastMeta] = useState<{ intent?: string; confidence?: number; next_action?: string; mode_label?: string }>({});
    const [responseMode, setResponseMode] = useState<"short" | "medium" | "detailed">("medium");
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

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || sending) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setLocalMessages((prev) => [...prev, { id: `tmp-u-${Date.now()}`, role: "user", text: trimmed, time: timestamp }]);
        setInput("");

        try {
            const response = await sendChatMessage({ message: trimmed, session_id: sessionId, response_mode: responseMode }).unwrap() as ChatbotResponse;
            setSessionId(response.session_id ?? sessionId);
            setLastMeta({ intent: response.intent, confidence: response.confidence, next_action: response.next_action, mode_label: response.mode_label });
            setLocalMessages((prev) => [
                ...prev,
                {
                    id: `tmp-b-${Date.now()}`,
                    role: "bot",
                    text: response.response ?? "I have generated a response, but it came back empty.",
                    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
            ]);
            setFollowUps(Array.isArray(response.follow_ups) ? response.follow_ups : []);
            setRelatedAnswers(Array.isArray(response.suggestions) ? response.suggestions : []);
            refetch();
        } catch {
            toast.error("Unable to reach the advisor service right now.");
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
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,42,120,0.07),_transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#1e2a78]/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#1e2a78] shadow-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                            AI advisor
                        </div>
                        <h1 className="mt-3 text-3xl font-bold text-gray-900">Academic Chatbot</h1>
                        <p className="mt-1 text-sm text-gray-500">Live answers from your academic profile, knowledge base, course recommendations, and performance data.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <InfoPill icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Messages" value={String(history.length)} />
                        <InfoPill icon={<Lightbulb className="h-3.5 w-3.5" />} label="Intent" value={lastMeta.intent || "ready"} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="flex h-[780px] flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-slate-200/60">
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-white to-slate-50 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <BotAvatar />
                                <div>
                                    <div className="text-sm font-bold text-gray-900">AI Advisor</div>
                                    <div className="text-xs text-gray-400">Connected to your student record</div>
                                </div>
                            </div>
                            <button onClick={() => refetch()} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                                <RefreshCw className="mr-1 inline h-3.5 w-3.5" />
                                Refresh
                            </button>
                        </div>

                        <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                            {messages.length ? messages.map((m) => <MessageBubble key={m.id} message={m} />) : (
                                <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
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

                        <div className="border-t border-gray-100 bg-slate-50 px-6 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Response mode</span>
                                {RESPONSE_MODES.map((mode) => (
                                    <button
                                        key={mode.value}
                                        type="button"
                                        onClick={() => setResponseMode(mode.value)}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${responseMode === mode.value ? "bg-[#1e2a78] text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
                                    >
                                        {mode.label}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {initialPrompts.map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => sendMessage(prompt)}
                                        className="rounded-full border border-blue-100 bg-white px-3.5 py-1.5 text-xs font-medium text-blue-700 shadow-sm hover:bg-blue-50"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {lastMeta.next_action && (
                            <div className="border-t border-gray-100 bg-white px-6 py-4">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    <ArrowRight className="h-3.5 w-3.5" />
                                    Recommended next action
                                </div>
                                <p className="mt-2 text-sm text-gray-700">{lastMeta.next_action}</p>
                            </div>
                        )}

                        {followUps.length > 0 && (
                            <div className="border-t border-gray-100 bg-white px-6 py-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">Suggested follow-ups</div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {followUps.map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => sendMessage(item)}
                                            className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage(input);
                            }}
                            className="flex items-center gap-3 border-t border-gray-100 bg-white px-6 py-4"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask your advisor anything..."
                                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#1e2a78]/30 focus:ring-4 focus:ring-[#1e2a78]/10"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || sending}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1e2a78] text-white transition hover:bg-[#16205c] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2 text-[#1e2a78]">
                                <Briefcase className="h-4 w-4" />
                                <h2 className="text-base font-bold">Advisor scope</h2>
                            </div>
                            <ul className="mt-4 space-y-3 text-sm text-gray-700">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Course recommendations</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Career guidance</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Performance analysis</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Attendance and risk alerts</li>
                            </ul>
                        </div>

                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900">Response summary</h2>
                            <div className="mt-4 grid grid-cols-1 gap-3">
                                <div className="rounded-2xl border border-gray-100 bg-slate-50 p-4">
                                    <div className="text-xs uppercase tracking-wide text-gray-400">Mode</div>
                                    <div className="mt-1 text-sm font-semibold text-gray-900">{lastMeta.mode_label || RESPONSE_MODES.find((item) => item.value === responseMode)?.label}</div>
                                </div>
                                <div className="rounded-2xl border border-gray-100 bg-slate-50 p-4">
                                    <div className="text-xs uppercase tracking-wide text-gray-400">Intent</div>
                                    <div className="mt-1 text-sm font-semibold text-gray-900">{lastMeta.intent || "general"}</div>
                                </div>
                                <div className="rounded-2xl border border-gray-100 bg-slate-50 p-4">
                                    <div className="text-xs uppercase tracking-wide text-gray-400">Confidence</div>
                                    <div className="mt-1 text-sm font-semibold text-gray-900">{lastMeta.confidence ? `${Math.round(Number(lastMeta.confidence) * 100)}%` : "--"}</div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900">Related answers</h2>
                            <div className="mt-4 space-y-3">
                                {relatedAnswers.slice(0, 3).map((item) => (
                                    <div key={item.question} className="rounded-2xl border border-gray-100 bg-slate-50 p-4">
                                        <div className="text-sm font-semibold text-gray-900">{item.question}</div>
                                        <div className="mt-1 text-xs font-medium uppercase tracking-wide text-[#1e2a78]">{item.category}</div>
                                        <p className="mt-2 text-sm text-gray-700">{item.answer}</p>
                                    </div>
                                ))}
                                {!relatedAnswers.length && <p className="text-sm text-gray-400">Related knowledge base answers will appear here.</p>}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900">Recent topics</h2>
                            <div className="mt-4 space-y-3">
                                {(history.slice(0, 5) as any[]).map((item) => (
                                    <button key={item.id} onClick={() => sendMessage(item.user_message)} className="flex w-full items-start gap-3 rounded-2xl border border-transparent p-2 text-left transition hover:border-gray-100 hover:bg-gray-50">
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
                    </div>
                </div>
            </div>
        </main>
    );
}
