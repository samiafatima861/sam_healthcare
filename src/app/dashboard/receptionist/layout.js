import DashboardShell from '../../../components/DashboardShell';

export const metadata = { title: 'Receptionist dashboard — Sam Healthcare' };

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/receptionist', icon: 'LayoutDashboard' },
  { label: 'Queue', href: '/dashboard/receptionist/queue', icon: 'CalendarClock' },
  { label: 'Doctors', href: '/dashboard/receptionist/doctors', icon: 'Users' },
  { label: 'Payments', href: '/dashboard/receptionist/payments', icon: 'Wallet' },
];
export default function ReceptionistLayout({ children }) {
  return (
    <DashboardShell
      roleLabel="Receptionist"
      navItems={NAV_ITEMS}
      userName="Fatima Noor"
      userInitials="FN"
    >
      {children}
    </DashboardShell>
  );
}