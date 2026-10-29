import AuthGate from '../../../components/AuthGate';
import DashboardShell from '../../../components/DashboardShell';

export const metadata = { title: 'Admin dashboard — Sam Healthcare' };

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/admin', icon: 'LayoutDashboard' },
  { label: 'Staff', href: '/dashboard/admin/staff', icon: 'Users' },
  { label: 'Departments', href: '/dashboard/admin/departments', icon: 'Building2' },
  { label: 'Appointments', href: '/dashboard/admin/appointments', icon: 'CalendarClock' },
  { label: 'Revenue', href: '/dashboard/admin/revenue', icon: 'Wallet' },
  { label: 'Messages', href: '/dashboard/admin/messages', icon: 'Mail' },
];


export default function AdminLayout({ children }) {
  return (
    <AuthGate allow={['admin']}>
    <DashboardShell
      roleLabel="Super Admin"
      navItems={NAV_ITEMS}
      userName="Zainab Qureshi"
      userInitials="ZQ"
    >
      {children}
    </DashboardShell>
    </AuthGate>
  );
}