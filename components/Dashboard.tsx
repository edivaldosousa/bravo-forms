
import React, { useState, useEffect } from 'react';
import { Form, User, UserRole, Template, FormElement } from '../types';
import { getFormsByTeam, deleteForm, saveForm, saveImportedResponses, MOCK_THEMES } from '../services/mockService';
import { Plus, FileText, MoreVertical, Edit2, Trash2, Eye, Calendar, Users, Lock, BarChart3, Settings, Layout, Download } from 'lucide-react';
import TemplateGallery from './TemplateGallery';
import ImportWizard from './ImportWizard';

interface DashboardProps {
  user: User;
  onCreateForm: () => void;
  onEditForm: (formId: string) => void;
  onViewForm: (formId: string) => void;
  onViewResponses: (formId: string) => void;
  onManageTeams: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onCreateForm, 
  onEditForm, 
  onViewForm, 
  onViewResponses,
  onManageTeams
}) => {
  const [teamForms, setTeamForms] = useState<Form[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  
  // New Modals State
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);

  useEffect(() => {
    setTeamForms(getFormsByTeam(user.teamId));
  }, [user]);

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este formulário?')) {
      deleteForm(id);
      setTeamForms(getFormsByTeam(user.teamId));
    }
  };

  const handleTemplateSelect = (template: Template) => {
    // Create new form from template
    const newForm: Form = {
        id: Math.random().toString(36).substr(2, 9),
        title: template.title,
        description: template.description,
        teamId: user.teamId,
        elements: template.elements.map(el => ({ ...el, id: Math.random().toString(36).substr(2, 9) })), // New IDs
        status: 'rascunho',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        collaborators: [],
        theme: template.theme || MOCK_THEMES[0].theme // Use template theme or default
    };
    saveForm(newForm);
    setTeamForms(getFormsByTeam(user.teamId));
    setShowTemplateGallery(false);
    onEditForm(newForm.id); // Open editor immediately
  };

  const handleImport = (title: string, elements: FormElement[], responses?: Record<string, any>[]) => {
      const formId = Math.random().toString(36).substr(2, 9);
      
      const newForm: Form = {
        id: formId,
        title: title,
        description: 'Importado automaticamente via Bravo Import',
        teamId: user.teamId,
        elements: elements,
        status: 'rascunho',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        collaborators: []
    };
    
    saveForm(newForm);
    
    // Import Responses if any
    if (responses && responses.length > 0) {
        saveImportedResponses(formId, responses);
        alert(`${responses.length} respostas foram importadas com sucesso!`);
    }

    setTeamForms(getFormsByTeam(user.teamId));
    setShowImportWizard(false);
    
    // If we imported responses, maybe show responses view instead of editor? 
    // Usually user wants to verify structure first.
    onEditForm(newForm.id);
  };

  const canCreate = user.role === UserRole.MANAGER || user.role === UserRole.EDITOR || user.role === UserRole.MASTER;
  const canEdit = user.role === UserRole.MANAGER || user.role === UserRole.EDITOR || user.role === UserRole.MASTER;
  const canDelete = user.role === UserRole.MANAGER || user.role === UserRole.MASTER;
  const isMaster = user.role === UserRole.MASTER;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Modals */}
      {showTemplateGallery && <TemplateGallery onSelect={handleTemplateSelect} onClose={() => setShowTemplateGallery(false)} />}
      {showImportWizard && <ImportWizard onImport={handleImport} onClose={() => setShowImportWizard(false)} />}

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">
            {isMaster ? 'Visão Global da Plataforma' : 'Formulários do Time'}
          </h1>
          <p className="text-slate-500 mt-1 flex items-center font-medium">
             <Users className="w-4 h-4 mr-2 text-orange-500" />
             Workspace: {user.teamName}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {isMaster && (
            <button
              onClick={onManageTeams}
              className="flex items-center justify-center bg-blue-900 hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all font-bold tracking-wide text-sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Gerenciar Times
            </button>
          )}

          {canCreate && (
            <>
                <button
                onClick={() => setShowImportWizard(true)}
                className="flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg shadow-sm transition-all font-bold text-sm"
                >
                <Download className="w-4 h-4 mr-2" />
                Importar
                </button>

                <button
                onClick={() => setShowTemplateGallery(true)}
                className="flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg shadow-sm transition-all font-bold text-sm"
                >
                <Layout className="w-4 h-4 mr-2" />
                Nova via Modelo
                </button>

                <button
                onClick={onCreateForm}
                className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all font-bold tracking-wide text-sm"
                >
                <Plus className="w-4 h-4 mr-2" />
                Criar em Branco
                </button>
            </>
          )}
        </div>
      </div>

      {/* Access Level Banner */}
      <div className={`mb-8 p-4 rounded-lg border flex items-center ${
        user.role === UserRole.MASTER ? 'bg-slate-800 border-slate-700 text-white' :
        user.role === UserRole.MANAGER ? 'bg-orange-50 border-orange-200 text-orange-800' :
        user.role === UserRole.EDITOR ? 'bg-blue-50 border-blue-200 text-blue-800' :
        'bg-green-50 border-green-200 text-green-800'
      }`}>
        <Lock className="w-5 h-5 mr-3" />
        <div>
          <span className="font-bold mr-1">Nível de Permissão: {user.role}.</span> 
          <span className="text-sm opacity-90">
            {user.role === UserRole.MASTER && "Acesso irrestrito a todos os times, configurações e geração de BI."}
            {user.role === UserRole.MANAGER && "Você tem controle total sobre os formulários do time."}
            {user.role === UserRole.EDITOR && "Você pode criar e editar, mas não pode excluir formulários."}
            {user.role === UserRole.VIEWER && "Você pode apenas visualizar e preencher formulários."}
          </span>
        </div>
      </div>

      {/* Forms Grid */}
      {teamForms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-300">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700">Nenhum formulário encontrado</h3>
          <p className="text-slate-500 mb-6">Comece criando um novo formulário ou use um modelo.</p>
          <button onClick={() => setShowTemplateGallery(true)} className="text-orange-500 font-bold hover:underline">Ver Galeria de Modelos</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamForms.map((form) => (
            <div key={form.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex flex-col h-full group">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${form.status === 'publicado' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setMenuOpenId(menuOpenId === form.id ? null : form.id)}
                      className="p-1 text-slate-400 hover:text-blue-900 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {menuOpenId === form.id && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-100 z-10 py-1 overflow-hidden">
                         <button 
                          onClick={() => onViewForm(form.id)}
                          className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4 mr-2" /> Preencher Formulário
                        </button>
                        
                        {(canEdit || user.role === UserRole.VIEWER) && (
                          <button 
                            onClick={() => onViewResponses(form.id)}
                            className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center hover:text-blue-800 border-t border-slate-50"
                          >
                            <BarChart3 className="w-4 h-4 mr-2" /> Ver Respostas
                          </button>
                        )}

                        {canEdit && (
                          <button 
                            onClick={() => onEditForm(form.id)}
                            className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center hover:text-blue-800 border-t border-slate-50"
                          >
                            <Edit2 className="w-4 h-4 mr-2" /> Editar Estrutura
                          </button>
                        )}
                        
                        {canDelete && (
                          <button 
                            onClick={() => handleDelete(form.id)}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center border-t border-slate-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2 truncate" title={form.title}>{form.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2">{form.description}</p>
              </div>
              
              <div className="border-t border-slate-100 p-4 bg-slate-50 rounded-b-xl flex justify-between items-center text-xs text-slate-500">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(form.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <span className={`px-2 py-0.5 rounded-full capitalize font-semibold ${form.status === 'publicado' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                  {form.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
