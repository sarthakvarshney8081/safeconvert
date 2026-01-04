"use client";

import { Instagram, Linkedin, Facebook } from 'lucide-react';
import React from 'react';

// Custom X (Twitter) Logo Component
const XLogo = ({ size = 20, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        stroke="currentColor"
        strokeWidth="0"
        fill="currentColor"
        {...props}
    >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export default function SocialLinks() {
    const socialLinks = [
        { icon: Instagram, href: "https://www.instagram.com/safeconverts/", color: "#E1306C" },
        { icon: Linkedin, href: "https://www.linkedin.com/company/safeconverts/", color: "#0077B5" },
        { icon: XLogo, href: "https://x.com/SafeConverts", color: "#000000" },
        { icon: Facebook, href: "https://www.facebook.com/safeconverts", color: "#4267B2" },
    ];

    return (
        <div style={{ display: 'flex', gap: '12px', marginTop: '25px' }}>
            {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                    <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon-link"
                        style={{
                            color: '#a1a1aa', // Muted text for dark mode
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255, 255, 255, 0.05)', // Glassmorphism
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.background = social.color === "#000000" ? "#000" : social.color; // Handle X black specially if needed, but on dark bg black might hide. X usually uses white on dark.
                            // Logic check: If background is dark, X logo black background is fine if icon is white.
                            if (social.href.includes("x.com")) {
                                e.currentTarget.style.background = "#fff"; // White bg for X on dark mode
                                e.currentTarget.style.color = "#000"; // Black icon
                            } else {
                                e.currentTarget.style.background = social.color;
                            }
                            e.currentTarget.style.borderColor = social.color;
                            e.currentTarget.style.transform = 'translateY(-3px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.color = '#a1a1aa';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        aria-label={`Visit our ${social.href} page`}
                    >
                        <Icon size={18} />
                    </a>
                );
            })}
        </div>
    );
}
