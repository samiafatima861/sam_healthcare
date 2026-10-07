import '../assets/styles/globals.css';

export const metadata = {
  title: 'Sam Healthcare — Hospital & specialist care, booked in minutes',
  description:
    'Sam Healthcare is a JCI-accredited hospital network. Book appointments with 40+ specialists across 14 departments.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}