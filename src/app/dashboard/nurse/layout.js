import DashboardShell from '../../../components/DashboardShell';

export const metadata = { title: 'Nursing station — Sam Healthcare' };
const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/nurse', icon: 'LayoutDashboard' },
  { label: 'Patients', href: '/dashboard/nurse/patients', icon: 'HeartPulse' },
  { label: 'Medications', href: '/dashboard/nurse/medications', icon: 'Pill' },
  { label: 'Rounds', href: '/dashboard/nurse/rounds', icon: 'ClipboardCheck' },
];

export default function NurseLayout({ children }) {
  return (
    <DashboardShell roleLabel="Nurse" navItems={NAV_ITEMS} userName="Ayesha Bano" userInitials="AB">
      {children}
    </DashboardShell>
  );
}