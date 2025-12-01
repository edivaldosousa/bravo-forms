
export enum UserRole {
  MASTER = 'MASTER',
  MANAGER = 'GESTOR',
  EDITOR = 'EDITOR',
  VIEWER = 'VISUALIZADOR',
  CUSTOM = 'PERSONALIZADO' // Novo tipo para funções criadas
}

export interface Permission {
  id: string;
  label: string;
}

export interface CustomRole {
  id: string;
  name: string;
  permissions: string[]; // Lista de IDs de permissão
  baseRole: UserRole; // O papel do sistema no qual se baseia
}

export enum FieldType {
  TEXT = 'TEXTO',
  NUMBER = 'NUMERO',
  TEXTAREA = 'AREA_TEXTO',
  SELECT = 'SELECAO',
  CHECKBOX = 'CAIXA_SELECAO',
  DATE = 'DATA',
  SIGNATURE = 'ASSINATURA',
  FILE_UPLOAD = 'ARQUIVO'
}

export interface LogicRule {
  dependsOnId: string;
  condition: 'equals' | 'not_equals' | 'contains';
  value: string;
  action: 'show' | 'hide';
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  logo?: string; // Added logo property
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  teamId: string;
  teamName: string; 
  role: UserRole | string; // Pode ser o ID de uma CustomRole
  customRoleName?: string; // Nome de exibição da função
  permissions?: string[]; // Permissões efetivas
  password?: string; // Auth logic
  isFirstAccess?: boolean; // Force password change
}

export interface FormElement {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; 
  logic?: LogicRule; 
  comments?: { user: string; text: string; date: number }[]; 
}

export interface FormCollaborator {
  userId: string;
  role: 'EDITOR' | 'VIEWER';
  addedAt: number;
}

export interface FormTheme {
  bgColor: string;
  formColor: string;
  textColor: string;
  buttonColor: string;
  bannerImage?: string;
  logoUrl?: string; // Logo da Empresa no Form
}

export interface Form {
  id: string;
  title: string;
  description: string;
  teamId: string;
  elements: FormElement[];
  createdAt: number;
  updatedAt: number;
  status: 'publicado' | 'rascunho';
  theme?: FormTheme;
  collaborators?: FormCollaborator[];
  integrations?: {
    slack?: boolean;
    asana?: boolean;
    googleSheets?: boolean;
    sharepoint?: {
      enabled: boolean;
      siteUrl?: string;
      listName?: string;
    };
    notifications?: {
        enabled: boolean;
        emailTo: string; // Email responsável para receber alertas
    };
  };
}

export interface FormResponse {
  id: string;
  formId: string;
  submittedAt: number;
  submittedBy: string; 
  answers: Record<string, any>; 
}

export interface Template {
  id: string;
  category: string;
  title: string;
  description: string;
  elements: FormElement[];
  theme?: FormTheme;
}

export interface SystemConfig {
    companyName: string;
    dbConfig: {
        host: string;
        port: string;
        user: string;
        schema: string; // Database Schema (e.g., public, analytics)
    };
    smtpConfig: {
        host: string;
        port: string;
        user: string;
        password?: string;
        fromEmail?: string;
    };
}
