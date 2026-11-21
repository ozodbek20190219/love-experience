import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Templates from './pages/Templates.jsx';
import { HowItWorks, FAQ, Contact, NotFound } from './pages/Static.jsx';
const Demo = lazy(() => import('./pages/Demo.jsx'));
const Loading = () => <div className="min-h-[60vh] grid place-items-center text-mute" role="status">Yuklanmoqda…</div>;
export default function App() {
  const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <Suspense fallback={<Loading />}><Routes>
    <Route path="/demo/:id" element={<Demo />} /><Route path="/s/:code" element={<Demo />} />
    <Route element={<Layout />}><Route index element={<Home />} /><Route path="/shablonlar" element={<Templates />} /><Route path="/jarayon" element={<HowItWorks />} />
      <Route path="/faq" element={<FAQ />} /><Route path="/aloqa" element={<Contact />} />
      <Route path="/buyurtma" element={<Navigate to="/aloqa" replace />} /><Route path="/narxlar" element={<Navigate to="/aloqa" replace />} />
      <Route path="*" element={<NotFound />} /></Route>
  </Routes></Suspense>;
}
