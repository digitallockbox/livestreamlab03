import { Link, Outlet } from "react-router-dom";

export default function OperatorLayout() {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-6 space-y-4">
        <h1 className="text-xl font-bold">Operator Console</h1>

        <nav className="space-y-2">
          <Link to="engines" className="block hover:text-blue-400">Engines</Link>
          <Link to="blocks" className="block hover:text-blue-400">Blocks</Link>
          <Link to="volume" className="block hover:text-blue-400">Volume</Link>
          <Link to="streams" className="block hover:text-blue-400">Live Streams</Link>
          <Link to="autosplit" className="block hover:text-blue-400">AutoSplit</Link>
          <Link to="hulk" className="block hover:text-blue-400">HULK</Link>
          <Link to="signaltrust" className="block hover:text-blue-400">SignalTrust</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
