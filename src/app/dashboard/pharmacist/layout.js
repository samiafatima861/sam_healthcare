import AuthGate from '@/components/AuthGate';
import DashboardShell from '../../../components/DashboardShell';

export const metadata = { title: 'Pharmacy — Sam Healthcare' };
const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/pharmacist', icon: 'LayoutDashboard' },
  { label: 'Queue', href: '/dashboard/pharmacist/queue', icon: 'Pill' },
  { label: 'Inventory', href: '/dashboard/pharmacist/inventory', icon: 'PackageSearch' },
];

export default function PharmacistLayout({ children }) {
  return (
     <AuthGate allow={['pharmacist']}>
    <DashboardShell roleLabel="Pharmacist" navItems={NAV_ITEMS} userName="Kamran Yousuf" userInitials="KY">
      {children}
    </DashboardShell>
    </AuthGate>
  );
}