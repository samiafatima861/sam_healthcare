import Nav from '../../components/Nav';

export default function SiteLayout({ children }) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
}