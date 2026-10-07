import DashboardShell from '../../../components/DashboardShell';

export const metadata = { title: 'OT coordination — Sam Healthcare' };
const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard/ot-coordinator', icon: 'LayoutDashboard' },
  { label: 'Schedule', href: '/dashboard/ot-coordinator/schedule', icon: 'CalendarClock' },
  { label: 'Rooms', href: '/dashboard/ot-coordinator/rooms', icon: 'DoorOpen' },
];

export default function OtCoordinatorLayout({ children }) {
  return (
    <DashboardShell roleLabel="OT Coordinator" navItems={NAV_ITEMS} userName="Junaid Iqbal" userInitials="JI">
      {children}
    </DashboardShell>
  );
}