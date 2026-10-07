import DashboardShell from '../../components/DashboardShell';

export const metadata = { title: 'Patient portal — Sam Healthcare' };

const NAV_ITEMS = [
  { label: 'Overview', href: '/portal', icon: 'LayoutDashboard' },
  { label: 'Appointments', href: '/portal/appointments', icon: 'CalendarClock' },
  { label: 'Lab reports', href: '/portal/lab-reports', icon: 'FlaskConical' },
  { label: 'Prescriptions', href: '/portal/prescriptions', icon: 'Pill' },
  { label: 'Patient History', href: '/portal/history', icon: 'ClipboardList' },
  { label: 'Billing', href: '/portal/billing', icon: 'Wallet' },
];

export default function PortalLayout({ children }) {
  return (
    <DashboardShell
      roleLabel="Patient portal"
      navItems={NAV_ITEMS}
      userName="Ahsan Raza"
      userInitials="AR"
    >
      {children}
    </DashboardShell>
  );
}