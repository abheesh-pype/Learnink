"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, GraduationCap, Lock, User, Loader2, ArrowRight, ShieldCheck, BarChart3, Sparkles } from "lucide-react";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        console.log("SignIn Result:", res); // Debug log

        if (res?.error) {
            console.error("SignIn Error:", res.error); // Debug log
            setError("Invalid credentials. Please verify your access.");
            setLoading(false);
        } else {
            console.log("SignIn Success, redirecting..."); // Debug log
            router.push("/admin");
        }
    };

    const inputClass =
        "w-full rounded-xl border-2 border-slate-200 bg-white py-3.5 pl-12 pr-4 font-medium text-ink placeholder:text-slate-400 transition-all focus:border-violet focus:outline-none focus:ring-4 focus:ring-violet/15";

    return (
        <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-2">
            {/* Brand panel */}
            <div className="bg-brand-gradient relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">

                <Link href="/" className="relative flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                        <GraduationCap size={24} />
                    </span>
                    <span className="text-xl font-extrabold tracking-tight">Learnink</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="relative max-w-md"
                >
                    <h2 className="text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
                        Manage your <span className="text-shimmer-light">education platform</span> with ease.
                    </h2>
                    <p className="mt-5 text-lg text-white/80">Programs, universities, enquiries and website content — all in one place.</p>

                    <ul className="mt-10 space-y-4">
                        {[
                            { icon: BarChart3, text: "Live dashboard of programs and enquiries" },
                            { icon: Sparkles, text: "Update website content instantly" },
                            { icon: ShieldCheck, text: "Secure admin-only access" },
                        ].map(({ icon: Icon, text }, i) => (
                            <motion.li
                                key={text}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
                                className="flex items-center gap-3"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                                    <Icon size={18} />
                                </span>
                                <span className="font-medium text-white/90">{text}</span>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>

                <p className="relative text-sm text-white/60">&copy; {new Date().getFullYear()} Learnink Education System</p>
            </div>

            {/* Form panel */}
            <div className="relative flex items-center justify-center overflow-hidden p-6 sm:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="relative w-full max-w-md"
                >
                    <div className="mb-10">
                        <span className="icon-tile mb-6 h-14 w-14">
                            <GraduationCap size={28} strokeWidth={1.75} />
                        </span>
                        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Admin Portal</h1>
                        <p className="mt-2 font-medium text-slate-500">Secure Access Dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600 animate-[fadeInUp_0.3s_ease-out_forwards]">
                                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <div className="group/input space-y-2">
                            <label htmlFor="login-username" className="text-sm font-semibold text-slate-600 transition-colors group-focus-within/input:text-violet">
                                Username
                            </label>
                            <div className="relative">
                                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/input:text-violet" />
                                <input
                                    id="login-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={inputClass}
                                    placeholder="Enter your ID"
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group/input space-y-2">
                            <label htmlFor="login-password" className="text-sm font-semibold text-slate-600 transition-colors group-focus-within/input:text-violet">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within/input:text-violet" />
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputClass.replace("pr-4", "pr-12")}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                    aria-controls="login-password"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary group/btn w-full py-4 text-base disabled:cursor-not-allowed">
                            {loading ? <Loader2 className="animate-spin" /> : <>Access Dashboard <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" /></>}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-sm font-medium text-slate-400">
                        <Link href="/" className="transition-colors hover:text-violet">← Back to website</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
