import DashboardShell from '../../../components/DashboardShell';

export const metadata = { title: 'Laboratory — Sam Healthcare' };
const NAV_ITEMS = [{ label: 'Overview', href: '/dashboard/lab-tech', icon: 'LayoutDashboard' }];

export default function LabTechLayout({ children }) {
  return (
    <DashboardShell roleLabel="Lab Technician" navItems={NAV_ITEMS} userName="Sarah Malik" userInitials="SM">
      {children}
    </DashboardShell>
  );
}