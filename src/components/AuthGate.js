'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { ROLE_HOME } from '../lib/auth';

export default function AuthGate({ allow, children }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const allowKey = allow.join(',');

  useEffect(() => {
    let active = true;
    const allowed = allowKey.split(',');

    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      const role = profile?.role || 'patient';

      if (!allowed.includes(role)) {
        router.replace(ROLE_HOME[role] || '/portal');
        return;
      }
      if (active) setOk(true);
    }

    check();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/login');
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [allowKey, router]);

  if (!ok) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>
        Checking your access...
      </div>
    );
  }

  return children;
}