import DoctorPatientVisit from '../../../../../components/dashboards/doctor/DoctorPatientVisit';

export default async function Page({ params }) {
  const { id } = await params;
  return <DoctorPatientVisit appointmentId={id} />;
}