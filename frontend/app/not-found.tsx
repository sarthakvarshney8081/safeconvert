import './globals.css';
import NotFoundClient from './not-found-client';

export const metadata = {
    title: 'Page Not Found',
};

export default function NotFound() {
    return (
        <html lang="en">
            <body>
                <NotFoundClient />
            </body>
        </html>
    );
}
