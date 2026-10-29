import AuthGate from '@/components/AuthGate';
import DashboardShell from '../../../components/DashboardShell';

export const metadata = { title: 'Laboratory — Sam Healthcare' };
const NAV_ITEMS = [{ label: 'Overview', href: '/dashboard/lab-tech', icon: 'LayoutDashboard' }];

export default function LabTechLayout({ children }) {
  return (
    <AuthGate allow={['lab-tech']}>
    <DashboardShell roleLabel="Lab Technician" navItems={NAV_ITEMS} userName="Sarah Malik" userInitials="SM">
      {children}
    </DashboardShell>
    </AuthGate>
  );
}