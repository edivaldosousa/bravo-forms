
import React, { useState } from 'react';
import { MOCK_TEMPLATES } from '../services/mockService';
import { Template } from '../types';
import { Layout, Check, X, Search } from 'lucide-react';

interface TemplateGalleryProps {
  onSelect: (template: Template) => void;
  onClose: () => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', ...Array.from(new Set(MOCK_TEMPLATES.map(t => t.category)))];

  const filteredTemplates = MOCK_TEMPLATES.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
             <h2 className="text-2xl font-bold text-slate-800 flex items-center">
               <Layout className="mr-2 text-orange-500" /> Galeria de Modelos
             </h2>
             <p className="text-slate-500 text-sm">Escolha um ponto de partida para o seu formulário</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-white">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar modelos..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-blue-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Layout size={48} className="mb-2 opacity-50"/>
                    <p>Nenhum modelo encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(t => (
                        <div key={t.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden flex flex-col h-full">
                            <div className="h-32 bg-gradient-to-r from-blue-50 to-orange-50 p-6 flex items-center justify-center">
                                {/* Preview Thumbnail Abstract */}
                                <div className="w-3/4 h-20 bg-white shadow-sm rounded-lg p-2 space-y-2 opacity-80">
                                    <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
                                    <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                                    <div className="h-2 w-full bg-slate-200 rounded"></div>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">{t.category}</span>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">{t.title}</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-3">{t.description}</p>
                                
                                <div className="mt-auto pt-4 border-t border-slate-50">
                                    <button 
                                        onClick={() => onSelect(t)}
                                        className="w-full bg-white border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white py-2 rounded-lg font-bold transition-colors flex items-center justify-center"
                                    >
                                        <Check size={16} className="mr-2"/> Usar Modelo
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
