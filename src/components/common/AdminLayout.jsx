import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#eaeded] text-[#111827]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col md:pl-72">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
