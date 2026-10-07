import DashboardShell from '../../../components/DashboardShell';

export const metadata = { title: 'Doctor dashboard — Sam Healthcare' };

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/doctor', icon: 'LayoutDashboard' },
];

export default function DoctorLayout({ children }) {
  return (
    <DashboardShell
      roleLabel="Doctor"
      navItems={NAV_ITEMS}
      userName="Dr. Arjun Mehta"
      userInitials="AM"
    >
      {children}
    </DashboardShell>
  );
}