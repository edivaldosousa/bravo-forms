
import React, { useState } from 'react';
import { FieldType, FormElement } from '../types';
import { detectFieldTypeFromHeader, simulateJotFormFetch } from '../services/mockService';
import { Wand2, FileSpreadsheet, X, ArrowRight, Loader2, Database, Key, CheckCircle, DownloadCloud } from 'lucide-react';

interface ImportWizardProps {
  onImport: (title: string, elements: FormElement[], responses?: Record<string, any>[]) => void;
  onClose: () => void;
}

const ImportWizard: React.FC<ImportWizardProps> = ({ onImport, onClose }) => {
  const [activeTab, setActiveTab] = useState<'CSV' | 'API'>('CSV');
  
  // CSV State
  const [step, setStep] = useState<1 | 2>(1);
  const [inputText, setInputText] = useState('');
  const [formTitle, setFormTitle] = useState('Formulário Importado');
  const [detectedFields, setDetectedFields] = useState<FormElement[]>([]);
  const [detectedResponses, setDetectedResponses] = useState<Record<string, any>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // API State
  const [apiKey, setApiKey] = useState('');
  const [isApiConnecting, setIsApiConnecting] = useState(false);
  const [apiForms, setApiForms] = useState<any[]>([]);
  const [selectedApiForm, setSelectedApiForm] = useState<any | null>(null);

  // --- CSV LOGIC ---

  const analyzeCSV = () => {
    setIsProcessing(true);
    setTimeout(() => {
        const lines = inputText.split('\n').filter(l => l.trim().length > 0);
        if (lines.length === 0) {
            setIsProcessing(false);
            return;
        }

        // 1. Detect Delimiter (Comma or Tab)
        const firstLine = lines[0];
        const delimiter = firstLine.includes('\t') ? '\t' : ',';

        // 2. Parse Headers (Row 1)
        const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
        
        const newElements: FormElement[] = headers.map(header => ({
            id: Math.random().toString(36).substr(2, 9),
            label: header,
            type: detectFieldTypeFromHeader(header),
            required: false
        }));

        setDetectedFields(newElements);

        // 3. Parse Data (Rows 2+)
        const responses: Record<string, any>[] = [];
        for (let i = 1; i < lines.length; i++) {
            const rowValues = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
            const responseObj: Record<string, any> = {};
            
            newElements.forEach((el, index) => {
                if (index < rowValues.length) {
                    responseObj[el.id] = rowValues[index];
                }
            });
            responses.push(responseObj);
        }

        setDetectedResponses(responses);
        setStep(2);
        setIsProcessing(false);
    }, 1200);
  };

  const finalizeCSVImport = () => {
      onImport(formTitle, detectedFields, detectedResponses);
  };

  // --- API LOGIC ---

  const connectJotForm = async () => {
      if(!apiKey) return;
      setIsApiConnecting(true);
      try {
          const forms = await simulateJotFormFetch(apiKey);
          setApiForms(forms);
      } catch (e) {
          console.error(e);
      } finally {
          setIsApiConnecting(false);
      }
  };

  const handleApiImport = () => {
      if(!selectedApiForm) return;
      
      // Map API Structure to Internal Structure
      const elements: FormElement[] = selectedApiForm.elements.map((el: any) => ({
          ...el,
          id: Math.random().toString(36).substr(2, 9) // Regenerate IDs to avoid conflicts or keep original if valid string
      }));
      
      // Map Responses: Need to match old IDs to new IDs
      // For this mock, we assume order matches or simple mapping
      // Simulating "Smart Mapping":
      const responses = selectedApiForm.submissions.map((sub: any) => {
          const newSub: Record<string, any> = {};
          // Mapping logic would go here. For the mock, we know the keys align roughly or we just pass them.
          // Since we regenerated IDs above, we need to be careful.
          // Simplified: We will use the original IDs from the mock service for the elements to ensure data mapping works.
          return sub; 
      });

      // Correction: Use original IDs for the elements so the mock data matches
      const finalElements = selectedApiForm.elements; 

      onImport(selectedApiForm.title, finalElements, selectedApiForm.submissions);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-900 to-slate-900 text-white flex-shrink-0">
                <div>
                    <h2 className="text-xl font-bold flex items-center">
                        <Wand2 className="mr-2 text-orange-400" /> Mágico de Importação
                    </h2>
                    <p className="text-blue-200 text-xs opacity-90">Traga seus formulários e dados de outras fontes</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                    <X size={20} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
                <button 
                    onClick={() => setActiveTab('CSV')}
                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center ${activeTab === 'CSV' ? 'bg-white text-blue-900 border-t-2 border-t-blue-900' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <FileSpreadsheet className="mr-2 w-4 h-4" /> Texto / CSV / Excel
                </button>
                <button 
                    onClick={() => setActiveTab('API')}
                    className={`flex-1 py-3 text-sm font-bold flex items-center justify-center ${activeTab === 'API' ? 'bg-white text-orange-600 border-t-2 border-t-orange-600' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    <Key className="mr-2 w-4 h-4" /> Integração JotForm API
                </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
                {/* CSV TAB CONTENT */}
                {activeTab === 'CSV' && (
                    <>
                    {step === 1 ? (
                        <div className="space-y-4">
                             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                                 <h4 className="font-bold mb-1">Como importar dados?</h4>
                                 <p>Cole o conteúdo do seu arquivo CSV ou Excel abaixo.</p>
                                 <ul className="list-disc list-inside mt-2 text-xs">
                                     <li><strong>Linha 1:</strong> Cabeçalhos (serão os campos do formulário)</li>
                                     <li><strong>Linhas 2+:</strong> Dados (serão importados como respostas automaticamente)</li>
                                 </ul>
                             </div>
                             
                             <div>
                                 <textarea 
                                    className="w-full h-64 p-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs bg-slate-50 leading-relaxed"
                                    placeholder={`Nome Completo, Data de Nascimento, Email, Cargo\nJoão Silva, 1990-05-15, joao@email.com, Gerente\nMaria Souza, 1995-10-20, maria@email.com, Analista`}
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                 />
                             </div>
    
                             <div className="flex justify-end pt-4">
                                 <button 
                                    onClick={analyzeCSV}
                                    disabled={!inputText.trim() || isProcessing}
                                    className={`px-6 py-3 rounded-lg font-bold text-white flex items-center shadow-lg transition-all ${!inputText.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                                 >
                                     {isProcessing ? <><Loader2 className="animate-spin mr-2" /> Processando...</> : <><Wand2 className="mr-2" /> Analisar Dados</>}
                                 </button>
                             </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800">Revisão da Importação</h3>
                                <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">Voltar e editar</button>
                            </div>
    
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Formulário</label>
                                <input 
                                    type="text" 
                                    value={formTitle}
                                    onChange={e => setFormTitle(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded font-bold text-lg text-blue-900"
                                />
                            </div>
    
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <span className="block text-2xl font-bold text-green-700">{detectedFields.length}</span>
                                    <span className="text-xs text-green-800 font-bold uppercase">Campos Identificados</span>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <span className="block text-2xl font-bold text-blue-700">{detectedResponses.length}</span>
                                    <span className="text-xs text-blue-800 font-bold uppercase">Respostas para Importar</span>
                                </div>
                            </div>
    
                            <div className="bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-xs sticky top-0">
                                        <tr>
                                            <th className="p-3">Campo</th>
                                            <th className="p-3">Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {detectedFields.map((field, idx) => (
                                            <tr key={idx}>
                                                <td className="p-3 font-medium text-slate-700">{field.label}</td>
                                                <td className="p-3">
                                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-600">
                                                        {field.type}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="flex justify-end pt-2">
                                 <button 
                                    onClick={finalizeCSVImport}
                                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg flex items-center transition-transform hover:scale-105"
                                 >
                                     <Database className="mr-2" size={18} /> Confirmar Importação
                                 </button>
                            </div>
                        </div>
                    )}
                    </>
                )}

                {/* API TAB CONTENT */}
                {activeTab === 'API' && (
                    <div className="space-y-6">
                        {!apiForms.length ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                    <Key className="w-8 h-8 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Conectar com JotForm</h3>
                                <p className="text-slate-500 text-center max-w-md text-sm mb-6">
                                    Insira sua chave de API do JotForm para listar e importar seus formulários e respostas diretamente.
                                </p>
                                
                                <div className="w-full max-w-md">
                                    <div className="flex gap-2">
                                        <input 
                                            type="password" 
                                            placeholder="Insira sua API Key (Ex: jk83...)" 
                                            className="flex-1 p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                                            value={apiKey}
                                            onChange={e => setApiKey(e.target.value)}
                                        />
                                        <button 
                                            onClick={connectJotForm}
                                            disabled={!apiKey || isApiConnecting}
                                            className="bg-orange-500 text-white px-6 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50"
                                        >
                                            {isApiConnecting ? <Loader2 className="animate-spin"/> : 'Conectar'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 text-center">
                                        (Simulação: Digite qualquer coisa para testar)
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800">Formulários Encontrados ({apiForms.length})</h3>
                                    <button onClick={() => {setApiForms([]); setApiKey(''); setSelectedApiForm(null)}} className="text-xs text-red-500 hover:underline">Desconectar</button>
                                </div>

                                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                                    {apiForms.map((form) => (
                                        <div 
                                            key={form.id} 
                                            onClick={() => setSelectedApiForm(form)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${selectedApiForm?.id === form.id ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                        >
                                            <div>
                                                <h4 className="font-bold text-slate-700">{form.title}</h4>
                                                <div className="flex items-center text-xs text-slate-500 mt-1 space-x-3">
                                                    <span>Criado em: {form.created_at}</span>
                                                    <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                                                        <Database size={10} className="mr-1"/> {form.submissions_count} Respostas
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedApiForm?.id === form.id ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300'}`}>
                                                {selectedApiForm?.id === form.id && <CheckCircle size={14} />}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <button 
                                        onClick={handleApiImport}
                                        disabled={!selectedApiForm}
                                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <DownloadCloud className="mr-2" size={18}/> Importar Selecionado
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ImportWizard;