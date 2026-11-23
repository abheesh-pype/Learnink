"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, Globe, Award } from "lucide-react";
import { DEFAULT_CONTACT, type ContactInfo } from "@/lib/contact";
import CountUp from "@/components/ui/CountUp";

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
        <section className="relative bg-white py-12 lg:py-16">
            <div className="container-page">
                <div>
                    {/* Separate cards (same style as the Programs cards), no frame, placed below the hero */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                className="card card-hover group p-5 text-center sm:p-7"
                            >
                                <span className="icon-tile mx-auto h-12 w-12 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-6">
                                    <stat.icon size={22} />
                                </span>
                                <p className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                                    <span className="text-shimmer"><CountUp value={stat.value} /></span>
                                </p>
                                <p className="mt-1 text-sm font-semibold text-ink">{stat.label}</p>
                                <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">{stat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
