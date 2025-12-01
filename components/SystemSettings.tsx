
import React, { useState, useEffect } from 'react';
import { SystemConfig } from '../types';
import { getSystemConfig, saveSystemConfig } from '../services/mockService';
import { Save, Server, Mail, Shield, X, CheckCircle, AlertTriangle, Database } from 'lucide-react';

interface SystemSettingsProps {
    onClose: () => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ onClose }) => {
    const [config, setConfig] = useState<SystemConfig>(getSystemConfig());
    const [activeTab, setActiveTab] = useState<'DB' | 'SMTP' | 'GENERAL'>('DB');
    const [isSaving, setIsSaving] = useState(false);
    const [testStatus, setTestStatus] = useState<'none' | 'success' | 'error'>('none');

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            saveSystemConfig(config);
            setIsSaving(false);
            alert('Configurações salvas com sucesso!');
        }, 800);
    };

    const testConnection = () => {
        setTestStatus('none');
        setTimeout(() => {
            // Mock connection test logic
            if (activeTab === 'DB') {
                 if (config.dbConfig.host && config.dbConfig.user) setTestStatus('success');
                 else setTestStatus('error');
            } else if (activeTab === 'SMTP') {
                 if (config.smtpConfig.host && config.smtpConfig.user) setTestStatus('success');
                 else setTestStatus('error');
            }
        }, 1500);
    };

    // Shared input class to fix white text issue
    const inputClass = "w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col">
            {/* Header */}
            <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
                <div className="flex items-center">
                    <Server className="mr-3" />
                    <div>
                        <h1 className="text-xl font-bold">Configurações do Sistema</h1>
                        <p className="text-xs text-blue-200">Infraestrutura e Conexões</p>
                    </div>
                </div>
                <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                    <X size={24} />
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full p-6 gap-6">
                {/* Sidebar */}
                <div className="w-64 bg-white rounded-xl shadow-sm border border-slate-200 p-4 h-fit">
                    <nav className="space-y-2">
                        <button 
                            onClick={() => setActiveTab('DB')}
                            className={`w-full flex items-center p-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'DB' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Database size={18} className="mr-3"/> Banco de Dados
                        </button>
                        <button 
                            onClick={() => setActiveTab('SMTP')}
                            className={`w-full flex items-center p-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'SMTP' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Mail size={18} className="mr-3"/> Servidor de Email
                        </button>
                         <button 
                            onClick={() => setActiveTab('GENERAL')}
                            className={`w-full flex items-center p-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'GENERAL' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Shield size={18} className="mr-3"/> Geral e Segurança
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8 overflow-y-auto">
                    {activeTab === 'DB' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="border-b pb-4 mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Banco de Dados (PostgreSQL)</h2>
                                <p className="text-slate-500">Configure a conexão onde os dados da Bravo Forms serão persistidos.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Host / Endpoint</label>
                                    <input 
                                        type="text" 
                                        className={inputClass}
                                        value={config.dbConfig.host}
                                        onChange={e => setConfig({...config, dbConfig: {...config.dbConfig, host: e.target.value}})}
                                        placeholder="Ex: postgres.bravo.internal"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Porta</label>
                                    <input 
                                        type="text" 
                                        className={inputClass}
                                        value={config.dbConfig.port}
                                        onChange={e => setConfig({...config, dbConfig: {...config.dbConfig, port: e.target.value}})}
                                        placeholder="5432"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Usuário</label>
                                    <input 
                                        type="text" 
                                        className={inputClass}
                                        value={config.dbConfig.user}
                                        onChange={e => setConfig({...config, dbConfig: {...config.dbConfig, user: e.target.value}})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Schema Padrão</label>
                                    <input 
                                        type="text" 
                                        className={inputClass}
                                        value={config.dbConfig.schema}
                                        onChange={e => setConfig({...config, dbConfig: {...config.dbConfig, schema: e.target.value}})}
                                        placeholder="public"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Schema onde as VIEWS serão criadas.</p>
                                </div>
                            </div>
                             
                             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                                <h4 className="font-bold text-blue-800 text-sm mb-1 flex items-center"><Database size={14} className="mr-2"/> Persistência e BI</h4>
                                <p className="text-xs text-blue-700">
                                    O sistema utilizará esta conexão para armazenar JSONB e gerar VIEWS para análise de dados.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'SMTP' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="border-b pb-4 mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Servidor de Email (SMTP)</h2>
                                <p className="text-slate-500">Configure o envio de notificações e recuperação de senha.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Servidor SMTP</label>
                                    <input 
                                        type="text" 
                                        className={inputClass}
                                        value={config.smtpConfig.host}
                                        onChange={e => setConfig({...config, smtpConfig: {...config.smtpConfig, host: e.target.value}})}
                                        placeholder="smtp.office365.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Porta</label>
                                    <input 
                                        type="text" 
                                        className={inputClass}
                                        value={config.smtpConfig.port}
                                        onChange={e => setConfig({...config, smtpConfig: {...config.smtpConfig, port: e.target.value}})}
                                        placeholder="587"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Usuário / Email Remetente</label>
                                    <input 
                                        type="email" 
                                        className={inputClass}
                                        value={config.smtpConfig.user}
                                        onChange={e => setConfig({...config, smtpConfig: {...config.smtpConfig, user: e.target.value}})}
                                        placeholder="notificacoes@bravo.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Senha</label>
                                    <input 
                                        type="password" 
                                        className={inputClass}
                                        value={config.smtpConfig.password || ''}
                                        onChange={e => setConfig({...config, smtpConfig: {...config.smtpConfig, password: e.target.value}})}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="col-span-2">
                                     <label className="block text-sm font-bold text-slate-700 mb-2">Email "De" (Exibição)</label>
                                    <input 
                                        type="text" 
                                        className={inputClass}
                                        value={config.smtpConfig.fromEmail || ''}
                                        onChange={e => setConfig({...config, smtpConfig: {...config.smtpConfig, fromEmail: e.target.value}})}
                                        placeholder="Bravo Forms <no-reply@bravo.com>"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'GENERAL' && (
                        <div className="space-y-6 animate-in fade-in">
                             <div className="border-b pb-4 mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Geral</h2>
                                <p className="text-slate-500">Informações da organização.</p>
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Empresa</label>
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    value={config.companyName}
                                    onChange={e => setConfig({...config, companyName: e.target.value})}
                                />
                            </div>
                        </div>
                     )}

                     {/* Footer Actions */}
                     <div className="pt-6 flex items-center justify-between border-t mt-6">
                        <button 
                            onClick={testConnection}
                            className="px-6 py-3 text-slate-700 font-bold border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center bg-white"
                        >
                            Testar Conexão
                            {testStatus === 'success' && <CheckCircle size={18} className="ml-2 text-green-500"/>}
                            {testStatus === 'error' && <AlertTriangle size={18} className="ml-2 text-red-500"/>}
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center"
                        >
                            {isSaving ? 'Salvando...' : <><Save size={18} className="mr-2"/> Salvar Configurações</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
