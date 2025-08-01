
import React, { useState, useMemo, useEffect } from 'react';
import { Bildirim, BildirimTuru, BildirimDurumu, KullaniciRol } from '../types';
import { ICONS } from '../constants';
import Modal from './Modal';
import { getBildirimler, createBildirim, updateBildirim, deleteBildirim, markAllAsRead as apiMarkAllAsRead } from '../services/apiService';


interface SendNotificationForm {
    target: 'all' | 'role' | 'user';
    role: KullaniciRol | '';
    userId: string;
    title: string;
    content: string;
}

const Bildirimler: React.FC = () => {
    const [bildirimler, setBildirimler] = useState<Bildirim[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [typeFilter, setTypeFilter] = useState<BildirimTuru | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<BildirimDurumu | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchNotifications = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await getBildirimler();
            setBildirimler(data);
        } catch (err: any) {
            setError(err.message || 'Bildirimler yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredBildirimler = useMemo(() => {
        return bildirimler.filter(b => 
            (typeFilter === 'all' || b.tur === typeFilter) &&
            (statusFilter === 'all' || b.durum === statusFilter)
        ).sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
    }, [bildirimler, typeFilter, statusFilter]);
    
    const handleToggleRead = async (id: number, currentStatus: BildirimDurumu) => {
        try {
            const newStatus = currentStatus === BildirimDurumu.OKUNDU ? BildirimDurumu.OKUNMADI : BildirimDurumu.OKUNDU;
            const updated = await updateBildirim(id, { durum: newStatus });
            setBildirimler(bildirimler.map(b => b.id === id ? updated : b));
        } catch (err) {
            alert('Bildirim durumu güncellenemedi.');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteBildirim(id);
            setBildirimler(bildirimler.filter(b => b.id !== id));
        } catch(err) {
            alert('Bildirim silinemedi.');
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiMarkAllAsRead();
            setBildirimler(bildirimler.map(b => ({...b, durum: BildirimDurumu.OKUNDU})));
        } catch (err) {
            alert('Tüm bildirimler okundu olarak işaretlenemedi.');
        }
    };
    
    const handleSendNotification = async (formData: SendNotificationForm) => {
        try {
            const newNotification: Omit<Bildirim, 'id'> = {
                tur: BildirimTuru.TOPLU, // Simplified for this example
                baslik: formData.title,
                icerik: formData.content,
                tarih: new Date().toISOString(),
                durum: BildirimDurumu.OKUNMADI,
                gonderen: 'Admin User'
            };
            const created = await createBildirim(newNotification);
            setBildirimler([created, ...bildirimler]);
            setIsModalOpen(false);
        } catch(err) {
            alert('Bildirim gönderilemedi.');
        }
    };

    const getIconForType = (type: BildirimTuru) => {
        switch(type) {
            case BildirimTuru.SISTEM: return <div className="p-3 bg-red-100 text-red-600 rounded-full">{ICONS.SETTINGS}</div>;
            case BildirimTuru.TOPLU: return <div className="p-3 bg-blue-100 text-blue-600 rounded-full">{ICONS.BELL}</div>;
            case BildirimTuru.KULLANICI: return <div className="p-3 bg-purple-100 text-purple-600 rounded-full">{ICONS.PEOPLE}</div>;
            default: return null;
        }
    }
    
    if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
    if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                 <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-6">
                    <div className="flex items-center space-x-4">
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="px-4 py-2 border border-slate-300 rounded-lg bg-white">
                            <option value="all">Tüm Türler</option>
                            {Object.values(BildirimTuru).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                         <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-4 py-2 border border-slate-300 rounded-lg bg-white">
                            <option value="all">Tüm Durumlar</option>
                            {Object.values(BildirimDurumu).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div className="flex items-center space-x-4">
                         <button onClick={markAllAsRead} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Tümünü Okundu İşaretle</button>
                         <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Yeni Bildirim Gönder</button>
                     </div>
                </div>
                
                <ul className="space-y-3">
                    {filteredBildirimler.map(b => (
                        <li key={b.id} className={`p-4 rounded-lg flex items-start gap-4 transition-colors ${b.durum === BildirimDurumu.OKUNMADI ? 'bg-blue-50' : 'bg-slate-50'}`}>
                            {getIconForType(b.tur)}
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-slate-800">{b.baslik}</h4>
                                    <span className="text-xs text-slate-500">{new Date(b.tarih).toLocaleString('tr-TR')}</span>
                                </div>
                                {b.gonderen && <p className="text-xs text-slate-500 mb-1">Gönderen: {b.gonderen}</p>}
                                <p className="text-sm text-slate-600">{b.icerik}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                 <button onClick={() => handleToggleRead(b.id, b.durum)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full" title={b.durum === BildirimDurumu.OKUNDU ? "Okunmadı olarak işaretle" : "Okundu olarak işaretle"}>
                                     {b.durum === BildirimDurumu.OKUNDU ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>}
                                 </button>
                                <button onClick={() => handleDelete(b.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full" title="Sil">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                 {filteredBildirimler.length === 0 && <div className="text-center py-10 text-slate-500">Gösterilecek bildirim yok.</div>}
            </div>
            {isModalOpen && <SendNotificationModal onClose={() => setIsModalOpen(false)} onSend={handleSendNotification} />}
        </>
    )
};

const SendNotificationModal: React.FC<{onClose: () => void; onSend: (data: SendNotificationForm) => void;}> = ({ onClose, onSend }) => {
    const [formData, setFormData] = useState<SendNotificationForm>({
        target: 'all',
        role: '',
        userId: '',
        title: '',
        content: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            alert('Başlık ve içerik alanları zorunludur.');
            return;
        }
        onSend(formData);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Yeni Bildirim Gönder">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Hedef Kitle</label>
                    <select name="target" value={formData.target} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md bg-white">
                        <option value="all">Tüm Kullanıcılar</option>
                        <option value="role">Belirli Bir Rol</option>
                        <option value="user" disabled>Belirli Bir Kullanıcı (Yakında)</option>
                    </select>
                </div>
                {formData.target === 'role' && (
                    <div>
                         <label className="block text-sm font-medium text-slate-700">Rol Seçin</label>
                         <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md bg-white">
                             <option value="" disabled>Rol seçin...</option>
                             {Object.values(KullaniciRol).map(r => <option key={r} value={r}>{r}</option>)}
                         </select>
                    </div>
                )}
                <div>
                     <label className="block text-sm font-medium text-slate-700">Başlık</label>
                     <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" required />
                </div>
                 <div>
                     <label className="block text-sm font-medium text-slate-700">İçerik</label>
                     <textarea name="content" value={formData.content} onChange={handleChange} rows={5} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" required />
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300">İptal</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Gönder</button>
                 </div>
            </form>
        </Modal>
    );
}

export default Bildirimler;