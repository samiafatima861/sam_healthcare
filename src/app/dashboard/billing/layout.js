import DashboardShell from '../../../components/DashboardShell';

export const metadata = { title: 'Billing desk — Sam Healthcare' };

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/billing', icon: 'LayoutDashboard' },
  { label: 'Invoices', href: '/dashboard/billing/invoices', icon: 'Receipt' },
  { label: 'Insurance claims', href: '/dashboard/billing/claims', icon: 'ShieldCheck' },
];

export default function BillingDeskLayout({ children }) {
  return (
    <DashboardShell
      roleLabel="Billing"
      navItems={NAV_ITEMS}
      userName="Usman Ali"
      userInitials="UA"
    >
      {children}
    </DashboardShell>
  );
}