import React from "react";
import { ExternalLink, Github, Linkedin, Mail, Phone } from "lucide-react";

const contactItems = [
  {
    label: "Portfolio",
    value: "moad.dev",
    href: "https://moad.dev",
    icon: ExternalLink,
  },
  {
    label: "LinkedIn",
    value: "mouad-hamideddine",
    href: "https://www.linkedin.com/in/mouad-hamideddine/",
    icon: Linkedin,
  },
  {
    label: "GitHub",
    value: "hamideddinemouad",
    href: "https://github.com/hamideddinemouad",
    icon: Github,
  },
  {
    label: "Email",
    value: "hamideddinemouad@gmail.com",
    href: "mailto:hamideddinemouad@gmail.com",
    icon: Mail,
  },
  {
    label: "Phone",
    value: "0637.27.55.11",
    href: "tel:0637275511",
    icon: Phone,
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-red-100 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-300">
              Built by Mouad Hamideddine
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Connect with the builder behind blood donation platform.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Portfolio, socials, and direct contact are all here in one place.
            </p>
            <a
              href="https://moad.dev"
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-red-100"
            >
              Visit moad.dev
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-3">
            {contactItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition-colors hover:border-red-300/40 hover:bg-white/10"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                        {item.label}
                      </p>
                      <p className="truncate text-sm font-semibold text-white">
                        {item.value}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-slate-500 transition-colors group-hover:text-red-300" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-slate-400">
          © 2026 blood donation platform
        </div>
      </div>
    </footer>
  );
};

export default Footer;
