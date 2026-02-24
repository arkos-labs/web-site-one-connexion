import React, { useState } from 'react';
import { Camera, PenTool, X, Check, Loader2 } from 'lucide-react';
import SignaturePad from './SignaturePad';
import { uploadProofFile, updateOrderProof } from '../../services/driverOrderActions';

export default function ProofModal({ isOpen, onClose, orderId, type, onComplete }) {
    const [step, setStep] = useState(type === 'delivery' ? 'choice' : 'photo'); // 'choice', 'photo', 'signature'
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState(null);

    if (!isOpen) return null;

    const handlePhotoCapture = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        setStep('preview');
    };

    const handleSave = async (data) => {
        setIsUploading(true);
        try {
            const uploadType = type === 'pickup' ? 'pickup' : (step === 'signature' ? 'signature' : 'delivery');
            const result = await uploadProofFile(orderId, data || preview, uploadType);

            if (result.success) {
                await updateOrderProof(orderId, result.publicUrl, uploadType);
                onComplete(result.publicUrl);
                onClose();
            } else {
                alert("Erreur lors de l'envoi de la preuve.");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur inattendue.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase">
                                {type === 'pickup' ? 'Preuve d\'enlèvement' : 'Preuve de livraison'}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                Mission #{orderId.slice(0, 8)}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} className="text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {step === 'choice' && (
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setStep('photo')}
                                    className="flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border-2 border-slate-100 bg-slate-50 hover:border-orange-500 hover:bg-orange-50 transition-all group"
                                >
                                    <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors shadow-sm">
                                        <Camera size={28} />
                                    </div>
                                    <span className="text-xs font-black uppercase text-slate-600 group-hover:text-orange-600">Prendre Photo</span>
                                </button>
                                <button
                                    onClick={() => setStep('signature')}
                                    className="flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border-2 border-slate-100 bg-slate-50 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                                >
                                    <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors shadow-sm">
                                        <PenTool size={28} />
                                    </div>
                                    <span className="text-xs font-black uppercase text-slate-600 group-hover:text-indigo-600">Signature Client</span>
                                </button>
                            </div>
                        )}

                        {step === 'photo' && (
                            <div className="flex flex-col items-center gap-6 py-4">
                                <label className="w-full flex flex-col items-center justify-center gap-4 p-12 rounded-[2.5rem] border-4 border-dashed border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group">
                                    <div className="h-20 w-20 rounded-3xl bg-white flex items-center justify-center text-slate-300 group-hover:text-orange-500 group-hover:scale-110 transition-all shadow-sm">
                                        <Camera size={40} />
                                    </div>
                                    <div className="text-center">
                                        <span className="block text-xs font-black uppercase text-slate-900 mb-1">Cliquer pour capturer</span>
                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prenez une photo du colis sur place</span>
                                    </div>
                                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
                                </label>
                            </div>
                        )}

                        {step === 'preview' && (
                            <div className="flex flex-col gap-6">
                                <div className="relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden border-4 border-white shadow-lg bg-slate-100">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setPreview(null); setStep('photo'); }}
                                        className="flex-1 py-4 rounded-2xl border border-slate-200 text-xs font-black uppercase text-slate-400 hover:bg-slate-50 transition-all"
                                    >
                                        Recommencer
                                    </button>
                                    <button
                                        onClick={() => handleSave()}
                                        disabled={isUploading}
                                        className="flex-[2] py-4 rounded-2xl bg-orange-500 text-xs font-black uppercase text-white hover:bg-orange-600 transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                        Confirmer cette photo
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'signature' && (
                            <div className="flex flex-col gap-6">
                                <SignaturePad onSave={(data) => setPreview(data)} onClear={() => setPreview(null)} />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep('choice')}
                                        className="flex-1 py-4 rounded-2xl border border-slate-200 text-xs font-black uppercase text-slate-400 hover:bg-slate-50 transition-all"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        onClick={() => handleSave(preview)}
                                        disabled={!preview || isUploading}
                                        className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-xs font-black uppercase text-white hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                        Valider la signature
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
