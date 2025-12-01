
import React, { useState, useRef, useEffect } from 'react';
import { Form, FieldType, LogicRule } from '../types';
import { saveResponse, MOCK_THEMES, BRAVO_LOGO_URL } from '../services/mockService';
import { ArrowLeft, CheckCircle, UploadCloud, Eraser, PenTool, AlertTriangle } from 'lucide-react';

interface FormViewerProps {
  form: Form;
  onClose: () => void;
}

const FormViewer: React.FC<FormViewerProps> = ({ form, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  // Use form theme or default
  const theme = form.theme || MOCK_THEMES[0].theme;
  
  // Fallback logo if theme doesn't have one (for older forms)
  const logoUrl = theme.logoUrl || BRAVO_LOGO_URL;

  // Helper to check if a field should be visible based on Logic
  const isFieldVisible = (elementId: string) => {
    const element = form.elements.find(el => el.id === elementId);
    if (!element || !element.logic) return true;

    const { dependsOnId, condition, value } = element.logic;
    const dependentValue = formData[dependsOnId];

    if (condition === 'equals') {
       return dependentValue === value;
    }
    return true;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    form.elements.forEach(el => {
      if (!isFieldVisible(el.id)) return; // Don't validate hidden fields

      if (el.required) {
        const val = formData[el.id];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          newErrors[el.id] = 'Este campo é obrigatório';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
        // Save to mock backend
        saveResponse(form.id, formData, 'anonymous');
        
        setTimeout(() => {
            setSubmitted(true);
        }, 600);
    } else {
        // Scroll to first error
        const firstErrorId = Object.keys(errors)[0];
        const element = document.getElementById(`field-${firstErrorId}`);
        if(element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleInputChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear error when user types
    if (errors[id]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[id];
        return newErrs;
      });
    }
  };

  // --- Signature Pad Logic (Enhanced) ---
  const initSignature = (id: string) => {
    const canvas = canvasRefs.current[id];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let isDrawing = false;
    
    // Setup Canvas Styles
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b'; // Slate 800

    // Get exact position relative to canvas element
    const getPos = (e: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ((e as TouchEvent).touches && (e as TouchEvent).touches.length > 0) {
            clientX = (e as TouchEvent).touches[0].clientX;
            clientY = (e as TouchEvent).touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault(); // Prevent scrolling on touch
      isDrawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const end = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (isDrawing) {
          ctx.closePath();
          isDrawing = false;
          // Mark as signed in formData
          handleInputChange(id, 'signed_content_base64'); 
      }
    };

    // Remove old listeners to prevent duplication if re-rendering
    
    // Mouse Events
    canvas.onmousedown = start;
    canvas.onmousemove = draw;
    canvas.onmouseup = end;
    canvas.onmouseleave = end;

    // Touch Events
    canvas.ontouchstart = start;
    canvas.ontouchmove = draw;
    canvas.ontouchend = end;
  };

  const clearSignature = (id: string) => {
      const canvas = canvasRefs.current[id];
      if(!canvas) return;
      const ctx = canvas.getContext('2d');
      if(ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        handleInputChange(id, ''); // Clear data
      }
  };

  useEffect(() => {
    // Init canvases for signatures
    form.elements.forEach(el => {
        if (el.type === FieldType.SIGNATURE && isFieldVisible(el.id)) {
            // Tiny delay to ensure layout is done
            setTimeout(() => initSignature(el.id), 100);
        }
    });
  });

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in duration-500" style={{ backgroundColor: theme.bgColor }}>
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-100">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Sucesso!</h2>
            <p className="text-slate-500 mb-8 text-lg">Seu formulário foi enviado para o time.</p>
            <button 
                onClick={onClose}
                className="w-full text-white py-4 rounded-xl hover:opacity-90 transition-opacity font-bold shadow-lg"
                style={{ backgroundColor: theme.buttonColor }}
            >
                Voltar ao Painel
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500" style={{ backgroundColor: theme.bgColor }}>
       <div className="bg-white border-b px-6 py-4 flex items-center shadow-sm sticky top-0 z-30">
        <button onClick={onClose} className="text-slate-500 hover:text-blue-900 flex items-center text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-12 px-4">
        <div className="max-w-2xl mx-auto">
            {/* Form Card */}
            <form onSubmit={handleSubmit} className="rounded-xl shadow-xl overflow-hidden border border-slate-200 transition-colors duration-500" style={{ backgroundColor: theme.formColor }}>
                
                {/* Banner */}
                {theme.bannerImage ? (
                    <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${theme.bannerImage})` }}></div>
                ) : (
                    <div className="h-4 w-full" style={{backgroundColor: theme.buttonColor}}></div>
                )}

                {/* Header */}
                <div className="px-10 pt-10 pb-6 relative overflow-hidden text-center border-b border-black/5" style={{ color: theme.textColor }}>
                     {/* LOGO IN HEAD */}
                     {logoUrl && (
                         <div className="flex justify-center mb-6">
                             <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                                <img src={logoUrl} className="h-16 w-16" alt="Bravo Logo" />
                             </div>
                         </div>
                     )}
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold mb-3">{form.title}</h1>
                        <p className="text-lg opacity-90">{form.description}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-10 space-y-8">
                    {form.elements.map((el) => {
                        if (!isFieldVisible(el.id)) return null;
                        const hasError = !!errors[el.id];

                        return (
                        <div id={`field-${el.id}`} key={el.id} className="flex flex-col animate-in slide-in-from-bottom-2 duration-500">
                            <label className="text-sm font-bold mb-2.5 uppercase tracking-wide flex items-center justify-between" style={{ color: theme.textColor }}>
                                <span>{el.label} {el.required && <span className="text-red-500" title="Obrigatório">*</span>}</span>
                                {hasError && <span className="text-red-500 text-xs normal-case flex items-center"><AlertTriangle size={12} className="mr-1"/> {errors[el.id]}</span>}
                            </label>

                            {el.type === FieldType.TEXT && (
                                <input 
                                    type="text" 
                                    placeholder={el.placeholder}
                                    className={`w-full p-4 border rounded-xl outline-none transition-all bg-slate-50 text-slate-800 focus:bg-white ${hasError ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-300 focus:ring-2 focus:ring-opacity-50'}`}
                                    style={{ borderColor: hasError ? undefined : 'rgba(0,0,0,0.1)' }}
                                    onChange={(e) => handleInputChange(el.id, e.target.value)}
                                    value={formData[el.id] || ''}
                                />
                            )}
                            
                            {el.type === FieldType.NUMBER && (
                                <input 
                                    type="number" 
                                    placeholder={el.placeholder}
                                    className={`w-full p-4 border rounded-xl outline-none transition-all bg-slate-50 text-slate-800 focus:bg-white ${hasError ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-300 focus:ring-2 focus:ring-opacity-50'}`}
                                    onChange={(e) => handleInputChange(el.id, e.target.value)}
                                    value={formData[el.id] || ''}
                                />
                            )}

                            {el.type === FieldType.TEXTAREA && (
                                <textarea 
                                    rows={4}
                                    placeholder={el.placeholder}
                                    className={`w-full p-4 border rounded-xl outline-none transition-all bg-slate-50 text-slate-800 focus:bg-white ${hasError ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-300 focus:ring-2 focus:ring-opacity-50'}`}
                                    onChange={(e) => handleInputChange(el.id, e.target.value)}
                                    value={formData[el.id] || ''}
                                />
                            )}

                             {el.type === FieldType.DATE && (
                                <input 
                                    type="date"
                                    className={`w-full p-4 border rounded-xl outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 ${hasError ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-300 focus:ring-2 focus:ring-opacity-50'}`}
                                    onChange={(e) => handleInputChange(el.id, e.target.value)}
                                    value={formData[el.id] || ''}
                                />
                            )}

                            {el.type === FieldType.SELECT && (
                                <div className="relative">
                                    <select 
                                        className={`w-full p-4 border rounded-xl outline-none transition-all bg-slate-50 text-slate-800 focus:bg-white appearance-none ${hasError ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-300 focus:ring-2 focus:ring-opacity-50'}`}
                                        onChange={(e) => handleInputChange(el.id, e.target.value)}
                                        value={formData[el.id] || ''}
                                    >
                                        <option value="">Selecione uma opção...</option>
                                        {el.options?.map((opt, i) => (
                                            <option key={i} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                            )}

                            {el.type === FieldType.CHECKBOX && (
                                <div className={`space-y-3 bg-slate-50 p-4 rounded-xl border ${hasError ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'}`}>
                                    {el.options?.map((opt, i) => (
                                        <label key={i} className="flex items-center cursor-pointer group">
                                            <div className="relative flex items-center">
                                              <input 
                                                  type="checkbox" 
                                                  className="peer w-5 h-5 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                                                  onChange={(e) => {
                                                     // Multi-select logic simulation (assuming single for this mock or handle array)
                                                     handleInputChange(el.id, opt);
                                                  }}
                                                  checked={formData[el.id] === opt}
                                              />
                                            </div>
                                            <span className="ml-3 text-slate-700 group-hover:text-orange-600 transition-colors font-medium">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {el.type === FieldType.FILE_UPLOAD && (
                                <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-orange-50 hover:border-orange-300 transition-colors cursor-pointer relative bg-slate-50 group ${hasError ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={() => handleInputChange(el.id, "arquivo_anexado.pdf")} />
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                        <UploadCloud className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <p className="text-base font-bold text-slate-700">Clique ou arraste arquivo</p>
                                    <p className="text-sm text-slate-400 mt-1">PDF, DOC, JPG (Max 10MB)</p>
                                    {formData[el.id] && (
                                        <div className="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold flex items-center animate-in zoom-in">
                                            <CheckCircle size={16} className="mr-2" />
                                            Arquivo anexado com sucesso!
                                        </div>
                                    )}
                                </div>
                            )}

                            {el.type === FieldType.SIGNATURE && (
                                <div className={`border-2 rounded-xl overflow-hidden relative bg-[#fffdf5] ${hasError ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'}`}>
                                    <div className="absolute top-3 left-3 flex items-center text-slate-400 text-xs uppercase font-bold tracking-widest pointer-events-none select-none">
                                        <PenTool size={12} className="mr-1" /> Área de Assinatura
                                    </div>
                                    
                                    {/* Texture effect */}
                                    <div className="absolute inset-0 pointer-events-none opacity-5" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

                                    <canvas 
                                        ref={(r) => { canvasRefs.current[el.id] = r; }}
                                        width={600}
                                        height={200}
                                        className="w-full h-48 cursor-crosshair touch-none"
                                    />
                                    
                                    {/* Baseline */}
                                    <div className="absolute bottom-10 left-10 right-10 border-b-2 border-slate-300 pointer-events-none"></div>
                                    <div className="absolute bottom-4 left-10 text-xs text-slate-400 font-medium">Assine acima da linha</div>

                                    <div className="absolute top-2 right-2">
                                         <button 
                                            type="button" 
                                            onClick={() => clearSignature(el.id)}
                                            className="text-xs flex items-center text-slate-500 hover:text-red-600 bg-white/80 hover:bg-red-50 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 transition-colors backdrop-blur-sm"
                                        >
                                            <Eraser size={14} className="mr-1" /> Limpar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )})}
                </div>

                {/* Footer */}
                <div className="px-10 py-8 border-t border-black/5 flex justify-end" style={{ backgroundColor: theme.formColor }}>
                    <button 
                        type="submit"
                        className="text-white px-10 py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center hover:opacity-90"
                        style={{ backgroundColor: theme.buttonColor }}
                    >
                       Enviar Formulário
                    </button>
                </div>
            </form>
            
            <div className="text-center mt-10 text-sm flex items-center justify-center" style={{ color: theme.textColor, opacity: 0.6 }}>
                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: theme.buttonColor }}></span>
                Powered by <span className="font-bold ml-1">Bravo Forms</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FormViewer;
