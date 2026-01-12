"use client";

import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import styles from './not-found.module.css';

export default function NotFoundClient() {
    return (
        <div className={styles.container}>
            <Script
                src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs"
                type="module"
                strategy="lazyOnload"
            />
            <div className={styles.lottieWrapper}>
                {/* @ts-ignore */}
                <dotlottie-player
                    src="https://lottie.host/43aa1a61-9490-4f18-a596-f6ef52d7c476/LpQIZQdZBI.lottie"
                    background="transparent"
                    speed="1"
                    loop
                    autoplay
                />
            </div>
            <div style={{ padding: '0 1rem' }}>
                <h1 className={styles.title}>Page Not Found</h1>
                <p className={styles.description}>
                    Oops! The page you are looking for does not exist.
                </p>
                <Link href="/">
                    <button className={styles.homeButton}>
                        Go Home
                    </button>
                </Link>
            </div>
        </div>
    );
}
