import './globals.css';

export const metadata = {
  title: 'Insight Capture Dashboard',
  description: 'View and manage your captured insights',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
