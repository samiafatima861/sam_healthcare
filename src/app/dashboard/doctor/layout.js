import DashboardShell from '../../../components/DashboardShell';

export const metadata = { title: 'Doctor dashboard — Sam Healthcare' };

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/doctor', icon: 'LayoutDashboard' },
  { label: 'Schedule', href: '/dashboard/doctor/schedule', icon: 'CalendarClock' },
  { label: 'Patients', href: '/dashboard/doctor/patients', icon: 'Users' },
  { label: 'Prescriptions', href: '/dashboard/doctor/prescriptions', icon: 'Pill' },
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