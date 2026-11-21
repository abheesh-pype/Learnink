"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2, Clock, MessageCircle, Users, BookOpen, ArrowRight, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_CONTACT, telHref, type ContactInfo } from "@/lib/contact";
import SectionHeader from "@/components/ui/SectionHeader";
import CountUp from "@/components/ui/CountUp";

interface ProgramOption {
    _id: string;
    title: string;
    createdAt: string;
}

export default function Contact({ info: contact = DEFAULT_CONTACT }: { info?: ContactInfo }) {
    const [programs, setPrograms] = useState<ProgramOption[]>([]);
    const [programsLoading, setProgramsLoading] = useState(true);

    // Program options come from the programs created in Admin → Programs.
    useEffect(() => {
        fetch("/api/programs")
            .then((res) => (res.ok ? res.json() : []))
            .then((data: ProgramOption[]) => {
                // Oldest first, so newly added programs appear at the end of the list.
                setPrograms([...data].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
            })
            .catch(() => setPrograms([]))
            .finally(() => setProgramsLoading(false));
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        interest: "",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/enquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert("Thank you! Your enquiry has been submitted. We will contact you shortly.");
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    interest: "",
                    message: ""
                });
            } else {
                throw new Error("Failed to submit");
            }
        } catch {
            alert("Something went wrong. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const contactInfo = [
        {
            icon: Phone,
            title: "Call Us",
            subtitle: contact.phoneHours,
            value: contact.phone,
            href: telHref(contact.phone),
            color: ""
        },
        {
            icon: Mail,
            title: "Email Us",
            subtitle: contact.emailNote,
            value: contact.email,
            href: `mailto:${contact.email}`,
            color: ""
        },
        {
            icon: MapPin,
            title: "Visit Us",
            subtitle: contact.visitNote,
            value: contact.visitLocation,
            // Opens the map link if one is set, otherwise a Google Maps search for the address.
            href: contact.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${contact.hqName}, ${contact.hqAddress.replace(/\n/g, ", ")}`)}`,
            external: true,
            color: ""
        }
    ];

    const fieldClass =
        "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";
    const labelClass = "text-sm font-semibold text-ink";

    return (
        <section id="contact" className="section overflow-hidden bg-primary-50">
            <div className="glow-blob -left-40 top-20 h-96 w-96 bg-violet/15" aria-hidden="true" />
            <div className="glow-blob -right-40 bottom-20 h-96 w-96 bg-glow/10 [animation-delay:-7s]" aria-hidden="true" />
            <div className="container-page relative">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <SectionHeader
                        as="h1"
                        eyebrow="Get in Touch"
                        title={<>Let&apos;s Start Your <span className="text-primary">Journey</span></>}
                        lead="Have questions about our programs? Our expert counselors are here to guide you every step of the way."
                    />
                </motion.div>

                {/* Primary Contact Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 lg:mt-16"
                >
                    {contactInfo.map((info, index) => (
                        <a
                            key={index}
                            href={info.href}
                            {...("external" in info && info.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="card card-hover group flex items-start gap-4 p-6"
                        >
                            <span className={`icon-tile h-12 w-12 shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${info.color}`}>
                                <info.icon size={22} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <h2 className="font-semibold text-ink">{info.title}</h2>
                                <p className="text-sm text-slate-500">{info.subtitle}</p>
                                <p className="mt-3 flex items-center gap-2 truncate font-semibold text-primary">
                                    <span className="truncate">{info.value}</span>
                                    <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" />
                                </p>
                            </div>
                        </a>
                    ))}
                </motion.div>

                {/* Form + sidebar */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Enquiry form */}
                    <motion.div
                        id="enquiry-form"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="card scroll-mt-28 p-6 sm:p-8 lg:col-span-7 lg:p-10"
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary">
                                <MessageCircle size={20} />
                            </span>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Message Us</p>
                                <h2 className="text-2xl font-bold text-ink">Send an Enquiry</h2>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-500">Fill out the form below and ours admissions team will get back to you.</p>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label htmlFor="enquiry-name" className={labelClass}>Full Name</label>
                                    <input
                                        id="enquiry-name"
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="John Doe"
                                        className={fieldClass}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="enquiry-phone" className={labelClass}>Phone</label>
                                    <input
                                        id="enquiry-phone"
                                        required
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        type="tel"
                                        placeholder="+91..."
                                        className={fieldClass}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label htmlFor="enquiry-email" className={labelClass}>Email</label>
                                    <input
                                        id="enquiry-email"
                                        required
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        placeholder="you@example.com"
                                        className={fieldClass}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="enquiry-program" className={labelClass}>Program</label>
                                    <div className="relative">
                                        <select
                                            id="enquiry-program"
                                            name="interest"
                                            value={formData.interest}
                                            onChange={handleChange}
                                            required
                                            disabled={programsLoading || programs.length === 0}
                                            className={`${fieldClass} cursor-pointer appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-60`}
                                        >
                                            <option value="" disabled className="text-slate-500">
                                                {programsLoading
                                                    ? "Loading programs..."
                                                    : programs.length
                                                        ? "Select a program"
                                                        : "No programs available"}
                                            </option>
                                            {programs.map((program) => (
                                                <option key={program._id} value={program.title}>
                                                    {program.title}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="enquiry-message" className={labelClass}>Message</label>
                                <textarea
                                    id="enquiry-message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Tell us about your educational goals..."
                                    className={`${fieldClass} resize-none`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full py-3.5 text-base disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Submit
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.aside
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col gap-6 lg:col-span-5"
                    >
                        {/* Address Card */}
                        <div className="relative overflow-hidden rounded-2xl bg-primary-darker p-6 text-white sm:p-8">
                            <div className="glow-blob -right-16 -top-16 h-48 w-48 bg-violet/40" aria-hidden="true" />
                            <div className="relative flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                                    <MapPin size={20} />
                                </span>
                                <h2 className="text-lg font-semibold">Headquarters</h2>
                            </div>
                            <p className="relative mt-4 whitespace-pre-line text-sm leading-relaxed text-white/75">
                                {contact.hqName}
                                {"\n"}
                                {contact.hqAddress}
                            </p>
                            <div className="relative mt-6 flex items-center gap-2 border-t border-white/10 pt-5 text-sm text-white/70">
                                <Clock size={16} />
                                <span>{contact.hqHours}</span>
                            </div>
                        </div>

                        {/* Admission Status */}
                        <div className="bg-brand-gradient relative overflow-hidden rounded-2xl p-6 text-white shadow-xl shadow-violet/25 sm:p-8">
                            <GraduationCap className="absolute -bottom-4 -right-4 text-white/10 animate-float-slow" size={120} aria-hidden="true" />
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">Admissions</h2>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                                        Live
                                    </span>
                                </div>
                                <p className="mt-4 text-2xl font-bold">{contact.admissionsTitle}</p>
                                <p className="mt-1 text-sm text-white/80">
                                    {contact.admissionsText}
                                </p>
                                <a href="#enquiry-form" className="btn-light mt-6 w-full">
                                    Apply Now <ArrowRight size={16} />
                                </a>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="card card-hover group p-5">
                                <span className="icon-tile h-10 w-10 transition-transform duration-300 group-hover:rotate-6">
                                    <Users size={20} />
                                </span>
                                <p className="mt-3 text-2xl font-extrabold"><span className="text-shimmer"><CountUp value={contact.studentsCount} /></span></p>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Happy Students</p>
                            </div>
                            <div className="card card-hover group p-5">
                                <span className="icon-tile h-10 w-10 transition-transform duration-300 group-hover:rotate-6">
                                    <BookOpen size={20} />
                                </span>
                                <p className="mt-3 text-2xl font-extrabold"><span className="text-shimmer"><CountUp value={contact.universitiesCount} /></span></p>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Universities</p>
                            </div>
                        </div>
                    </motion.aside>
                </div>
            </div>
        </section>
    );
}
