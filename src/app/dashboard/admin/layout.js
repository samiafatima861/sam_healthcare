import DashboardShell from '../../../components/DashboardShell';

export const metadata = { title: 'Admin dashboard — Sam Healthcare' };

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/admin', icon: 'LayoutDashboard' },
  { label: 'Staff', href: '/dashboard/admin/staff', icon: 'Users' },
  { label: 'Departments', href: '/dashboard/admin/departments', icon: 'Building2' },
  { label: 'Revenue', href: '/dashboard/admin/revenue', icon: 'Wallet' },
  { label: 'Activity', href: '/dashboard/admin/activity', icon: 'Activity' },
];


export default function AdminLayout({ children }) {
  return (
    <DashboardShell
      roleLabel="Super Admin"
      navItems={NAV_ITEMS}
      userName="Zainab Qureshi"
      userInitials="ZQ"
    >
      {children}
    </DashboardShell>
  );
}