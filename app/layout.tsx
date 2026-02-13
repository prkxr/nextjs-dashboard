import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: {
    template: '%s | Invoice Dashboard',
    default: 'Invoice Dashboard',
  },
  description: 'This app helps teams manage invoices, customers, and cash flow from a single dashboard',
  metadataBase: new URL('https://ledgerflow.app'),
};
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}