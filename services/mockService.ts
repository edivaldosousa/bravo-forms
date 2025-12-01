
import { User, UserRole, Form, FieldType, FormResponse, Team, CustomRole, Template, FormElement, FormTheme, SystemConfig } from '../types';

// BRAVO LOGO BASE64 (Visual Identity: Orange, Blue, Green blocks)
export const BRAVO_LOGO_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSJub25lIj4KICAgIDxwYXRoIGQ9Ik0yNSAxNSBINjUgQzgwIDE1LCA4NSAyNSwgODUgMzUgQzg1IDQ1LCA3NSA1MCwgNjUgNTAgSDI1IFYxNSBaIiBmaWxsPSIjRjU4MjIwIiAvPgogICAgPHBhdGggZD0iTTI1IDQ1IEg2NSBDODUgNDUsIDkwIDU1LCA5MCA2NSBDOTAgNzUsIDgwIDgwLCA3MCA4MCBIMjUgVjQ1IFoiIGZpbGw9IiMxRTNBOEEiIC8+CiAgICA8cGF0aCBkPSJNMjUgNzUgSDYwIEM3NSA3NSwgODAgODAsIDgwIDg1IEM4MCA5MCwgNzAgOTUsIDYwIDk1IEgyNSBWNzUgWiIgZmlsbD0iIzAwQTg1OSIgLz4KPC9zdmc+";

// Mock Teams
let TEAMS: Team[] = [
  { id: 'all', name: 'Corporativo (Global)', description: 'Gestão geral da plataforma', logo: 'https://ui-avatars.com/api/?name=Global&background=1e3a8a&color=fff' },
  { id: 'marketing', name: 'Time de Marketing', description: 'Campanhas e Publicidade', logo: 'https://ui-avatars.com/api/?name=Marketing&background=F58220&color=fff' },
  { id: 'vendas', name: 'Time de Vendas', description: 'Comercial e CRM', logo: 'https://ui-avatars.com/api/?name=Vendas&background=00A859&color=fff' },
  { id: 'operacoes', name: 'Operações Logísticas', description: 'Transporte e Armazenagem', logo: 'https://ui-avatars.com/api/?name=Ops&background=333&color=fff' }
];

// Mock Custom Roles
let CUSTOM_ROLES: CustomRole[] = [
  { 
    id: 'auditor', 
    name: 'Auditor de Qualidade', 
    baseRole: UserRole.VIEWER, 
    permissions: ['view_responses', 'export_data'] 
  }
];

export const AVAILABLE_PERMISSIONS = [
  { id: 'create_form', label: 'Criar Formulários' },
  { id: 'edit_form', label: 'Editar Formulários' },
  { id: 'delete_form', label: 'Excluir Formulários' },
  { id: 'view_responses', label: 'Visualizar Respostas' },
  { id: 'manage_team', label: 'Gerenciar Time' },
  { id: 'export_data', label: 'Exportar Dados' }
];

// Mock Themes (Presets) - ALL INCLUDE LOGO NOW
export const MOCK_THEMES: { id: string, name: string, theme: FormTheme }[] = [
    { id: 'default', name: 'Padrão Bravo', theme: { bgColor: '#f8fafc', formColor: '#ffffff', textColor: '#1e293b', buttonColor: '#f97316', logoUrl: BRAVO_LOGO_URL } },
    { id: 'dark', name: 'Noite Executiva', theme: { bgColor: '#0f172a', formColor: '#1e293b', textColor: '#f1f5f9', buttonColor: '#3b82f6', logoUrl: BRAVO_LOGO_URL } },
    { id: 'ocean', name: 'Oceano Azul', theme: { bgColor: '#eff6ff', formColor: '#ffffff', textColor: '#1e3a8a', buttonColor: '#0ea5e9', logoUrl: BRAVO_LOGO_URL } },
    { id: 'forest', name: 'Floresta', theme: { bgColor: '#f0fdf4', formColor: '#ffffff', textColor: '#14532d', buttonColor: '#16a34a', logoUrl: BRAVO_LOGO_URL } },
    { id: 'sunset', name: 'Pôr do Sol', theme: { bgColor: '#fff7ed', formColor: '#ffffff', textColor: '#7c2d12', buttonColor: '#ea580c', logoUrl: BRAVO_LOGO_URL } },
    { id: 'minimal', name: 'Minimalista', theme: { bgColor: '#ffffff', formColor: '#ffffff', textColor: '#000000', buttonColor: '#000000', logoUrl: BRAVO_LOGO_URL } },
    { id: 'purple', name: 'Criativo', theme: { bgColor: '#faf5ff', formColor: '#ffffff', textColor: '#581c87', buttonColor: '#9333ea', logoUrl: BRAVO_LOGO_URL } },
];

// Helper to create basic elements quickly
const txt = (label: string, req = false): FormElement => ({ id: Math.random().toString(36).substr(2,9), type: FieldType.TEXT, label, required: req });
const num = (label: string, req = false): FormElement => ({ id: Math.random().toString(36).substr(2,9), type: FieldType.NUMBER, label, required: req });
const area = (label: string, req = false): FormElement => ({ id: Math.random().toString(36).substr(2,9), type: FieldType.TEXTAREA, label, required: req });
const date = (label: string, req = false): FormElement => ({ id: Math.random().toString(36).substr(2,9), type: FieldType.DATE, label, required: req });
const sel = (label: string, options: string[], req = false): FormElement => ({ id: Math.random().toString(36).substr(2,9), type: FieldType.SELECT, label, required: req, options });
const chk = (label: string, options: string[], req = false): FormElement => ({ id: Math.random().toString(36).substr(2,9), type: FieldType.CHECKBOX, label, required: req, options });
const file = (label: string, req = false): FormElement => ({ id: Math.random().toString(36).substr(2,9), type: FieldType.FILE_UPLOAD, label, required: req });
const sign = (label: string): FormElement => ({ id: Math.random().toString(36).substr(2,9), type: FieldType.SIGNATURE, label, required: true });

// Mock Templates - Expanded List (20 Models)
export const MOCK_TEMPLATES: Template[] = [
  // --- RH ---
  {
    id: 'rh1', category: 'Recursos Humanos', title: 'Solicitação de Férias', description: 'Formulário padrão para colaboradores solicitarem descanso.',
    elements: [txt('Nome Completo', true), sel('Departamento', ['Operações', 'Vendas', 'RH', 'TI'], true), date('Data de Início', true), date('Data de Retorno', true), area('Observações')]
  },
  {
    id: 'rh2', category: 'Recursos Humanos', title: 'Avaliação de Desempenho', description: 'Review trimestral de colaboradores e metas.',
    elements: [txt('Colaborador', true), sel('Período', ['Q1', 'Q2', 'Q3', 'Q4'], true), sel('Avaliação Geral', ['Superou Expectativas', 'Atendeu', 'Abaixo'], true), area('Pontos Fortes'), area('Pontos a Melhorar')]
  },
  {
    id: 'rh3', category: 'Recursos Humanos', title: 'Candidatura a Vaga', description: 'Coleta de currículos e dados de candidatos externos.',
    elements: [txt('Nome Completo', true), txt('Email', true), txt('Telefone', true), sel('Vaga de Interesse', ['Motorista', 'Analista', 'Gerente'], true), file('Currículo (PDF)', true)]
  },
  {
    id: 'rh4', category: 'Recursos Humanos', title: 'Feedback de Treinamento', description: 'Avaliação de eficácia de treinamentos internos.',
    elements: [txt('Nome do Treinamento', true), date('Data do Curso', true), sel('Instrutor', ['João', 'Maria', 'Externo'], true), sel('Nota (1-5)', ['1', '2', '3', '4', '5'], true), area('Sugestões')]
  },

  // --- ADMINISTRATIVO ---
  {
    id: 'adm1', category: 'Administrativo', title: 'Solicitação de Compras', description: 'Requisição de materiais de escritório ou equipamentos.',
    elements: [txt('Solicitante', true), sel('Tipo de Material', ['Escritório', 'Limpeza', 'TI', 'Copa'], true), area('Descrição dos Itens', true), num('Valor Estimado', true), date('Data Limite')]
  },
  {
    id: 'adm2', category: 'Administrativo', title: 'Reembolso de Despesas', description: 'Formulário para reembolso de viagens e alimentação.',
    elements: [txt('Nome', true), date('Data da Despesa', true), sel('Categoria', ['Alimentação', 'Transporte', 'Hospedagem'], true), num('Valor Total', true), file('Comprovante / Nota Fiscal', true)]
  },
  {
    id: 'adm3', category: 'Administrativo', title: 'Reserva de Sala de Reunião', description: 'Agendamento de espaços físicos.',
    elements: [txt('Organizador', true), sel('Sala', ['Sala Bravo', 'Sala Inovação', 'Auditório'], true), date('Data', true), sel('Horário Início', ['08:00', '09:00', '10:00', '14:00'], true), num('Participantes', true)]
  },
  {
    id: 'adm4', category: 'Administrativo', title: 'Cadastro de Fornecedor', description: 'Registro inicial de novos parceiros.',
    elements: [txt('Razão Social', true), txt('CNPJ', true), txt('Nome do Contato', true), txt('Email Financeiro', true), file('Contrato Social', true)]
  },

  // --- TI & SUPORTE ---
  {
    id: 'ti1', category: 'TI', title: 'Abertura de Chamado', description: 'Reporte de problemas técnicos ou solicitações.',
    elements: [txt('Usuário', true), sel('Tipo de Problema', ['Hardware', 'Software', 'Rede', 'Acesso'], true), sel('Prioridade', ['Baixa', 'Média', 'Alta', 'Crítica'], true), area('Descrição do Erro', true), file('Print do Erro')]
  },
  {
    id: 'ti2', category: 'TI', title: 'Solicitação de Acesso', description: 'Pedido de permissão para sistemas internos.',
    elements: [txt('Nome do Colaborador', true), sel('Sistema', ['ERP', 'CRM', 'BI', 'Email'], true), sel('Nível de Acesso', ['Leitura', 'Edição', 'Administrador'], true), area('Justificativa', true)]
  },

  // --- VENDAS & MKT ---
  {
    id: 'com1', category: 'Vendas', title: 'Cadastro de Cliente', description: 'Ficha cadastral para novos clientes.',
    elements: [txt('Nome Fantasia', true), txt('CNPJ/CPF', true), txt('Endereço Completo', true), txt('Telefone', true), sel('Ramo de Atividade', ['Varejo', 'Indústria', 'Serviços'], true)]
  },
  {
    id: 'com2', category: 'Vendas', title: 'Pesquisa NPS', description: 'Net Promoter Score para clientes.',
    elements: [txt('Nome do Cliente'), sel('Em uma escala de 0 a 10, quanto você indicaria a Bravo?', ['0','1','2','3','4','5','6','7','8','9','10'], true), area('Por que deu essa nota?')]
  },
  {
    id: 'mkt1', category: 'Vendas', title: 'Briefing de Marketing', description: 'Solicitação de peças e campanhas.',
    elements: [txt('Nome da Campanha', true), date('Data de Lançamento', true), sel('Canal', ['Redes Sociais', 'Email', 'Evento', 'Impresso'], true), area('Objetivo da Campanha', true), area('Público Alvo')]
  },

  // --- OPERAÇÕES & LOGÍSTICA ---
  {
    id: 'ops1', category: 'Operações', title: 'Inspeção Veicular (Checklist)', description: 'Verificação diária da frota.',
    elements: [txt('Placa do Veículo', true), txt('Motorista', true), num('Km Atual', true), chk('Itens de Segurança', ['Pneus', 'Freios', 'Luzes', 'Óleo', 'Extintor'], true), area('Avarias Encontradas'), sign('Assinatura do Motorista')]
  },
  {
    id: 'ops2', category: 'Operações', title: 'Relatório de Incidente', description: 'Registro de ocorrências em transporte ou armazém.',
    elements: [date('Data do Ocorrido', true), txt('Local', true), sel('Tipo', ['Avaria de Carga', 'Atraso', 'Acidente', 'Roubo'], true), area('Descrição Detalhada', true), file('Fotos do Ocorrido')]
  },
  {
    id: 'ops3', category: 'Operações', title: 'Controle de EPIs', description: 'Registro de entrega de equipamentos de proteção.',
    elements: [txt('Colaborador', true), chk('EPIs Entregues', ['Capacete', 'Luvas', 'Botas', 'Óculos', 'Protetor Auricular'], true), date('Data de Entrega', true), sign('Recebi os itens')]
  },
  {
    id: 'ops4', category: 'Operações', title: 'Check-list de Limpeza', description: 'Controle de higiene das instalações.',
    elements: [txt('Responsável', true), sel('Área', ['Banheiros', 'Refeitório', 'Escritório', 'Pátio'], true), chk('Itens Verificados', ['Chão', 'Lixeiras', 'Mesas', 'Vidros'], true), sel('Status', ['Conforme', 'Não Conforme'], true)]
  },
  {
    id: 'ops5', category: 'Operações', title: 'Solicitação de Viagem', description: 'Pedido de adiantamento e reserva para viagens.',
    elements: [txt('Destino', true), date('Ida', true), date('Volta', true), sel('Meio de Transporte', ['Carro da Empresa', 'Ônibus', 'Avião'], true), num('Adiantamento Necessário (R$)', true)]
  },
  {
    id: 'ops6', category: 'Operações', title: 'Check-list Manutenção Predial', description: 'Vistoria das instalações físicas.',
    elements: [txt('Técnico', true), sel('Setor', ['Elétrica', 'Hidráulica', 'Ar Condicionado'], true), area('Serviço Realizado', true), chk('Peças Trocadas', ['Sim', 'Não'], true), sign('Visto do Gestor')]
  },
  {
      id: 'sec1', category: 'Segurança', title: 'Permissão de Trabalho (PT)', description: 'Autorização para trabalhos de risco.',
      elements: [txt('Empresa Contratada', true), area('Descrição do Trabalho', true), chk('Riscos Envolvidos', ['Altura', 'Elétrico', 'Espaço Confinado', 'Químico'], true), sign('Técnico de Segurança'), sign('Encarregado')]
  }
];

// MOCK PERSISTENCE LOGIC
const LOAD_FROM_STORAGE = true;
const STORAGE_KEY_PREFIX = 'bravo_forms_';

const load = <T>(key: string, defaultVal: T): T => {
    if (!LOAD_FROM_STORAGE) return defaultVal;
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return stored ? JSON.parse(stored) : defaultVal;
};

const save = (key: string, val: any) => {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
};

// Mock Users
const INITIAL_USERS: User[] = [
  {
    id: 'u0',
    name: 'Admin Master',
    email: 'admin@bravo.com',
    avatar: 'https://ui-avatars.com/api/?name=Admin+Master&background=000&color=fff',
    teamId: 'all',
    teamName: 'Corporativo (Global)',
    role: UserRole.MASTER,
    permissions: ['create_form', 'edit_form', 'delete_form', 'view_responses', 'manage_team', 'export_data'],
    password: 'admin', 
    isFirstAccess: false
  },
  {
    id: 'u1',
    name: 'Alice Gestora',
    email: 'alice@bravo.com',
    avatar: 'https://picsum.photos/seed/alice/200/200',
    teamId: 'marketing',
    teamName: 'Time de Marketing',
    role: UserRole.MANAGER,
    permissions: ['create_form', 'edit_form', 'delete_form', 'view_responses', 'manage_team', 'export_data'],
    password: '123',
    isFirstAccess: false
  },
  {
    id: 'u2',
    name: 'Roberto Editor',
    email: 'roberto@bravo.com',
    avatar: 'https://picsum.photos/seed/bob/200/200',
    teamId: 'marketing',
    teamName: 'Time de Marketing',
    role: UserRole.EDITOR,
    permissions: ['create_form', 'edit_form', 'view_responses'],
    password: '123',
    isFirstAccess: false
  },
  {
    id: 'u3',
    name: 'Carlos Visualizador',
    email: 'carlos@bravo.com',
    avatar: 'https://picsum.photos/seed/charlie/200/200',
    teamId: 'vendas',
    teamName: 'Time de Vendas',
    role: UserRole.VIEWER,
    permissions: ['view_responses'],
    password: '123',
    isFirstAccess: false
  }
];

// Initial Forms
const INITIAL_FORMS: Form[] = [
  {
    id: 'f1',
    title: 'Pesquisa de Campanha Q3',
    description: 'Levantamento interno para ideias de campanha',
    teamId: 'marketing',
    status: 'publicado',
    createdAt: Date.now() - 10000000,
    updatedAt: Date.now() - 100000,
    collaborators: [],
    theme: MOCK_THEMES[2].theme, // Ocean with logo
    elements: [
      { id: 'e1', type: FieldType.TEXT, label: 'Nome da Campanha', required: true },
      { id: 'e2', type: FieldType.SELECT, label: 'Público Alvo', required: true, options: ['Jovens', 'Adultos', 'Idosos'] },
    ]
  }
];

// Initial Config
const INITIAL_CONFIG: SystemConfig = {
    companyName: 'Bravo Serviços Logísticos',
    dbConfig: { host: 'postgres.bravo.internal', port: '5432', user: 'app_user', schema: 'public' },
    smtpConfig: { host: 'smtp.office365.com', port: '587', user: 'notifications@bravo.com', password: '', fromEmail: 'no-reply@bravo.com' }
};

// --- STATE INITIALIZATION WITH STORAGE ---
let forms = load<Form[]>('forms', INITIAL_FORMS);
let users = load<User[]>('users', INITIAL_USERS);
let teams = load<Team[]>('teams', TEAMS);
let customRoles = load<CustomRole[]>('roles', CUSTOM_ROLES);
let systemConfig = load<SystemConfig>('config', INITIAL_CONFIG);
let responses: FormResponse[] = load<FormResponse[]>('responses', []);

// --- SERVICES ---

export const authenticateUser = (email: string, passwordInput: string): { success: boolean, user?: User, error?: string } => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
        return { success: false, error: 'Usuário não encontrado.' };
    }

    if (user.password !== passwordInput) {
        return { success: false, error: 'Senha incorreta.' };
    }

    return { success: true, user };
};

export const changePassword = (userId: string, newPassword: string): boolean => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    users[userIndex] = {
        ...users[userIndex],
        password: newPassword,
        isFirstAccess: false
    };
    save('users', users);
    return true;
};

export const resetPasswordMock = (email: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return !!user; 
};


export const getFormsByTeam = (teamId: string): Form[] => {
  if (teamId === 'all') return forms;
  return forms.filter(f => f.teamId === teamId);
};

export const getFormById = (id: string): Form | undefined => {
  return forms.find(f => f.id === id);
};

export const saveForm = (form: Form): void => {
  // FORCE LOGO ON ALL FORMS
  if (!form.theme) {
      form.theme = MOCK_THEMES[0].theme;
  }
  // Check if logoUrl is missing or different, enforce BRAVO logo
  if (form.theme.logoUrl !== BRAVO_LOGO_URL) {
      form.theme.logoUrl = BRAVO_LOGO_URL;
  }
  
  const index = forms.findIndex(f => f.id === form.id);
  if (index >= 0) {
    forms[index] = { ...form, updatedAt: Date.now() };
  } else {
    forms.push({ ...form, updatedAt: Date.now() });
  }
  save('forms', forms);
};

export const deleteForm = (id: string): void => {
  forms = forms.filter(f => f.id !== id);
  save('forms', forms);
};

export const saveResponse = (formId: string, answers: Record<string, any>, userId: string) => {
  const newResponse: FormResponse = {
    id: Math.random().toString(36).substr(2, 9),
    formId,
    submittedAt: Date.now(),
    submittedBy: userId,
    answers
  };
  responses.push(newResponse);
  save('responses', responses);
};

export const saveImportedResponses = (formId: string, responsesList: Record<string, any>[]) => {
    const newResponses = responsesList.map(answers => ({
        id: Math.random().toString(36).substr(2, 9),
        formId,
        submittedAt: Date.now() - Math.floor(Math.random() * 10000000),
        submittedBy: 'imported_user',
        answers
    }));
    responses = [...responses, ...newResponses];
    save('responses', responses);
};

export const getResponsesByFormId = (formId: string): FormResponse[] => {
  return responses.filter(r => r.formId === formId);
};

// --- Config Services ---
export const getSystemConfig = () => systemConfig;
export const saveSystemConfig = (config: SystemConfig) => {
    systemConfig = config;
    save('config', systemConfig);
};

// --- Team & User Management Functions ---
export const getTeams = () => teams;

export const createTeam = (name: string, description: string, logo?: string) => {
    const newTeam: Team = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        description,
        logo
    };
    teams.push(newTeam);
    save('teams', teams);
    return newTeam;
};

export const updateTeam = (id: string, name: string, description: string, logo?: string) => {
    teams = teams.map(t => t.id === id ? { ...t, name, description, logo: logo || t.logo } : t);
    users = users.map(u => u.teamId === id ? { ...u, teamName: name } : u);
    save('teams', teams);
    save('users', users);
};

export const deleteTeam = (id: string) => {
    teams = teams.filter(t => t.id !== id);
    users = users.map(u => u.teamId === id ? { ...u, teamId: 'all', teamName: 'Corporativo (Global)', role: UserRole.VIEWER } : u);
    save('teams', teams);
    save('users', users);
};

export const getAllUsers = () => users;

export const getCustomRoles = () => customRoles;

export const createCustomRole = (name: string, permissions: string[]) => {
    const newRole: CustomRole = {
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        permissions,
        baseRole: UserRole.VIEWER 
    };
    customRoles.push(newRole);
    save('roles', customRoles);
    return newRole;
};

export const updateUserTeam = (userId: string, teamId: string, role: string) => {
    const team = teams.find(t => t.id === teamId);
    let permissions: string[] = [];
    let customRoleName = undefined;

    if (role === UserRole.MASTER) permissions = ['create_form', 'edit_form', 'delete_form', 'view_responses', 'manage_team', 'export_data'];
    else if (role === UserRole.MANAGER) permissions = ['create_form', 'edit_form', 'delete_form', 'view_responses', 'manage_team', 'export_data'];
    else if (role === UserRole.EDITOR) permissions = ['create_form', 'edit_form', 'view_responses'];
    else if (role === UserRole.VIEWER) permissions = ['view_responses'];
    else {
        const cr = customRoles.find(r => r.id === role);
        if (cr) {
            permissions = cr.permissions;
            customRoleName = cr.name;
        }
    }

    if (team) {
        users = users.map(u => u.id === userId ? { 
            ...u, 
            teamName: team.name, 
            teamId: team.id, 
            role,
            customRoleName,
            permissions
        } : u);
        save('users', users);
    }
};

export const updateFullUser = (userId: string, data: { name: string, email: string, teamId: string, role: string, avatarBase64?: string }) => {
     const team = teams.find(t => t.id === data.teamId);
    let permissions: string[] = [];
    let customRoleName = undefined;

    if (data.role === UserRole.MASTER) permissions = ['create_form', 'edit_form', 'delete_form', 'view_responses', 'manage_team', 'export_data'];
    else if (data.role === UserRole.MANAGER) permissions = ['create_form', 'edit_form', 'delete_form', 'view_responses', 'manage_team', 'export_data'];
    else if (data.role === UserRole.EDITOR) permissions = ['create_form', 'edit_form', 'view_responses'];
    else if (data.role === UserRole.VIEWER) permissions = ['view_responses'];
    else {
        const cr = customRoles.find(r => r.id === data.role);
        if (cr) {
            permissions = cr.permissions;
            customRoleName = cr.name;
        }
    }

    if (team) {
        users = users.map(u => u.id === userId ? { 
            ...u, 
            name: data.name,
            email: data.email,
            avatar: data.avatarBase64 || u.avatar,
            teamName: team.name, 
            teamId: team.id, 
            role: data.role,
            customRoleName,
            permissions
        } : u);
        save('users', users);
    }
}

export const createUser = (name: string, email: string, teamId: string, role: string, avatarBase64?: string) => {
    const team = teams.find(t => t.id === teamId) || teams[0];
    let permissions: string[] = [];
    let customRoleName = undefined;

    if (role === UserRole.MASTER) permissions = ['create_form', 'edit_form', 'delete_form', 'view_responses', 'manage_team', 'export_data'];
    else if (role === UserRole.MANAGER) permissions = ['create_form', 'edit_form', 'delete_form', 'view_responses', 'manage_team', 'export_data'];
    else if (role === UserRole.EDITOR) permissions = ['create_form', 'edit_form', 'view_responses'];
    else if (role === UserRole.VIEWER) permissions = ['view_responses'];
    else {
         const cr = customRoles.find(r => r.id === role);
        if (cr) {
            permissions = cr.permissions;
            customRoleName = cr.name;
        }
    }

    const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        avatar: avatarBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        teamId: team.id,
        teamName: team.name,
        role,
        customRoleName,
        permissions,
        password: 'Mudar@123', 
        isFirstAccess: true
    };
    users.push(newUser);
    save('users', users);
    return newUser;
};

export const addCollaborator = (formId: string, userId: string, role: 'EDITOR' | 'VIEWER' = 'EDITOR') => {
    const form = forms.find(f => f.id === formId);
    if (form) {
        if (!form.collaborators) form.collaborators = [];
        const existing = form.collaborators.find(c => c.userId === userId);
        if (existing) {
            existing.role = role; 
        } else {
            form.collaborators.push({ userId, role, addedAt: Date.now() });
        }
        save('forms', forms);
    }
};

// Import Helper
export const detectFieldTypeFromHeader = (header: string): FieldType => {
    const h = header.toLowerCase();
    if (h.includes('data') || h.includes('date') || h.includes('nascimento') || h.includes('prazo')) return FieldType.DATE;
    if (h.includes('qtd') || h.includes('quantidade') || h.includes('valor') || h.includes('preço') || h.includes('idade') || h.includes('num')) return FieldType.NUMBER;
    if (h.includes('descri') || h.includes('obs') || h.includes('coment')) return FieldType.TEXTAREA;
    if (h.includes('arquivo') || h.includes('anexo') || h.includes('foto') || h.includes('pdf')) return FieldType.FILE_UPLOAD;
    if (h.includes('assinatura')) return FieldType.SIGNATURE;
    if (h.includes('selec') || h.includes('opç') || h.includes('tipo') || h.includes('categoria')) return FieldType.SELECT;
    return FieldType.TEXT; 
};

interface MockJotForm {
    id: string;
    title: string;
    submissions_count: number;
    created_at: string;
    elements: FormElement[];
    submissions: Record<string, any>[]; 
}

const MOCK_JOTFORMS: MockJotForm[] = [
    {
        id: 'JF_001',
        title: 'Formulário de Satisfação (Importado do JotForm)',
        submissions_count: 145,
        created_at: '2024-01-15',
        elements: [
            { id: 'jf_1', label: 'Nome Completo', type: FieldType.TEXT, required: true },
            { id: 'jf_2', label: 'Avaliação (1-10)', type: FieldType.NUMBER, required: true },
            { id: 'jf_3', label: 'Comentários', type: FieldType.TEXTAREA, required: false }
        ],
        submissions: [
            { jf_1: 'João Silva', jf_2: 9, jf_3: 'Ótimo serviço!' },
            { jf_1: 'Maria Souza', jf_2: 10, jf_3: '' }
        ]
    }
];

export const simulateJotFormFetch = async (apiKey: string): Promise<MockJotForm[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_JOTFORMS);
        }, 1500);
    });
};
