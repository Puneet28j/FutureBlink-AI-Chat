import { useState } from "react";
import { ReactFlowProvider } from "reactflow";
import { FlowProvider } from "./context/FlowContext";
import FlowCanvas from "./components/FlowCanvas";
import Sidebar from "./components/Sidebar";

function MainLayout({ sidebarOpen, onToggle }: { sidebarOpen: boolean; onToggle: () => void }) {
  return (
    <div className="relative flex flex-1 overflow-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 top-14 lg:top-0 h-full
          transform transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
          lg:relative lg:z-auto
          ${sidebarOpen 
            ? "translate-x-0 w-72 sm:w-80" 
            : "-translate-x-full w-72 sm:w-80 lg:translate-x-0 lg:w-16"}
        `}
      >
        <div className="h-full w-full min-w-16 flex flex-col overflow-hidden">
          <Sidebar onClose={onToggle} isCollapsed={!sidebarOpen} onToggleCollapse={onToggle} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden border-l border-zinc-800/50 bg-[#09090b] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
        <FlowCanvas />
      </div>
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);

  return (
    <div className="flex h-screen w-full flex-col bg-[#09090b] text-zinc-100 selection:bg-blue-500/20">
      <header className="relative z-50 flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-200 lg:hidden"
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarOpen ? (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <path d="M15 12H9" />
                  <path d="M11 9l-2 3 2 3" />
                </>
              ) : (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <path d="M9 12h6" />
                  <path d="M13 9l2 3-2 3" />
                </>
              )}
            </svg>
          </button>

          <div className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
            <svg className="h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </div>


          <h1 className="text-[15px] font-semibold tracking-wide text-zinc-100">
            FutureBlink
          </h1>
        </div>
      </header>

      <ReactFlowProvider>
        <FlowProvider>
          <MainLayout sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        </FlowProvider>
      </ReactFlowProvider>
    </div>
  );
}

export default App;