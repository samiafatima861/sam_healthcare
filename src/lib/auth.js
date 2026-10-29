import { supabase } from './supabaseClient';

export const ROLE_HOME = {
  patient: '/portal',
  doctor: '/dashboard/doctor',
  admin: '/dashboard/admin',
  receptionist: '/dashboard/receptionist',
  billing: '/dashboard/billing',
  nurse: '/dashboard/nurse',
  pharmacist: '/dashboard/pharmacist',
  'lab-tech': '/dashboard/lab-tech',
  'ot-coordinator': '/dashboard/ot-coordinator',
};

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/login';
}