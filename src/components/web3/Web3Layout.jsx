import { Outlet } from "react-router-dom";
import CreatorSidebar from "./CreatorSidebar";

export default function Web3Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      <CreatorSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}