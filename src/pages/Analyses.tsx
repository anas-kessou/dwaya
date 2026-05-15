import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function Analyses() {
  const { user } = useAuth();
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  
  const [systolique, setSystolique] = useState('');
  const [diastolique, setDiastolique] = useState('');
  const [glycemie, setGlycemie] = useState('');
  const [temperature, setTemperature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'analyses'),
      where('userId', '==', user.uid),
      where('type', '==', 'tension'),
      orderBy('date', 'desc'),
      limit(7)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const formattedData = snapshot.docs.map(doc => {
        const data = doc.data();
        const dateObj = new Date(data.date);
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        return {
          day: dayNames[dateObj.getDay()],
          value: data.systolique,
          fullDate: data.date
        };
      }).reverse();
      setChartData(formattedData);
    }, (error) => {
      console.error("Error fetching analysis data:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSave = async (type: 'tension' | 'glycemie' | 'temperature') => {
    if (!user || isSubmitting) return;
    
    let analysisData: any = {
      userId: user.uid,
      date,
      time,
      type,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (type === 'tension') {
      if (!systolique || !diastolique) return alert('Veuillez remplir les deux champs de tension.');
      analysisData.systolique = parseFloat(systolique);
      analysisData.diastolique = parseFloat(diastolique);
    } else if (type === 'glycemie') {
      if (!glycemie) return alert('Veuillez remplir le taux de glycémie.');
      analysisData.taux = parseFloat(glycemie);
    } else if (type === 'temperature') {
      if (!temperature) return alert('Veuillez remplir la température.');
      analysisData.temperature = parseFloat(temperature);
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'analyses'), analysisData);
      alert('Analyse enregistrée avec succès.');
      if (type === 'tension') { setSystolique(''); setDiastolique(''); }
      if (type === 'glycemie') setGlycemie('');
      if (type === 'temperature') setTemperature('');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'analyses');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-24 pb-32 px-4 lg:px-container-padding lg:ml-72 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="mb-10">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Nouvelles Analyses</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Enregistrez vos constantes vitales pour un suivi précis.</p>
      </header>

      {/* Date & Time Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-gutter">
        <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10 flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-3xl">calendar_today</span>
          <div className="flex-1">
            <label className="block text-label-md text-on-surface-variant mb-1">Date</label>
            <input 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent border-none p-0 font-label-xl text-label-xl focus:ring-0 text-primary cursor-pointer outline-none" 
              type="date" 
            />
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10 flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-3xl">schedule</span>
          <div className="flex-1">
            <label className="block text-label-md text-on-surface-variant mb-1">Heure</label>
            <input 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-transparent border-none p-0 font-label-xl text-label-xl focus:ring-0 text-primary cursor-pointer outline-none" 
              type="time" 
            />
          </div>
        </div>
      </div>

      {/* Input Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mb-gutter">
        {/* Tension Artérielle */}
        <div className="bg-surface-container-lowest p-8 rounded-lg shadow-md border border-outline-variant/10 flex flex-col gap-6 relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-primary-fixed flex items-center justify-center rounded-full">
              <span className="material-symbols-outlined text-primary text-3xl">monitor_heart</span>
            </div>
            <h3 className="font-headline-md text-headline-md">Tension Artérielle</h3>
          </div>
          <div className="flex gap-4 items-end relative z-10">
            <div className="flex-1">
              <label className="block text-label-md text-on-surface-variant mb-2">Systolique</label>
              <input 
                value={systolique}
                onChange={(e) => setSystolique(e.target.value)}
                className="w-full h-16 bg-surface-container rounded-lg border-2 border-transparent focus:border-primary px-4 font-headline-md text-headline-md outline-none transition-all placeholder:text-outline-variant/50 cursor-text" 
                placeholder="120" 
                type="number" 
              />
            </div>
            <span className="font-headline-md text-on-surface-variant mb-3">/</span>
            <div className="flex-1">
              <label className="block text-label-md text-on-surface-variant mb-2">Diastolique</label>
              <input 
                value={diastolique}
                onChange={(e) => setDiastolique(e.target.value)}
                className="w-full h-16 bg-surface-container rounded-lg border-2 border-transparent focus:border-primary px-4 font-headline-md text-headline-md outline-none transition-all placeholder:text-outline-variant/50 cursor-text" 
                placeholder="80" 
                type="number" 
              />
            </div>
            <span className="font-label-xl text-label-xl text-on-surface-variant mb-4">mmHg</span>
          </div>
          <button 
            onClick={() => handleSave('tension')}
            disabled={isSubmitting || !systolique || !diastolique}
            className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white py-3 rounded-lg font-label-xl text-label-xl transition-all disabled:opacity-50 mt-auto z-10 relative cursor-pointer"
          >
            Enregistrer Tension
          </button>
        </div>

        {/* Glycémie */}
        <div className="bg-surface-container-lowest p-8 rounded-lg shadow-md border border-outline-variant/10 flex flex-col gap-6 relative overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-secondary-container flex items-center justify-center rounded-full">
              <span className="material-symbols-outlined text-secondary text-3xl">bloodtype</span>
            </div>
            <h3 className="font-headline-md text-headline-md">Glycémie</h3>
          </div>
          <div className="flex gap-4 items-end relative z-10">
            <div className="flex-1">
              <label className="block text-label-md text-on-surface-variant mb-2">Taux</label>
              <input 
                value={glycemie}
                onChange={(e) => setGlycemie(e.target.value)}
                className="w-full h-16 bg-surface-container rounded-lg border-2 border-transparent focus:border-secondary px-4 font-headline-md text-headline-md outline-none transition-all placeholder:text-outline-variant/50 cursor-text" 
                placeholder="0.95" 
                step="0.1" 
                type="number" 
              />
            </div>
            <span className="font-label-xl text-label-xl text-on-surface-variant mb-4">g/L</span>
          </div>
          <button 
            onClick={() => handleSave('glycemie')}
            disabled={isSubmitting || !glycemie}
            className="w-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-white py-3 rounded-lg font-label-xl text-label-xl transition-all disabled:opacity-50 mt-auto z-10 relative cursor-pointer"
          >
            Enregistrer Glycémie
          </button>
        </div>

        {/* Température */}
        <div className="bg-surface-container-lowest p-8 rounded-lg shadow-md border border-outline-variant/10 flex flex-col gap-6 relative overflow-hidden group hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed/30 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-tertiary-fixed flex items-center justify-center rounded-full">
              <span className="material-symbols-outlined text-tertiary text-3xl">device_thermostat</span>
            </div>
            <h3 className="font-headline-md text-headline-md">Température</h3>
          </div>
          <div className="flex gap-4 items-end relative z-10">
            <div className="flex-1">
              <label className="block text-label-md text-on-surface-variant mb-2">Température</label>
              <input 
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full h-16 bg-surface-container rounded-lg border-2 border-transparent focus:border-tertiary-container px-4 font-headline-md text-headline-md outline-none transition-all placeholder:text-outline-variant/50 cursor-text" 
                placeholder="36.6" 
                step="0.1" 
                type="number" 
              />
            </div>
            <span className="font-label-xl text-label-xl text-on-surface-variant mb-4">°C</span>
          </div>
          <button 
            onClick={() => handleSave('temperature')}
            disabled={isSubmitting || !temperature}
            className="w-full bg-tertiary/10 text-tertiary hover:bg-tertiary hover:text-white py-3 rounded-lg font-label-xl text-label-xl transition-all disabled:opacity-50 mt-auto z-10 relative cursor-pointer"
          >
            Enregistrer Température
          </button>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-gutter">
        <button className="w-full bg-primary hover:bg-primary-container text-on-primary py-6 rounded-lg font-headline-md text-headline-md shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-4 cursor-pointer">
          <span className="material-symbols-outlined">save</span>
          Enregistrer
        </button>
      </div>

      {/* Trends Chart Section */}
      <section className="bg-surface-container-lowest p-8 rounded-lg shadow-md border border-outline-variant/10">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
          <div>
            <h3 className="font-headline-md text-headline-md">Tendances Récentes</h3>
            <p className="text-on-surface-variant font-body-md text-body-md">Évolution de votre tension systolique</p>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-1 bg-primary-fixed text-on-primary-fixed rounded-full text-label-md font-label-md self-start">7 derniers jours</span>
          </div>
        </div>

        <div className="w-full h-64 bg-surface-container/30 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0058be" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0058be" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#424754', fontSize: 16, fontWeight: 500}} dy={10} />
              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
              <Area type="monotone" dataKey="value" stroke="#0058be" strokeWidth={4} fillOpacity={1} fill="url(#chartGradient)" activeDot={{r: 8}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}
