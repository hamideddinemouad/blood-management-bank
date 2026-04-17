import { Outlet } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
