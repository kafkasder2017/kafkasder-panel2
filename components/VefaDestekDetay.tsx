
import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { VefaDestek, VefaNotu, Odeme, OdemeTuru } from '../types';
import Modal from './Modal';
import { getVefaDestekById, getOdemeler, updateVefaDestek } from '../services/apiService';

const StatCard: React.FC<{ label: string, value: React.ReactNode, icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-full text-blue-600">{icon}</div>
        <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-lg font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors duration-200 ${
            active ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
        }`}
    >
        {children}
    </button>
);

const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const VefaDestekDetay: React.FC = () => {
    const { vefaId } = ReactRouterDOM.useParams<{ vefaId: string }>();
    
    const [vefa, setVefa] = useState<VefaDestek | null>(null);
    const [payments, setPayments] = useState<Odeme[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        if (!vefaId) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [vefaData, paymentsData] = await Promise.all([
                    getVefaDestekById(parseInt(vefaId, 10)),
                    getOdemeler()
                ]);
                setVefa(vefaData);
                setPayments(paymentsData);
            } catch (err: any) {
                setError(err.message || "Veri yüklenemedi.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [vefaId]);

    const [activeTab, setActiveTab] = useState<'support' | 'notes'>('support');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const supportHistory = useMemo(() => {
        if (!vefa) return [];
        return payments.filter(o => o.kisi === vefa.adiSoyadi && o.odemeTuru === OdemeTuru.VEFA_DESTEGI);
    }, [vefa, payments]);
    
    const onUpdateVefa = async (updatedVefa: VefaDestek) => {
        try {
            const saved = await updateVefaDestek(updatedVefa.id, updatedVefa);
            setVefa(saved);
        } catch(err) {
            alert('Vefa Destek kaydı güncellenirken bir hata oluştu.');
        }
    };
    
    const handleSaveNote = (note: Omit<VefaNotu, 'id'>) => {
        if (!vefa) return;
        const noteToAdd: VefaNotu = { ...note, id: Date.now() };
        const updatedVefa = {
            ...vefa,
            notlar: [noteToAdd, ...(vefa.notlar || [])]
        };
        onUpdateVefa(updatedVefa);
        setIsModalOpen(false);
    };
    
    if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
    if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;

    if (!vefa) {
        return (
             <div className="text-center py-20 text-slate-500">
                <h2 className="text-2xl font-bold">Vefa Destek Kaydı Bulunamadı</h2>
                <p className="mt-2">Belirtilen ID ile bir kayıt bulunamadı.</p>
                <ReactRouterDOM.Link to="/vefa-destek" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
                    Vefa Destek Listesine Geri Dön
                </ReactRouterDOM.Link>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-6">
                 <img src={`https://i.pravatar.cc/100?u=${vefa.adiSoyadi}`} alt={vefa.adiSoyadi} className="h-20 w-20 rounded-full" />
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{vefa.adiSoyadi}</h2>
                    <p className="text-slate-500 mt-1">Sorumlu Gönüllü: {vefa.sorumluGonullu}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard label="Yaş" value={calculateAge(vefa.dogumTarihi)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 0-5 5c0 1.5.6 2.8 1.5 3.8A5.4 5.4 0 0 0 12 14a5.4 5.4 0 0 0 3.5-1.2c.9-1 1.5-2.3 1.5-3.8A5 5 0 0 0 12 2Z"/></svg>}/>
                 <StatCard label="Adres" value={vefa.adres} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>}/>
                 <StatCard label="Destek Türü" value={vefa.destekTuru} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 22v-4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4"/><path d="M18 10a6 6 0 0 0-12 0"/></svg>}/>
                 <StatCard label="Destek Durumu" value={vefa.destekDurumu} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h4.83a2 2 0 0 1 1.94 2.53l-1.38 6.14a2 2 0 0 1-1.94 1.47H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2.5"/><path d="M18 9.12V7a2 2 0 0 0-2-2H8.5"/></svg>}/>
            </div>

             <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-slate-200 px-4">
                    <nav className="-mb-px flex space-x-4">
                        <TabButton active={activeTab === 'support'} onClick={() => setActiveTab('support')}>Destek Geçmişi</TabButton>
                        <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>Ziyaret Notları</TabButton>
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'support' && <SupportHistory history={supportHistory} />}
                    {activeTab === 'notes' && <VisitNotes history={vefa.notlar || []} onAddNote={() => setIsModalOpen(true)} />}
                </div>
            </div>

            {isModalOpen && <VefaNotuModal onClose={() => setIsModalOpen(false)} onSave={handleSaveNote} />}
        </div>
    );
};


// Sub-components for tabs
const SupportHistory: React.FC<{ history: Odeme[] }> = ({ history }) => {
    if (!history.length) return <p className="text-sm text-slate-500 text-center py-4">Bu kişiye ait destek ödemesi kaydı bulunamadı.</p>;
    return (
        <ul className="space-y-3">
            {history.map(item => (
                <li key={item.id} className="p-3 bg-slate-50 rounded-md flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-slate-800">{item.aciklama}</p>
                        <p className="text-xs text-slate-500">{item.odemeYontemi}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-green-700">{item.tutar.toLocaleString('tr-TR', {style: 'currency', currency: 'TRY'})}</p>
                        <p className="text-sm text-slate-600">{new Date(item.odemeTarihi).toLocaleDateString('tr-TR')}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
};

const VisitNotes: React.FC<{ history: VefaNotu[], onAddNote: () => void }> = ({ history, onAddNote }) => {
    return (
         <div className="space-y-4">
            <div className="text-right">
                <button onClick={onAddNote} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700">Yeni Not Ekle</button>
            </div>
            <ul className="space-y-3">
                {history.map(item => (
                    <li key={item.id} className="p-3 bg-slate-50 rounded-md">
                        <p className="text-sm text-slate-700">{item.icerik}</p>
                        <div className="flex justify-between items-center mt-2">
                             <span className="text-xs text-slate-500">Ekleyen: {item.girenKullanici}</span>
                             <span className="text-xs text-slate-500">{new Date(item.tarih).toLocaleString('tr-TR')}</span>
                        </div>
                    </li>
                ))}
            </ul>
             {!history.length && <p className="text-sm text-slate-500 text-center py-4">Henüz ziyaret notu girilmemiş.</p>}
        </div>
    );
};

const VefaNotuModal: React.FC<{ onClose: () => void; onSave: (note: Omit<VefaNotu, 'id'>) => void }> = ({onClose, onSave}) => {
    const [formData, setFormData] = useState({ tarih: new Date().toISOString().split('T')[0], icerik: '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({...formData, [e.target.name]: e.target.value});
    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault(); 
        onSave({ ...formData, girenKullanici: 'Admin User' }); // In real app, get user from context
    };
    return (
        <Modal isOpen={true} onClose={onClose} title="Yeni Ziyaret/Destek Notu Ekle">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700">Tarih</label><input type="date" name="tarih" value={formData.tarih} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md"/></div>
                <div><label className="block text-sm font-medium text-slate-700">Not</label><textarea name="icerik" value={formData.icerik} onChange={handleChange} rows={4} className="mt-1 block w-full p-2 border border-slate-300 rounded-md" placeholder="Ziyaret, arama, sağlık durumu vb. bilgiler" required/></div>
                <div className="pt-4 flex justify-end space-x-3"><button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300">İptal</button><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Kaydet</button></div>
            </form>
        </Modal>
    )
}

export default VefaDestekDetay;