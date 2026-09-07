import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import LoadingIntro from "@/components/LoadingIntro";
import MiniLoader from "@/components/MiniLoader";
import ChatWidget from "@/components/ChatWidget";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import BoatDetail from "@/pages/BoatDetail";
import RoutesPage from "@/pages/Routes";
import Admin from "@/pages/AdminPanel";
import Legal from "@/pages/Legal";
import Portal from "@/pages/Portal";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const Shell = () => {
  const { pathname } = useLocation();
  const bare = pathname.startsWith('/portal');
  return (
    <>
      <ScrollToTop />
      {!bare && <><LoadingIntro /><MiniLoader /><ChatWidget /><Header /></>}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/barcos" element={<Catalog />} />
        <Route path="/barco/:id" element={<BoatDetail />} />
        <Route path="/rutas" element={<RoutesPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/portal/:token" element={<Portal />} />
        <Route path="*" element={<Home />} />
      </Routes>
      {!bare && <Footer />}
    </>
  );
};

function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
