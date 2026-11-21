"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, Globe, Award } from "lucide-react";
import { DEFAULT_CONTACT, type ContactInfo } from "@/lib/contact";

type StatNumbers = Pick<ContactInfo, "studentsCount" | "coursesCount" | "universitiesCount" | "yearsCount">;

/** Homepage stats. The numbers are edited in Admin → Contact → Numbers. */
export default function Stats({ numbers = DEFAULT_CONTACT }: { numbers?: StatNumbers }) {
    const stats = [
        {
            id: 1,
            label: "Active Students",
            value: numbers.studentsCount,
            icon: Users,
            desc: "Trust Learnink for their education"
        },
        {
            id: 2,
            label: "Courses Offered",
            value: numbers.coursesCount,
            icon: BookOpen,
            desc: "Across various disciplines"
        },
        {
            id: 3,
            label: "University Partners",
            value: numbers.universitiesCount,
            icon: Globe,
            desc: "Accredited universities worldwide"
        },
        {
            id: 4,
            label: "Years of Excellence",
            value: numbers.yearsCount,
            icon: Award,
            desc: "Shaping careers in education"
        },
    ];

    return (
        <section className="relative z-10 bg-white">
            <div className="container-page">
                <div className="-mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-xl shadow-primary/5 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.id}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08 }}
                            className="flex items-start gap-4 bg-white p-5 sm:p-7"
                        >
                            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary sm:flex">
                                <stat.icon size={24} />
                            </span>
                            <div>
                                <p className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">{stat.value}</p>
                                <p className="mt-1 text-sm font-semibold text-ink">{stat.label}</p>
                                <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">{stat.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
