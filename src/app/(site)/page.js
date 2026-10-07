import Hero from '../../components/Hero';
import Footer from '../../components/Footer';

import QuickActions from '@/components/QuickActions';
import TrustStats from '@/components/TrustStats';
import Departments from '@/components/Departments';
import TopDoctors from '@/components/TopDoctors';
import Testimonials from '../../components/Testimonials';
import Partners from '../../components/Partners';
import WhyChooseUs from '@/components/WhyChooseUs';
import CtaBanner from '@/components/CtaBanner';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <QuickActions />
      <Departments />
      <TopDoctors />
      <TrustStats />
      <Testimonials />
     
      <WhyChooseUs />
       <Partners />
      <CtaBanner />
      <Footer />
    </main>
  );
}