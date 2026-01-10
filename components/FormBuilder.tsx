
import React, { useState, useEffect, useCallback } from 'react';
import { Form, FormElement, FieldType, User, FormTheme } from '../types';
import { saveForm, getAllUsers, addCollaborator, MOCK_THEMES, BRAVO_LOGO_URL } from '../services/mockService';
import { 
  ArrowLeft, Save, GripVertical, Trash2, Plus, 
  Type, Hash, AlignLeft, CheckSquare, Calendar, ChevronDown, List,
  PenTool, UploadCloud, GitBranch, MessageSquare, Link, History,
  Settings2, Database, AlertCircle, HelpCircle, Share2, X, Check, Search, Globe, RefreshCw, Palette, Image as ImageIcon, Mail
} from 'lucide-react';

interface FormBuilderProps {
  user: User;
  initialData?: Form;
  onClose: () => void;
}

type BuilderTab = 'EDITOR' | 'LOGIC' | 'INTEGRATIONS' | 'HISTORY' | 'DESIGN';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Toast Notification Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'info', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-2xl flex items-center z-50 animate-in slide-in-from-right duration-300 ${type === 'success' ? 'bg-green-600 text-white' : 'bg-blue-900 text-white'}`}>
      {type === 'success' ? <Check className="mr-2" /> : <HelpCircle className="mr-2" />}
      <div>
        <h4 className="font-bold text-sm">{type === 'success' ? 'Sucesso' : 'Informação'}</h4>
        <p className="text-sm opacity-90 whitespace-pre-line">{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 hover:bg-white/20 rounded-full p-1"><X size={14}/></button>
    </div>
  );
};

const FormBuilder: React.FC<FormBuilderProps> = ({ user, initialData, onClose }) => {
  const [activeTab, setActiveTab] = useState<BuilderTab>('EDITOR');
  const [title, setTitle] = useState(initialData?.title || 'Formulário Sem Título');
  const [description, setDescription] = useState(initialData?.description || 'Descrição do formulário');
  const [elements, setElements] = useState<FormElement[]>(initialData?.elements || []);
  const [integrations, setIntegrations] = useState(initialData?.integrations || { slack: false, asana: false, googleSheets: false, sharepoint: { enabled: false }, notifications: { enabled: false, emailTo: '' } });
  const [theme, setTheme] = useState<FormTheme>(initialData?.theme || MOCK_THEMES[0].theme);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState(initialData?.collaborators || []);
  
  // Ensure logo is present (Enforcing Bravo Identity)
  useEffect(() => {
      if(!theme.logoUrl || theme.logoUrl !== BRAVO_LOGO_URL) {
          setTheme(prev => ({ ...prev, logoUrl: BRAVO_LOGO_URL }));
      }
  }, []);

  // UI State
  const [showToast, setShowToast] = useState<{msg: string, type: 'success'|'info'} | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');
  
  // SharePoint Modal State
  const [showSharePointModal, setShowSharePointModal] = useState(false);
  const [sharePointForm, setSharePointForm] = useState({ 
      siteUrl: initialData?.integrations?.sharepoint?.siteUrl || '', 
      listName: initialData?.integrations?.sharepoint?.listName || '' 
  });
  
  // Conditional Logic State
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [conditionalRules, setConditionalRules] = useState(initialData?.conditionalRules || []);
  const [currentRule, setCurrentRule] = useState({ field: '', operator: 'equals', value: '' });

  // Drag and Drop State
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Delete to Remove Active Item
      if (e.key === 'Delete' && activeElementId) {
        // Prevent if typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          removeElement(activeElementId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, description, elements, activeElementId, theme, integrations]);

  const addElement = (type: FieldType) => {
    const newElement: FormElement = {
      id: generateId(),
      type,
      label: `Novo ${type.toLowerCase().replace('_', ' ')}`,
      required: false,
      options: type === FieldType.SELECT || type === FieldType.CHECKBOX ? ['Opção 1', 'Opção 2'] : undefined
    };
    setElements([...elements, newElement]);
    setActiveElementId(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<FormElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const removeElement = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setElements(prev => prev.filter(el => el.id !== id));
    if (activeElementId === id) setActiveElementId(null);
  };

  // Drag Handlers
  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newElements = [...elements];
    const draggedItem = newElements[draggedItemIndex];
    newElements.splice(draggedItemIndex, 1);
    newElements.splice(index, 0, draggedItem);

    setElements(newElements);
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const handleSave = () => {
    if (!title.trim()) {
        setShowToast({ msg: 'Por favor, insira um título para o formulário', type: 'info' });
        return;
    }
    
    const cleanedElements = elements.map(el => ({
      ...el,
      options: el.options ? el.options.filter(opt => opt.trim() !== '') : undefined
    }));

    const newForm: Form = {
      id: initialData?.id || generateId(),
      title,
      description,
      teamId: user.teamId,
      elements: cleanedElements,
      integrations,
      collaborators,
      theme,
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now(),
      status: 'publicado',
    conditionalRules
    };
    
    saveForm(newForm);
    setShowToast({ msg: 'Notificação de Salvamento: Suas alterações foram salvas com sucesso!', type: 'success' });
  };

  const handleInvite = (userId: string, role: 'EDITOR' | 'VIEWER') => {
     if(!collaborators.some(c => c.userId === userId)) {
        const newCollab = { userId, role, addedAt: Date.now() };
        setCollaborators([...collaborators, newCollab]);
        if(initialData) addCollaborator(initialData.id, userId, role);
        setShowToast({ msg: `Usuário convidado como ${role === 'EDITOR' ? 'Editor' : 'Visualizador'}!`, type: 'success' });
     }
  };

  const saveSharePointConfig = () => {
      setIntegrations({
          ...integrations,
          sharepoint: {
              enabled: true,
              siteUrl: sharePointForm.siteUrl,
              listName: sharePointForm.listName
          }
      });
      setShowSharePointModal(false);
      setShowToast({ msg: 'Configuração do SharePoint salva com sucesso!', type: 'success' });
  };

  const updateNotifications = (enabled: boolean, emailTo: string) => {
      setIntegrations({
          ...integrations,
          notifications: { enabled, emailTo }
      });
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setTheme({ ...theme, bannerImage: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const activeElement = elements.find(el => el.id === activeElementId);

  const getIcon = (type: FieldType) => {
    switch(type) {
      case FieldType.TEXT: return <Type size={18} />;
      case FieldType.NUMBER: return <Hash size={18} />;
      case FieldType.TEXTAREA: return <AlignLeft size={18} />;
      case FieldType.CHECKBOX: return <CheckSquare size={18} />;
      case FieldType.SELECT: return <List size={18} />;
      case FieldType.DATE: return <Calendar size={18} />;
      case FieldType.SIGNATURE: return <PenTool size={18} />;
      case FieldType.FILE_UPLOAD: return <UploadCloud size={18} />;
    }
  };

  const allUsers = getAllUsers();
  const activeCollaborators = allUsers.filter(u => collaborators.some(c => c.userId === u.id));

  // --- SUB-COMPONENTS FOR TABS ---

  const DesignView = () => (
    <div className="flex flex-1 overflow-hidden h-full bg-slate-100">
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 overflow-y-auto">
            <div className="p-4 border-b border-slate-100">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                   <Palette size={14} className="mr-2"/> Personalização
               </h3>
            </div>
            
            <div className="p-6 space-y-8">
                {/* Presets */}
                <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3">Temas Prontos</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {MOCK_THEMES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.theme)}
                                className="flex flex-col items-center p-2 rounded-lg border hover:shadow-md transition-all group"
                                style={{ borderColor: theme.bgColor === t.theme.bgColor ? t.theme.buttonColor : '#e2e8f0' }}
                            >
                                <div className="w-full h-12 rounded mb-2 border border-slate-100" style={{ backgroundColor: t.theme.bgColor }}>
                                    <div className="w-3/4 h-8 mx-auto mt-2 rounded-t" style={{ backgroundColor: t.theme.formColor }}></div>
                                </div>
                                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">{t.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <hr className="border-slate-100"/>

                {/* Manual Colors */}
                <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4">Cores Personalizadas</h4>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Fundo da Página</label>
                            <div className="flex items-center">
                                <input type="color" value={theme.bgColor} onChange={e => setTheme({...theme, bgColor: e.target.value})} className="w-8 h-8 rounded border-none p-0 mr-2 cursor-pointer"/>
                                <span className="text-xs bg-slate-50 px-2 py-1 rounded border font-mono">{theme.bgColor}</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Fundo do Formulário</label>
                            <div className="flex items-center">
                                <input type="color" value={theme.formColor} onChange={e => setTheme({...theme, formColor: e.target.value})} className="w-8 h-8 rounded border-none p-0 mr-2 cursor-pointer"/>
                                <span className="text-xs bg-slate-50 px-2 py-1 rounded border font-mono">{theme.formColor}</span>
                            </div>
                        </div>
                         <div>
                            <label className="text-xs text-slate-500 mb-1 block">Cor do Texto Principal</label>
                            <div className="flex items-center">
                                <input type="color" value={theme.textColor} onChange={e => setTheme({...theme, textColor: e.target.value})} className="w-8 h-8 rounded border-none p-0 mr-2 cursor-pointer"/>
                                <span className="text-xs bg-slate-50 px-2 py-1 rounded border font-mono">{theme.textColor}</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Cor dos Botões (Destaque)</label>
                            <div className="flex items-center">
                                <input type="color" value={theme.buttonColor} onChange={e => setTheme({...theme, buttonColor: e.target.value})} className="w-8 h-8 rounded border-none p-0 mr-2 cursor-pointer"/>
                                <span className="text-xs bg-slate-50 px-2 py-1 rounded border font-mono">{theme.buttonColor}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100"/>

                 {/* Banner */}
                <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3">Imagem de Capa</h4>
                    <div className="relative group">
                         {theme.bannerImage ? (
                             <div className="w-full h-32 rounded-lg bg-cover bg-center border border-slate-200 relative" style={{ backgroundImage: `url(${theme.bannerImage})`}}>
                                  <button onClick={() => setTheme({...theme, bannerImage: undefined})} className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"><Trash2 size={16}/></button>
                             </div>
                         ) : (
                             <div className="w-full h-32 rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                                 <ImageIcon size={24} className="mb-2"/>
                                 <span className="text-xs">Nenhuma imagem</span>
                             </div>
                         )}
                         <label className="block mt-2">
                             <span className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded text-xs font-bold cursor-pointer inline-block w-full text-center">Carregar Imagem</span>
                             <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                         </label>
                    </div>
                </div>
            </div>
        </div>

        {/* Live Preview Area (Same as Editor but read only mostly) */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center relative transition-colors duration-500" style={{ backgroundColor: theme.bgColor }}>
             <div className="w-full max-w-3xl pb-20">
                  <div className="rounded-xl shadow-xl overflow-hidden transition-colors duration-500" style={{ backgroundColor: theme.formColor }}>
                      {/* Banner */}
                      {theme.bannerImage && (
                          <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${theme.bannerImage})` }}></div>
                      )}
                      
                      {/* Header */}
                      <div className="p-10 border-b border-black/5 text-center relative" style={{ color: theme.textColor }}>
                           {theme.logoUrl && (
                               <div className="flex justify-center mb-4">
                                   <div className="bg-white p-2 rounded border shadow-sm">
                                     <img src={theme.logoUrl} className="h-12 w-12" alt="Logo"/>
                                   </div>
                               </div>
                           )}
                           <h1 className="text-4xl font-bold mb-3" style={{ color: theme.textColor }}>{title}</h1>
                           <p className="text-lg opacity-80" style={{ color: theme.textColor }}>{description}</p>
                      </div>

                      {/* Fake Fields Preview */}
                      <div className="p-10 space-y-6">
                           {elements.map((el) => (
                               <div key={el.id} className="opacity-80 pointer-events-none">
                                   <label className="block text-base font-semibold mb-2" style={{ color: theme.textColor }}>{el.label}</label>
                                   <div className="h-12 w-full rounded-lg border border-black/10 bg-black/5"></div>
                               </div>
                           ))}
                           {elements.length === 0 && <p className="text-center opacity-50 italic" style={{ color: theme.textColor }}>Adicione campos na aba Editor para visualizar aqui.</p>}
                           
                           <div className="pt-4 flex justify-end">
                                <button className="px-8 py-3 rounded-lg font-bold text-white shadow-md opacity-90" style={{ backgroundColor: theme.buttonColor }}>Enviar</button>
                           </div>
                      </div>
                  </div>
             </div>
        </div>
    </div>
  );

  const EditorView = () => (
    <div className="flex flex-1 overflow-hidden h-full bg-slate-100">
      {/* Toolbox */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-4 border-b border-slate-100">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Adicionar Campos</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[FieldType.TEXT, FieldType.TEXTAREA, FieldType.NUMBER, FieldType.SELECT, FieldType.CHECKBOX, FieldType.DATE, FieldType.FILE_UPLOAD, FieldType.SIGNATURE].map(type => (
            <button
              key={type}
              onClick={() => addElement(type)}
              className="w-full flex items-center p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-900 text-slate-600 transition-all bg-white shadow-sm group"
            >
              <div className="bg-slate-100 p-2 rounded-md mr-3 group-hover:bg-white text-slate-500 group-hover:text-blue-600 transition-colors">
                 {getIcon(type)}
              </div>
              <span className="text-sm font-medium capitalize">{type.toLowerCase().replace('_', ' ')}</span>
              <Plus className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center transition-colors duration-500 relative" style={{ backgroundColor: theme.bgColor }}>
        <div className="w-full max-w-3xl pb-20 pr-16"> 
          {/* Header Card */}
          <div className="rounded-t-xl border-b border-slate-100 shadow-sm text-center mb-6 relative p-10 transition-colors duration-500" style={{ backgroundColor: theme.formColor }}>
             {/* Banner Preview in Editor */}
             {theme.bannerImage && (
                 <div className="absolute top-0 left-0 right-0 h-2 bg-cover bg-center" style={{ backgroundImage: `url(${theme.bannerImage})` }}></div>
             )}

            {/* Active Collaborators Indicator */}
            {activeCollaborators.length > 0 && (
                <div className="absolute top-4 right-4 flex -space-x-2">
                    {activeCollaborators.map(u => (
                        <img key={u.id} src={u.avatar} alt={u.name} title={`Editando: ${u.name}`} className="w-8 h-8 rounded-full border-2 border-white" />
                    ))}
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-500 font-bold" title="Você está editando">Eu</div>
                </div>
            )}

            {/* Automatic Logo Preview */}
            {theme.logoUrl && (
               <div className="flex justify-center mb-4">
                   <img src={theme.logoUrl} alt="Company Logo" className="h-12 w-12 object-contain"/>
               </div>
            )}

            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-bold text-center border-2 border-transparent hover:border-slate-200 focus:border-orange-500 focus:bg-white/50 rounded-lg px-2 py-1 outline-none transition-all mb-4 bg-transparent"
              placeholder="Título do Formulário"
              style={{ color: theme.textColor }}
            />
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-center border-b border-transparent hover:border-slate-300 focus:border-orange-500 focus:outline-none transition-colors bg-transparent pb-1 opacity-80"
              placeholder="Digite uma descrição para este formulário..."
              style={{ color: theme.textColor }}
            />
          </div>

          {/* Fields List */}
          <div className="space-y-4">
              {elements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-400">
                  <div className="bg-white p-4 rounded-full mb-3 shadow-sm">
                    <Plus size={32} className="text-orange-400" />
                  </div>
                  <p className="font-medium">Seu formulário está vazio</p>
                  <p className="text-sm">Clique nos campos à esquerda para começar.</p>
                </div>
              ) : (
                elements.map((el, index) => (
                  <div 
                  key={el.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setActiveElementId(el.id)}
                  className={`group relative bg-white rounded-xl transition-all duration-200 cursor-pointer border-2 ${
                    activeElementId === el.id 
                    ? 'border-blue-500 shadow-lg scale-[1.01] z-10' 
                    : draggedItemIndex === index 
                      ? 'border-orange-400 bg-orange-50 opacity-40 translate-x-2' 
                      : 'border-transparent hover:border-slate-300 shadow-sm'
                  }`}
                  >
                    {/* ... Field Content ... */}
                    <div className="p-6">
                      <div className="flex items-start">
                        <div className={`mt-1 mr-4 cursor-grab active:cursor-grabbing hover:bg-slate-100 p-1 rounded ${activeElementId === el.id ? 'text-blue-400' : 'text-slate-300'}`}>
                          <GripVertical size={24} />
                        </div>

                        <div className="flex-1 pointer-events-none">
                            <label className="block text-base font-semibold text-slate-700 mb-2">
                              {el.label} {el.required && <span className="text-red-500">*</span>}
                            </label>
                            
                            {el.type === FieldType.TEXT && <div className="h-10 bg-slate-50 rounded-lg border border-slate-200" />}
                            {el.type === FieldType.NUMBER && <div className="h-10 bg-slate-50 rounded-lg border border-slate-200 w-1/3" />}
                            {el.type === FieldType.TEXTAREA && <div className="h-24 bg-slate-50 rounded-lg border border-slate-200" />}
                            {el.type === FieldType.SELECT && (
                              <div className="h-10 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between px-3 text-slate-400">
                                <span>Opções...</span> <ChevronDown size={16} />
                              </div>
                            )}
                            {el.type === FieldType.CHECKBOX && (
                              <div className="space-y-2">
                                {el.options?.map((opt, i) => (
                                  <div key={i} className="flex items-center">
                                    <div className="w-5 h-5 rounded border border-slate-300 bg-white mr-3" />
                                    <span className="text-slate-600">{opt || 'Opção vazia'}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {el.type === FieldType.DATE && (
                               <div className="h-10 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between px-3 text-slate-400 w-48">
                                 <span>dd/mm/aaaa</span> <Calendar size={16} />
                               </div>
                            )}
                            {el.type === FieldType.FILE_UPLOAD && (
                               <div className="h-24 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                                 <UploadCloud size={24} className="mb-1" /> 
                                 <span className="text-xs">Upload de Arquivo</span>
                               </div>
                            )}
                            {el.type === FieldType.SIGNATURE && (
                               <div className="h-32 bg-white rounded-lg border border-slate-300 flex items-end justify-center pb-4 text-slate-400 relative">
                                  <div className="w-3/4 border-b border-slate-300 mb-4"></div>
                                  <span className="text-xs absolute bottom-1">Assinatura</span>
                               </div>
                            )}
                        </div>
                      </div>
                      
                      <div className="flex mt-3 ml-10 space-x-2">
                          {el.logic && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded flex items-center font-bold"><GitBranch size={10} className="mr-1"/> Lógica Ativa</span>}
                      </div>
                    </div>

                    {activeElementId === el.id && (
                      <div className="absolute -right-14 top-0 flex flex-col space-y-2 z-50">
                        <button 
                          onClick={(e) => removeElement(el.id, e)} 
                          className="p-2 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 border border-slate-100 tooltip-trigger transition-transform hover:scale-110"
                          title="Excluir (Delete)"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
             <Settings2 size={14} className="mr-2" /> Propriedades do Campo
           </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {activeElement ? (
            <div className="space-y-6 animate-in slide-in-from-right duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Rótulo (Pergunta)</label>
                  <input 
                  key={`label-input-${activeElement.id}`} 
                  type="text" 
                  defaultValue={activeElement.label}
                  onBlur={(e) => updateElement(activeElement.id, { label: e.target.value })}
                  onKeyDown={(e) => { if(e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-shadow"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Pressione Enter ou clique fora para aplicar.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Placeholder / Ajuda</label>
                  <input 
                  key={`placeholder-input-${activeElement.id}`}
                  type="text" 
                  defaultValue={activeElement.placeholder || ''}
                  onBlur={(e) => updateElement(activeElement.id, { placeholder: e.target.value })}
                   onKeyDown={(e) => { if(e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Texto de exemplo..."
                  />
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <label className="text-sm font-medium text-slate-700 cursor-pointer" htmlFor="req-check">Campo Obrigatório</label>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      name="toggle" 
                      id="req-check" 
                      checked={activeElement.required}
                      onChange={(e) => updateElement(activeElement.id, { required: e.target.checked })}
                      className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5"
                    />
                    <label htmlFor="req-check" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${activeElement.required ? 'bg-orange-500' : 'bg-slate-300'}`}></label>
                  </div>
                </div>

                {(activeElement.type === FieldType.SELECT || activeElement.type === FieldType.CHECKBOX) && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Opções (uma por linha)</label>
                    <textarea
                    key={`options-${activeElement.id}`}
                    defaultValue={activeElement.options?.join('\n')}
                    onBlur={(e) => {
                       const val = e.target.value;
                       const opts = val.split('\n');
                       updateElement(activeElement.id, { options: opts });
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm h-32"
                    placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Clique fora para salvar as opções.</p>
                  </div>
                )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-4">
              <Settings2 size={48} className="text-slate-200 mb-4" />
              <p className="font-medium text-slate-600">Nenhum campo selecionado</p>
              <p className="text-sm mt-2">Clique em um campo no formulário para editar suas propriedades.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
       {/* Top Bar */}
       <div className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shadow-sm z-20">
          <div className="flex items-center">
              <button onClick={onClose} className="mr-4 p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                  <ArrowLeft size={20}/>
              </button>
              <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Editor de Formulário</span>
                  <span className="font-bold text-slate-800">{title}</span>
              </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                  onClick={() => setActiveTab('EDITOR')} 
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all flex items-center ${activeTab === 'EDITOR' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <GripVertical size={14} className="mr-2"/> Editor
              </button>
              <button 
                  onClick={() => setActiveTab('DESIGN')} 
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all flex items-center ${activeTab === 'DESIGN' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <Palette size={14} className="mr-2"/> Design
              </button>
              <button 
                  onClick={() => setActiveTab('LOGIC')} 
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all flex items-center ${activeTab === 'LOGIC' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <GitBranch size={14} className="mr-2"/> Lógica
              </button>
              <button 
                   onClick={() => setActiveTab('INTEGRATIONS')} 
                   className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all flex items-center ${activeTab === 'INTEGRATIONS' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <Globe size={14} className="mr-2"/> Integrações
              </button>
          </div>

          <div className="flex items-center space-x-2">
              <button onClick={() => setShowShare(true)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg flex items-center transition-colors">
                  <Share2 size={18} className="mr-2"/> Compartilhar
              </button>
              <button onClick={handleSave} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center">
                  <Save size={18} className="mr-2"/> Salvar
              </button>
          </div>
       </div>

       {/* Main Content Area */}
       <div className="flex-1 overflow-hidden relative">
           {activeTab === 'EDITOR' && <EditorView />}
           {activeTab === 'DESIGN' && <DesignView />}
           
           {activeTab === 'LOGIC' && (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50">
                   <GitBranch size={48} className="mb-4 opacity-50"/>
                   <h3 className="text-lg font-bold text-slate-600">Lógica Condicional</h3>
                   <p className="max-w-md text-center mt-2">Crie regras para mostrar ou esconder campos com base nas respostas anteriores.</p>
                   <button className="mt-6 px-6 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-50">Adicionar Regra</button>
               </div>
           )}

            {activeTab === 'INTEGRATIONS' && (
               <div className="flex flex-col h-full bg-slate-50 p-8 overflow-y-auto">
                   <div className="max-w-4xl mx-auto w-full space-y-4">
                       <h2 className="text-2xl font-bold text-slate-800 mb-6">Integrações Disponíveis</h2>
                       
                       {/* EMAIL NOTIFICATIONS */}
                       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                           <div className="flex items-start justify-between">
                               <div className="flex items-center">
                                   <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-4">
                                       <Mail size={24}/>
                                   </div>
                                   <div>
                                       <h3 className="font-bold text-slate-800">Notificações por Email</h3>
                                       <p className="text-sm text-slate-500">Envie respostas para um responsável automaticamente.</p>
                                   </div>
                               </div>
                               <div className="relative inline-block w-12 align-middle select-none">
                                   <input 
                                       type="checkbox" 
                                       checked={integrations.notifications?.enabled}
                                       onChange={(e) => updateNotifications(e.target.checked, integrations.notifications?.emailTo || '')}
                                       className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-6"
                                   />
                                   <div className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${integrations.notifications?.enabled ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                               </div>
                           </div>
                           
                           {integrations.notifications?.enabled && (
                               <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                                   <label className="block text-sm font-bold text-slate-700 mb-1">Email do Responsável</label>
                                   <input 
                                        type="email" 
                                        placeholder="gestor@bravo.com"
                                        className="w-full p-2 border border-slate-300 rounded-lg"
                                        value={integrations.notifications.emailTo}
                                        onChange={(e) => updateNotifications(true, e.target.value)}
                                   />
                               </div>
                           )}
                       </div>

                       {/* SharePoint */}
                       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                           <div className="flex items-center">
                               <div className="w-12 h-12 bg-[#0078d4] rounded-lg flex items-center justify-center text-white mr-4">
                                   <Database size={24}/>
                               </div>
                               <div>
                                   <h3 className="font-bold text-slate-800">Microsoft SharePoint</h3>
                                   <p className="text-sm text-slate-500">Envie respostas automaticamente para uma lista.</p>
                               </div>
                           </div>
                           <div className="flex items-center">
                               {integrations.sharepoint?.enabled ? (
                                   <div className="flex items-center gap-2">
                                        <span className="text-green-600 font-bold text-sm flex items-center"><Check size={16} className="mr-1"/> Conectado</span>
                                        <button onClick={() => setShowSharePointModal(true)} className="text-xs text-slate-400 underline hover:text-blue-600">Configurar</button>
                                   </div>
                               ) : (
                                   <button onClick={() => setShowSharePointModal(true)} className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50">Conectar</button>
                               )}
                           </div>
                       </div>
                       
                       {/* Slack */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between opacity-70">
                           <div className="flex items-center">
                               <div className="w-12 h-12 bg-[#4A154B] rounded-lg flex items-center justify-center text-white mr-4">
                                   <MessageSquare size={24}/>
                               </div>
                               <div>
                                   <h3 className="font-bold text-slate-800">Slack</h3>
                                   <p className="text-sm text-slate-500">Receba notificações de novas respostas.</p>
                               </div>
                           </div>
                           <button className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 cursor-not-allowed">Em Breve</button>
                       </div>
                   </div>
               </div>
           )}
       </div>

       {/* Toast */}
       {showToast && <Toast message={showToast.msg} type={showToast.type} onClose={() => setShowToast(null)} />}
       
       {/* SharePoint Config Modal */}
       {showSharePointModal && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
                   <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                       <Database className="mr-2 text-[#0078d4]"/> Configurar SharePoint
                   </h3>
                   
                   <div className="space-y-4">
                       <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">URL do Site SharePoint</label>
                           <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                placeholder="https://bravologistica.sharepoint.com/sites/intranet"
                                value={sharePointForm.siteUrl}
                                onChange={(e) => setSharePointForm({...sharePointForm, siteUrl: e.target.value})}
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1">Nome da Lista / Biblioteca</label>
                           <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                placeholder="Respostas_Formulario"
                                value={sharePointForm.listName}
                                onChange={(e) => setSharePointForm({...sharePointForm, listName: e.target.value})}
                           />
                       </div>
                   </div>

                   <div className="flex justify-end mt-6 space-x-2">
                       <button onClick={() => setShowSharePointModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold">Cancelar</button>
                       <button onClick={saveSharePointConfig} className="px-4 py-2 bg-[#0078d4] text-white rounded-lg font-bold hover:bg-blue-700">Salvar Conexão</button>
                   </div>
               </div>
           </div>
       )}

       {/* Share Modal */}
       {showShare && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="text-xl font-bold text-slate-800">Compartilhar Formulário</h3>
                       <button onClick={() => setShowShare(false)}><X size={20} className="text-slate-400 hover:text-red-500"/></button>
                   </div>
                   
                   <div className="mb-6">
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Link Público</label>
                       <div className="flex gap-2">
                           <input type="text" readOnly value={`https://bravoforms.app/f/${initialData?.id || 'draft'}`} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none"/>
                           <button className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors">Copiar</button>
                       </div>
                   </div>

                   <hr className="border-slate-100 my-4"/>

                   <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Colaboradores (Time)</label>
                       <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Buscar colega por nome..." 
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                value={inviteSearch}
                                onChange={e => setInviteSearch(e.target.value)}
                            />
                       </div>
                       
                       <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                           {allUsers.filter(u => u.id !== user.id && u.name.toLowerCase().includes(inviteSearch.toLowerCase())).map(u => {
                               const isCollab = collaborators.some(c => c.userId === u.id);
                               return (
                                   <div key={u.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
                                       <div className="flex items-center">
                                           <img src={u.avatar} className="w-8 h-8 rounded-full mr-3" alt=""/>
                                           <div>
                                               <p className="text-sm font-bold text-slate-700">{u.name}</p>
                                               <p className="text-xs text-slate-400">{u.email}</p>
                                           </div>
                                       </div>
                                       {isCollab ? (
                                           <span className="text-xs text-green-600 font-bold px-2 py-1 bg-green-50 rounded">Convidado</span>
                                       ) : (
                                           <button onClick={() => handleInvite(u.id, 'EDITOR')} className="text-xs bg-blue-900 text-white px-3 py-1 rounded hover:bg-blue-800 transition-colors">Convidar</button>
                                       )}
                                   </div>
                               );
                           })}
                       </div>
                   </div>
               </div>
           </div>
       )}
    </div>
    
    {/* Add Conditional Rule Modal */}
    {showAddRuleModal && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <GitBranch className="mr-2 text-blue-600"/>
            Adicionar Regra Condicional
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Campo</label>
              <select value={currentRule.field} onChange={(e) => setCurrentRule({...currentRule, field: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm">
                <option value="">Selecione um campo</option>
                {elements.map(el => <option key={el.id} value={el.id}>{el.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Operador</label>
              <select value={currentRule.operator} onChange={(e) => setCurrentRule({...currentRule, operator: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm">
                <option value="equals">É igual a</option>
                <option value="notEquals">Não é igual a</option>
                <option value="contains">Contém</option>
                <option value="greaterThan">Maior que</option>
                <option value="lessThan">Menor que</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Valor</label>
              <input type="text" value={currentRule.value} onChange={(e) => setCurrentRule({...currentRule, value: e.target.value})} className="w-full border border-slate-300 rounded-lg p-2 text-sm" placeholder="Digite o valor..." />
            </div>
          </div>
          <div className="flex justify-end mt-6 space-x-2">
            <button onClick={() => setShowAddRuleModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold">
              Cancelar
            </button>
            <button onClick={() => { if(currentRule.field && currentRule.value) { setConditionalRules([...conditionalRules, currentRule]); setCurrentRule({field: '', operator: 'equals', value: ''}); setShowAddRuleModal(false); setShowToast({msg: 'Regra adicionada com sucesso!', type: 'success'}); } }} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
              Adicionar Regra
            </button>
          </div>
        </div>
      </div>
    )}
  );
};

export default FormBuilder;
