
import React, { useState } from 'react';
import { User, UserRole, Team, CustomRole } from '../types';
import { getAllUsers, getTeams, updateUserTeam, createTeam, updateTeam, deleteTeam, createUser, getCustomRoles, createCustomRole, AVAILABLE_PERMISSIONS, updateFullUser } from '../services/mockService';
import { ArrowLeft, Users, Shield, Save, Search, Briefcase, Plus, Trash2, Edit2, X, Camera, CheckSquare, Square, Image, Key } from 'lucide-react';

interface TeamManagerProps {
  onClose: () => void;
}

const TeamManager: React.FC<TeamManagerProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>(getAllUsers());
  const [teams, setTeams] = useState<Team[]>(getTeams());
  const [customRoles, setCustomRoles] = useState<CustomRole[]>(getCustomRoles());
  const [activeTab, setActiveTab] = useState<'TEAMS' | 'MEMBERS' | 'ROLES'>('MEMBERS');
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for Modals
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Forms
  const [teamForm, setTeamForm] = useState({ name: '', description: '', logo: '' });
  const [userForm, setUserForm] = useState<{
    name: string;
    email: string;
    teamId: string;
    role: UserRole | string;
    avatarBase64: string;
  }>({ name: '', email: '', teamId: teams[0]?.id || '', role: UserRole.VIEWER, avatarBase64: '' });
  const [roleForm, setRoleForm] = useState({ name: '', permissions: [] as string[] });

  // Update logic
  const handleUpdateUser = (userId: string, teamId: string, role: string) => {
    updateUserTeam(userId, teamId, role);
    setUsers([...getAllUsers()]); 
  };

  const handleSaveTeam = () => {
      if(!teamForm.name) return;
      if(editingTeam) {
          updateTeam(editingTeam.id, teamForm.name, teamForm.description, teamForm.logo);
      } else {
          createTeam(teamForm.name, teamForm.description, teamForm.logo);
      }
      setTeams([...getTeams()]);
      setIsTeamModalOpen(false);
      setEditingTeam(null);
      setTeamForm({ name: '', description: '', logo: '' });
  };

  const handleSaveUser = () => {
      if(!userForm.name || !userForm.email) return;
      
      if(editingUser) {
          updateFullUser(editingUser.id, userForm);
      } else {
          createUser(userForm.name, userForm.email, userForm.teamId, userForm.role, userForm.avatarBase64);
      }
      
      setUsers([...getAllUsers()]);
      setIsUserModalOpen(false);
      setEditingUser(null);
      setUserForm({ name: '', email: '', teamId: teams[0]?.id || '', role: UserRole.VIEWER, avatarBase64: '' });
  };

  const handleSaveRole = () => {
      if(!roleForm.name) return;
      createCustomRole(roleForm.name, roleForm.permissions);
      setCustomRoles([...getCustomRoles()]);
      setIsRoleModalOpen(false);
      setRoleForm({ name: '', permissions: [] });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setUserForm({ ...userForm, avatarBase64: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleTeamLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setTeamForm({ ...teamForm, logo: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const togglePermission = (permId: string) => {
      setRoleForm(prev => {
          const exists = prev.permissions.includes(permId);
          if (exists) {
              return { ...prev, permissions: prev.permissions.filter(p => p !== permId) };
          } else {
              return { ...prev, permissions: [...prev.permissions, permId] };
          }
      });
  };

  const handleDeleteTeam = (id: string) => {
      if(confirm('Tem certeza? Os usuários deste time serão movidos para o time padrão.')) {
          deleteTeam(id);
          setTeams([...getTeams()]);
          setUsers([...getAllUsers()]);
      }
  };

  const openTeamModal = (team?: Team) => {
      if(team) {
          setEditingTeam(team);
          setTeamForm({ name: team.name, description: team.description || '', logo: team.logo || '' });
      } else {
          setEditingTeam(null);
          setTeamForm({ name: '', description: '', logo: '' });
      }
      setIsTeamModalOpen(true);
  };

  const openUserModal = (user?: User) => {
      if (user) {
          setEditingUser(user);
          setUserForm({
              name: user.name,
              email: user.email,
              teamId: user.teamId,
              role: user.role,
              avatarBase64: user.avatar
          });
      } else {
          setEditingUser(null);
          setUserForm({ name: '', email: '', teamId: teams[0]?.id || '', role: UserRole.VIEWER, avatarBase64: '' });
      }
      setIsUserModalOpen(true);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
       {/* Header */}
       <div className="bg-blue-900 border-b border-blue-800 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
            <button onClick={onClose} className="text-blue-200 hover:text-white flex items-center text-sm font-medium transition-colors mr-4">
            <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white flex items-center">
                <Shield className="mr-3" /> Gestão Administrativa
            </h1>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-blue-800 rounded-lg p-1">
            <button 
                onClick={() => setActiveTab('TEAMS')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center ${activeTab === 'TEAMS' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:bg-blue-700'}`}
            >
                <Briefcase size={14} className="mr-2"/> Times
            </button>
            <button 
                onClick={() => setActiveTab('MEMBERS')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center ${activeTab === 'MEMBERS' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:bg-blue-700'}`}
            >
                <Users size={14} className="mr-2"/> Membros
            </button>
            <button 
                onClick={() => setActiveTab('ROLES')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center ${activeTab === 'ROLES' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:bg-blue-700'}`}
            >
                <Shield size={14} className="mr-2"/> Funções
            </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full p-8">
         
         {/* TEAMS TAB */}
         {activeTab === 'TEAMS' && (
             <div className="space-y-6">
                 <div className="flex justify-between items-center">
                     <div>
                         <h2 className="text-2xl font-bold text-slate-800">Times da Organização</h2>
                         <p className="text-slate-500">Gerencie os departamentos e unidades de negócio.</p>
                     </div>
                     <button onClick={() => openTeamModal()} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-md">
                         <Plus size={18} className="mr-2"/> Novo Time
                     </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {teams.map(team => (
                         <div key={team.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow group flex flex-col">
                             <div className="flex justify-between items-start mb-4">
                                <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-100 shadow-sm flex-shrink-0 bg-white flex items-center justify-center">
                                    {team.logo ? (
                                        <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Briefcase size={24} className="text-blue-200" />
                                    )}
                                </div>
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openTeamModal(team)} className="text-slate-400 hover:text-blue-600"><Edit2 size={16}/></button>
                                    {team.id !== 'all' && (
                                        <button onClick={() => handleDeleteTeam(team.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                                    )}
                                </div>
                             </div>
                             <h3 className="text-lg font-bold text-slate-800 mb-1">{team.name}</h3>
                             <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{team.description}</p>
                             <div className="pt-4 border-t border-slate-100 text-xs font-bold text-slate-400 uppercase flex justify-between mt-auto">
                                 <span>Membros:</span>
                                 <span className="text-slate-700">{users.filter(u => u.teamId === team.id).length} usuários</span>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
         )}

         {/* ROLES TAB (NEW) */}
         {activeTab === 'ROLES' && (
             <div className="space-y-6">
                 <div className="flex justify-between items-center">
                     <div>
                         <h2 className="text-2xl font-bold text-slate-800">Funções Personalizadas</h2>
                         <p className="text-slate-500">Crie cargos específicos e defina o que cada função pode fazer na plataforma.</p>
                     </div>
                     <button onClick={() => setIsRoleModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-md">
                         <Plus size={18} className="mr-2"/> Nova Função
                     </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* System Roles Card */}
                     <div className="bg-white rounded-xl border border-slate-200 p-6 opacity-80">
                         <h3 className="font-bold text-slate-700 mb-4">Funções Padrão (Sistema)</h3>
                         <ul className="space-y-3">
                             <li className="flex justify-between bg-slate-50 p-3 rounded">
                                 <span className="font-bold text-blue-900">MASTER</span>
                                 <span className="text-xs text-slate-500">Acesso Total</span>
                             </li>
                             <li className="flex justify-between bg-slate-50 p-3 rounded">
                                 <span className="font-bold text-orange-700">GESTOR</span>
                                 <span className="text-xs text-slate-500">Gerencia o Time</span>
                             </li>
                             <li className="flex justify-between bg-slate-50 p-3 rounded">
                                 <span className="font-bold text-slate-700">EDITOR</span>
                                 <span className="text-xs text-slate-500">Cria/Edita Forms</span>
                             </li>
                             <li className="flex justify-between bg-slate-50 p-3 rounded">
                                 <span className="font-bold text-slate-500">VISUALIZADOR</span>
                                 <span className="text-xs text-slate-500">Apenas Vê/Responde</span>
                             </li>
                         </ul>
                     </div>
                     
                     {/* Custom Roles */}
                     {customRoles.map(role => (
                        <div key={role.id} className="bg-white rounded-xl border border-blue-200 shadow-sm p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">Personalizado</div>
                            <h3 className="font-bold text-lg text-slate-800 mb-2">{role.name}</h3>
                            <div className="mb-4">
                                <span className="text-xs text-slate-500 uppercase tracking-wide font-bold">Permissões:</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {role.permissions.map(p => (
                                        <span key={p} className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full">
                                            {AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                     ))}
                 </div>
             </div>
         )}

         {/* MEMBERS TAB */}
         {activeTab === 'MEMBERS' && (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in">
                {/* Toolbar */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar usuário..." 
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => openUserModal()}
                        className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-sm"
                    >
                        <Plus size={18} className="mr-2" /> Adicionar Membro
                    </button>
                </div>

                {/* User List */}
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                            <th className="px-6 py-4">Usuário</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Função</th>
                            <th className="px-6 py-4 w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-6 py-4 flex items-center">
                                    <img src={u.avatar} className="w-10 h-10 rounded-full mr-3 border border-slate-200 object-cover" alt="" />
                                    <span className="font-bold text-slate-800">{u.name}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{u.email}</td>
                                <td className="px-6 py-4">
                                    <select 
                                        className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 block w-full outline-none"
                                        value={u.teamId}
                                        onChange={(e) => handleUpdateUser(u.id, e.target.value, u.role)}
                                    >
                                        {teams.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <select 
                                        className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 block w-full outline-none"
                                        value={u.role}
                                        onChange={(e) => handleUpdateUser(u.id, u.teamId, e.target.value)}
                                    >
                                        <optgroup label="Sistema">
                                            <option value={UserRole.VIEWER}>Visualizador</option>
                                            <option value={UserRole.EDITOR}>Editor</option>
                                            <option value={UserRole.MANAGER}>Gestor</option>
                                            <option value={UserRole.MASTER}>Master Admin</option>
                                        </optgroup>
                                        {customRoles.length > 0 && (
                                            <optgroup label="Personalizado">
                                                {customRoles.map(cr => (
                                                    <option key={cr.id} value={cr.id}>{cr.name}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => openUserModal(u)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar Membro"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         )}
      </div>

      {/* Team Modal */}
      {isTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{editingTeam ? 'Editar Time' : 'Novo Time'}</h3>
                  
                  <div className="flex justify-center mb-6">
                      <div className="relative group">
                          <div className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden">
                              {teamForm.logo ? (
                                  <img src={teamForm.logo} className="w-full h-full object-cover" />
                              ) : (
                                  <Image className="text-slate-400 w-10 h-10" />
                              )}
                          </div>
                          <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-sm transform translate-x-1/4 translate-y-1/4">
                              <Camera size={14} />
                              <input type="file" className="hidden" accept="image/*" onChange={handleTeamLogoUpload} />
                          </label>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Time</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-2" 
                            value={teamForm.name}
                            onChange={e => setTeamForm({...teamForm, name: e.target.value})}
                        />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Descrição</label>
                          <textarea 
                            className="w-full border border-slate-300 rounded-lg p-2" 
                            rows={3}
                            value={teamForm.description}
                            onChange={e => setTeamForm({...teamForm, description: e.target.value})}
                        />
                      </div>
                  </div>

                  <div className="flex justify-end mt-6 space-x-2">
                      <button onClick={() => setIsTeamModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold">Cancelar</button>
                      <button onClick={handleSaveTeam} className="px-4 py-2 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800">Salvar</button>
                  </div>
              </div>
          </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{editingUser ? 'Editar Membro' : 'Adicionar Novo Membro'}</h3>
                  
                  <div className="flex justify-center mb-6">
                      <div className="relative group">
                          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden">
                              {userForm.avatarBase64 ? (
                                  <img src={userForm.avatarBase64} className="w-full h-full object-cover" />
                              ) : (
                                  <Users className="text-slate-400 w-10 h-10" />
                              )}
                          </div>
                          <label className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full text-white cursor-pointer hover:bg-orange-600 transition-colors shadow-sm">
                              <Camera size={14} />
                              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                          </label>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Nome Completo</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm" 
                            value={userForm.name}
                            onChange={e => setUserForm({...userForm, name: e.target.value})}
                        />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Email Corporativo</label>
                          <input 
                            type="email" 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm" 
                            value={userForm.email}
                            onChange={e => setUserForm({...userForm, email: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                value={userForm.teamId}
                                onChange={e => setUserForm({...userForm, teamId: e.target.value})}
                            >
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Função</label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                value={userForm.role}
                                onChange={e => setUserForm({...userForm, role: e.target.value})}
                            >
                                <optgroup label="Sistema">
                                    <option value={UserRole.VIEWER}>Visualizador</option>
                                    <option value={UserRole.EDITOR}>Editor</option>
                                    <option value={UserRole.MANAGER}>Gestor</option>
                                    <option value={UserRole.MASTER}>Master Admin</option>
                                </optgroup>
                                {customRoles.length > 0 && (
                                    <optgroup label="Personalizado">
                                        {customRoles.map(cr => (
                                            <option key={cr.id} value={cr.id}>{cr.name}</option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                          </div>
                      </div>

                      {/* Default Password Notice for New Users */}
                      {!editingUser && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start">
                           <Key className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                           <div>
                              <p className="text-xs font-bold text-yellow-800">Senha Padrão: Mudar@123</p>
                              <p className="text-[10px] text-yellow-700">Informe esta senha ao usuário. Ele será obrigado a alterá-la no primeiro acesso.</p>
                           </div>
                        </div>
                      )}
                  </div>

                  <div className="flex justify-end mt-6 space-x-2">
                      <button onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold">Cancelar</button>
                      <button onClick={handleSaveUser} className="px-4 py-2 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800">
                          {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Criar Nova Função Personalizada</h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Nome da Função</label>
                          <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm" 
                            placeholder="Ex: Auditor Externo"
                            value={roleForm.name}
                            onChange={e => setRoleForm({...roleForm, name: e.target.value})}
                        />
                      </div>
                      
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Permissões de Acesso</label>
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                              {AVAILABLE_PERMISSIONS.map(perm => (
                                  <label key={perm.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-white rounded transition-colors">
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${roleForm.permissions.includes(perm.id) ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 bg-white'}`}>
                                          {roleForm.permissions.includes(perm.id) && <CheckSquare size={14}/>}
                                      </div>
                                      <input 
                                        type="checkbox" 
                                        className="hidden"
                                        checked={roleForm.permissions.includes(perm.id)}
                                        onChange={() => togglePermission(perm.id)}
                                      />
                                      <span className="text-sm text-slate-700 font-medium">{perm.label}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="flex justify-end mt-6 space-x-2">
                      <button onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold">Cancelar</button>
                      <button onClick={handleSaveRole} className="px-4 py-2 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800">Criar Função</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TeamManager;