"use client";

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

    // One strip attached under the hero: four figures separated by thin rules.
    return (
        <section className="border-b border-slate-200 bg-white" aria-label="Learnink in numbers">
            <div className="container-page">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.id}
                            className={[
                                "flex items-center gap-4 py-7 sm:py-8",
                                // rules between items: vertical on desktop, a 2×2 grid on smaller screens
                                index % 2 === 1 ? "border-l border-slate-200 pl-5 sm:pl-8" : "pr-5",
                                index >= 2 ? "border-t border-slate-200 lg:border-t-0" : "",
                                index === 2 ? "lg:border-l lg:pl-8" : "",
                                index > 0 ? "lg:pl-8" : "",
                            ].join(" ")}
                        >
                            <span className="icon-tile hidden h-11 w-11 shrink-0 sm:flex">
                                <stat.icon size={20} />
                            </span>
                            <div>
                                <p className="text-3xl font-light tracking-tight text-primary sm:text-4xl">
                                    <CountUp value={stat.value} />
                                </p>
                                <p className="mt-0.5 text-sm font-semibold text-ink">{stat.label}</p>
                                <p className="hidden text-xs text-slate-500 md:block">{stat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
