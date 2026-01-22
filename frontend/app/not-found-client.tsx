"use client";

import React from 'react';
import Link from 'next/link';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import styles from './not-found.module.css';

export default function NotFoundClient() {
    return (
        <div className={styles.container}>
            <div className={styles.lottieWrapper}>
                <DotLottieReact
                    src="https://lottie.host/16f79314-a280-45b5-ac82-449fdbf78891/bOt4lYEVm4.lottie"
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
