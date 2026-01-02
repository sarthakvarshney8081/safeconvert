import { Metadata } from 'next';
import RSSValidatorClient from './RSSValidatorClient';

export const metadata: Metadata = {
    title: 'RSS Feed Validator | SafeConverts',
    description: 'Free online RSS and Atom feed validator. Check your XML syntax, feed version, and compatibility with standard readers.',
    alternates: {
        canonical: '/it-tools/rss-feed-validator'
    }
};

export default function RSSFeedValidatorPage() {
    return <RSSValidatorClient />;
}
