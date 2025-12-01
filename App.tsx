
import React, { useState } from 'react';
import { User, UserRole } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FormBuilder from './components/FormBuilder';
import FormViewer from './components/FormViewer';
import FormResponses from './components/FormResponses';
import TeamManager from './components/TeamManager';
import SystemSettings from './components/SystemSettings';
import { getFormById } from './services/mockService';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';

// Simple view router state
type ViewState = 'LOGIN' | 'DASHBOARD' | 'BUILDER' | 'VIEWER' | 'RESPONSES' | 'TEAM_MANAGER' | 'SYSTEM_SETTINGS';

// Bravo Logo Component (Small)
const BravoLogoSmall = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 15 H65 C80 15, 85 25, 85 35 C85 45, 75 50, 65 50 H25 V15 Z" fill="#F58220" />
    <path d="M25 45 H65 C85 45, 90 55, 90 65 C90 75, 80 80, 70 80 H25 V45 Z" fill="#1E3A8A" />
    <path d="M25 75 H60 C75 75, 80 80, 80 85 C80 90, 70 95, 60 95 H25 V75 Z" fill="#00A859" />
  </svg>
);

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('LOGIN');
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('LOGIN');
    setSelectedFormId(null);
  };

  const handleCreateForm = () => {
    setSelectedFormId(null);
    setCurrentView('BUILDER');
  };

  const handleEditForm = (id: string) => {
    setSelectedFormId(id);
    setCurrentView('BUILDER');
  };

  const handleViewForm = (id: string) => {
    setSelectedFormId(id);
    setCurrentView('VIEWER');
  };

  const handleViewResponses = (id: string) => {
    setSelectedFormId(id);
    setCurrentView('RESPONSES');
  };
  
  const handleManageTeams = () => {
    setCurrentView('TEAM_MANAGER');
  };

  const handleCloseEditor = () => {
    setSelectedFormId(null);
    setCurrentView('DASHBOARD');
  };

  // Render logic
  if (!currentUser || currentView === 'LOGIN') {
    return <Login onLogin={handleLogin} />;
  }

  if (currentView === 'BUILDER') {
    const formData = selectedFormId ? getFormById(selectedFormId) : undefined;
    return <FormBuilder user={currentUser} initialData={formData} onClose={handleCloseEditor} />;
  }

  if (currentView === 'VIEWER' && selectedFormId) {
    const formData = getFormById(selectedFormId);
    if (!formData) return <div>Formulário não encontrado</div>;
    return <FormViewer form={formData} onClose={handleCloseEditor} />;
  }

  if (currentView === 'RESPONSES' && selectedFormId) {
    const formData = getFormById(selectedFormId);
    if (!formData) return <div>Formulário não encontrado</div>;
    return <FormResponses user={currentUser} form={formData} onClose={handleCloseEditor} />;
  }

  if (currentView === 'TEAM_MANAGER') {
    return <TeamManager onClose={handleCloseEditor} />;
  }

  if (currentView === 'SYSTEM_SETTINGS') {
      return <SystemSettings onClose={() => setCurrentView('DASHBOARD')} />
  }

  // Dashboard with Layout
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-blue-900 shadow-lg z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BravoLogoSmall className="w-8 h-8 mr-3" />
              <span className="text-2xl font-bold text-white tracking-tight">Bravo Forms</span>
              <span className="ml-4 px-3 py-1 rounded-full bg-blue-800 text-xs font-semibold text-blue-200 uppercase tracking-wide border border-blue-700">
                {currentUser.teamName}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
               {currentUser.role === UserRole.MASTER && (
                   <button 
                    onClick={() => setCurrentView('SYSTEM_SETTINGS')}
                    className="p-2 text-blue-300 hover:text-white transition-colors rounded-full hover:bg-blue-800"
                    title="Configurações do Sistema"
                   >
                       <Settings size={20}/>
                   </button>
               )}

               <div className="flex items-center text-sm text-blue-100">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white mr-2 shadow-sm overflow-hidden">
                     {currentUser.avatar.startsWith('http') ? (
                       <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
                     ) : (
                       <UserIcon size={16} />
                     )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold">{currentUser.name}</span>
                    <span className="text-[10px] text-blue-300 uppercase">
                        {currentUser.customRoleName || currentUser.role}
                    </span>
                  </div>
               </div>
               <div className="h-6 w-px bg-blue-800 mx-2"></div>
               <button 
                onClick={handleLogout}
                className="p-2 text-blue-300 hover:text-white transition-colors rounded-full hover:bg-blue-800"
                title="Sair"
               >
                 <LogOut size={20} />
               </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Dashboard 
          user={currentUser}
          onCreateForm={handleCreateForm}
          onEditForm={handleEditForm}
          onViewForm={handleViewForm}
          onViewResponses={handleViewResponses}
          onManageTeams={handleManageTeams}
        />
      </main>
    </div>
  );
}

export default App;
