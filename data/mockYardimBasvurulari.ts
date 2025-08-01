import { YardimBasvurusu, BasvuruStatus, YardimTuru, BasvuruOncelik } from '../types';

export const MOCK_YARDIM_BASVURULARI: YardimBasvurusu[] = [
    {
        id: 1,
        basvuruSahibiId: 1, // Ahmet Yılmaz
        basvuruTuru: YardimTuru.ACIL,
        talepTutari: 750,
        oncelik: BasvuruOncelik.YUKSEK,
        basvuruTarihi: '2024-07-12',
        durum: BasvuruStatus.ONAYLANAN,
        degerlendirmeNotu: 'Kira ve fatura borçları nedeniyle acil destek gerekiyor. Komisyon tarafından onaylandı.',
        talepDetayi: 'Eşim ve 3 çocuğumla yaşıyorum, işimi yeni kaybettim. Bu aylık kiramı ve elektrik faturamı ödeyemiyorum. Acil yardıma ihtiyacımız var.',
        aiOzet: 'İş kaybı nedeniyle kira ve fatura ödemekte zorlanan 5 kişilik bir aile için acil nakit yardımı talep ediliyor.',
        aiOncelik: BasvuruOncelik.YUKSEK,
        baskanOnayi: true,
        baskanOnayNotu: "Aciliyeti göz önünde bulundurularak onaylanmıştır.",
        odemeId: 1
    },
    {
        id: 2,
        basvuruSahibiId: 4, // Zeynep Demir
        basvuruTuru: YardimTuru.EGITIM,
        talepTutari: 1200,
        oncelik: BasvuruOncelik.ORTA,
        basvuruTarihi: '2024-07-05',
        durum: BasvuruStatus.ONAYLANAN,
        degerlendirmeNotu: 'İlkokula giden iki çocuğunun okul masrafları için talepte bulunuyor. Komisyon tarafından onaylandı.',
        talepDetayi: 'İki çocuğumun okul kırtasiye ve forma masrafları için desteğe ihtiyacım var. Devlet okuluna gidiyorlar ama yine de masraflar çok fazla geliyor.',
        aiOzet: 'İki ilkokul öğrencisinin kırtasiye ve okul forması masrafları için eğitim yardımı talep ediliyor.',
        aiOncelik: BasvuruOncelik.ORTA,
        baskanOnayi: null,
        baskanOnayNotu: null,
    },
    {
        id: 3,
        basvuruSahibiId: 1, // Ahmet Yılmaz
        basvuruTuru: YardimTuru.SAGLIK,
        talepTutari: 400,
        oncelik: BasvuruOncelik.YUKSEK,
        basvuruTarihi: '2024-06-20',
        durum: BasvuruStatus.REDDEDILEN,
        degerlendirmeNotu: 'Talep edilen ilaçlar SGK tarafından karşılandığı için komisyon tarafından reddedildi.',
        talepDetayi: 'Kronik rahatsızlığı olan eşim için aylık ilaç masraflarımız var. Bu ay ilaçları alamadık.',
        aiOzet: 'Kronik hastalığı olan bir kişi için aylık ilaç masraflarının karşılanması talep ediliyor.',
        aiOncelik: BasvuruOncelik.YUKSEK,
        baskanOnayi: null,
        baskanOnayNotu: null,
    },
    {
        id: 4,
        basvuruSahibiId: 4, // Zeynep Demir
        basvuruTuru: YardimTuru.ACIL,
        talepTutari: 2500,
        oncelik: BasvuruOncelik.YUKSEK,
        basvuruTarihi: '2024-07-18',
        durum: BasvuruStatus.BEKLEYEN,
        degerlendirmeNotu: '',
        talepDetayi: 'Ev sahibim evden çıkmamızı istiyor, yeni bir eve taşınmak için depozito ve nakliye parasına ihtiyacımız var. Kalacak yerimiz yok.',
        aiOzet: 'Evden çıkarılma riskiyle karşı karşıya olan bir aile, yeni bir ev için acil depozito ve nakliye yardımı talep ediyor.',
        aiOncelik: BasvuruOncelik.YUKSEK,
        baskanOnayi: null,
        baskanOnayNotu: null,
    }
];
