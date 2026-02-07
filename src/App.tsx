import { useState, useEffect } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { TreeView } from './components/TreeView';
import { Columns, TreePine } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'kanban' | 'tree'>(() => {
    const saved = localStorage.getItem('currentView');
    return (saved as 'home' | 'kanban' | 'tree') || 'home';
  });

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans flex flex-col h-screen overflow-hidden">
      
      <header className="flex items-center justify-between px-6 py-4 border-b border-indigo-100 bg-white shadow-sm relative z-10">
        <div className="flex-1">
          {currentView !== 'home' && (
            <button
              onClick={() => setCurrentView('home')}
              className="text-gray-500 hover:text-indigo-600 flex items-center gap-1 text-sm font-medium"
            >
              ← Back
            </button>
          )}
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setCurrentView('home')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium ${
            currentView === 'home' 
              ? 'bg-white text-indigo-700 shadow-sm' 
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
            Home
          </button>
        </div>

        <div className="flex-1" />
      </header>

      <main className="flex-1 overflow-hidden p-3 sm:p-6 bg-gray-50">
        <div className="h-full max-w-7xl mx-auto">
          {currentView === 'home' && (
            <div className="max-w-4xl mx-auto mt-4 sm:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 sm:mb-8 text-center">Select a Project</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div 
              onClick={() => setCurrentView('tree')}
              className="group bg-white p-6 sm:p-8 rounded-2xl border border-indigo-50 hover:border-indigo-200 shadow-sm hover:shadow-xl cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100" />
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10">
                    <TreePine className="text-indigo-600" size={24} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 relative z-10">Project 1</h3>
                  <p className="text-indigo-500 font-medium relative z-10">Tree View</p>
                  <p className="text-sm text-gray-400 mt-4 relative z-10">
                    {/* Recursive file explorer with lazy loading. */}
                  </p>
                </div>

                <div 
                  onClick={() => setCurrentView('kanban')}
                  className="group bg-white p-6 sm:p-8 rounded-2xl border border-blue-50 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform relative z-10">
                    <Columns className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 relative z-10">Project 2</h3>
                  <p className="text-blue-500 font-medium relative z-10">Kanban Board</p>
                  <p className="text-sm text-gray-400 mt-4 relative z-10">
                    {/* Drag & Drop task management with inline editing. */}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentView === 'tree' && (
            <div className="h-full max-w-xl mx-auto flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-slate-800">Project 1: Tree View</h2>
                {/* <p className="text-slate-500">Recursive file explorer with lazy loading</p> */}
              </div>
              <div className="flex-1 bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
                <TreeView />
              </div>
            </div>
          )}

          {currentView === 'kanban' && (
            <div className="h-full flex flex-col">
              <div className="mb-4 sm:mb-6 text-center flex-shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Project 2: Kanban Board</h2>
              </div>
              <div className="flex-1 overflow-hidden min-h-0">
                <KanbanBoard />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
// Last build trigger: 2026-02-07T21:30:00Z

