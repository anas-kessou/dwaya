import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { doc, onSnapshot, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db, sendBoxCommand, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
  const { user } = useAuth();
  const [boxData, setBoxData] = useState<any>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!user) return;

    // 1. Box Status listener
    const boxRef = doc(db, 'boxes', 'box_001');
    const unsubscribeBox = onSnapshot(boxRef, (doc) => {
      if (doc.exists()) {
        setBoxData(doc.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'boxes/box_001');
    });

    // 2. Today's medications
    const medicationsQuery = query(collection(db, 'medications'), where('userId', '==', user.uid));
    const unsubscribeMeds = onSnapshot(medicationsQuery, (snapshot) => {
      setMedications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'medications');
    });

    // 3. Today's history
    const today = new Date().toISOString().split('T')[0];
    const historyQuery = query(
      collection(db, 'history'), 
      where('userId', '==', user.uid),
      where('date', '==', today)
    );
    const unsubscribeHistory = onSnapshot(historyQuery, (snapshot) => {
      setHistory(snapshot.docs.map(d => d.data()));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'history');
    });

    return () => {
      unsubscribeBox();
      unsubscribeMeds();
      unsubscribeHistory();
    };
  }, [user]);

  const handleOpenCompartment = async (layer: number) => {
    try {
      const dayMap: {[key: string]: number} = {'Lundi':0,'Mardi':1,'Mercredi':2,'Jeudi':3,'Vendredi':4,'Samedi':5,'Dimanche':6};
      const currentDayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date());
      const dayIndex = dayMap[currentDayName.charAt(0).toUpperCase() + currentDayName.slice(1)] || 0;
      
      await sendBoxCommand('box_001', `OPEN:${dayIndex}:${layer}`);
      alert('Commande d\'ouverture envoyée !');
    } catch (e) {
      alert('Erreur lors de l\'envoi de la commande.');
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await sendBoxCommand('box_001', 'RESET');
      alert('Signal de réinitialisation envoyé.');
    } catch (e) {
      alert('Erreur.');
    } finally {
      setIsResetting(false);
    }
  };

  const checkStatus = (layer: string) => {
    const isTaken = history.some(h => h.layer === layer);
    const hasMed = medications.some(m => m.layer === layer);
    
    if (isTaken) return 'taken';
    if (hasMed) return 'active';
    return 'empty';
  };

  const statusMatin = checkStatus('matin');
  const statusMidi = checkStatus('apres-midi');
  const statusSoir = checkStatus('soir');

  return (
    <main className="flex-1 lg:ml-72 p-4 lg:p-container-padding pt-24 pb-32 min-h-screen bg-surface-bright">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2">Statut de votre DWAYA</h1>
          <div className="flex items-center gap-3">
            <div className={clsx("w-3 h-3 rounded-full animate-pulse", boxData ? "bg-success" : "bg-error")}></div>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Appareil : {boxData?.boxId || 'Recherche...'} • {boxData ? 'Connecté' : 'Hors ligne'}
            </p>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* Device Illustration Card */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center min-h-[500px] border border-outline-variant/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent"></div>
            
            <div className="relative w-64 h-96 flex flex-col items-center z-10">
              {/* Top Layer: Matin */}
              <div className={clsx(
                "w-48 h-28 border-2 rounded-t-full flex flex-col items-center justify-center relative -mb-2 z-30 transition-all duration-500",
                statusMatin === 'taken' ? "bg-success-container border-success animate-in fade-in" : 
                statusMatin === 'active' ? "bg-primary-container border-primary" : "bg-surface-container-highest border-outline-variant opacity-40"
              )}>
                <span className="material-symbols-outlined text-4xl">
                  {statusMatin === 'taken' ? 'check_circle' : statusMatin === 'active' ? 'notifications_active' : 'circle'}
                </span>
                <span className="font-label-md text-label-md uppercase tracking-widest mt-2">Matin</span>
                <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <div className={clsx("w-3 h-3 rounded-full", statusMatin === 'taken' ? "bg-success shadow-[0_0_8px_#4caf50]" : "bg-outline-variant")}></div>
                </div>
              </div>
              
              {/* Middle Layer: Midi (Après-midi) */}
              <div className={clsx(
                "w-56 h-32 border-4 rounded-xl flex flex-col items-center justify-center relative z-40 transition-all duration-500",
                statusMidi === 'taken' ? "bg-success-container border-success" : 
                statusMidi === 'active' ? "bg-primary-container border-primary shadow-xl ring-4 ring-primary/10 animate-pulse" : "bg-surface-container-highest border-outline-variant opacity-40"
              )}>
                <span className="material-symbols-outlined text-5xl">
                   {statusMidi === 'taken' ? 'check_circle' : statusMidi === 'active' ? 'notifications_active' : 'circle'}
                </span>
                <span className="font-headline-sm text-headline-sm mt-2">Après-midi</span>
              </div>
              
              {/* Bottom Layer: Soir */}
              <div className={clsx(
                "w-48 h-28 border-2 rounded-b-full flex flex-col items-center justify-center relative -mt-2 z-20 transition-all duration-500",
                statusSoir === 'taken' ? "bg-success-container border-success" : 
                statusSoir === 'active' ? "bg-primary-container border-primary" : "bg-surface-container-highest border-outline-variant opacity-40"
              )}>
                <span className="material-symbols-outlined text-4xl">
                   {statusSoir === 'taken' ? 'check_circle' : statusSoir === 'active' ? 'notifications_active' : 'circle'}
                </span>
                <span className="font-label-md text-label-md uppercase tracking-widest mt-2">Soir</span>
                <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <div className={clsx("w-3 h-3 rounded-full", statusSoir === 'taken' ? "bg-success shadow-[0_0_8px_#4caf50]" : "bg-outline-variant")}></div>
                </div>
              </div>
              
              {/* Base Shadow */}
              <div className="w-40 h-8 bg-black/5 rounded-full blur-xl mt-4"></div>
            </div>
          </div>

          {/* Actions & Details Card */}
          <div className="lg:col-span-5 flex flex-col gap-stack-gap">
            {/* Box Health Summary */}
            <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/20 flex flex-col gap-6">
               <h3 className="font-label-xl text-label-xl text-primary flex items-center gap-2">
                 <span className="material-symbols-outlined">health_metrics</span>
                 État Technique
               </h3>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-surface-bright p-4 rounded-xl border border-outline-variant/10">
                   <p className="text-xs text-on-surface-variant uppercase font-bold mb-1">Batterie</p>
                   <div className="flex items-center gap-2 text-2xl font-bold text-secondary">
                     <span className="material-symbols-outlined">{boxData?.battery < 20 ? 'battery_alert' : 'battery_full'}</span>
                     85%
                   </div>
                 </div>
                 <div className="bg-surface-bright p-4 rounded-xl border border-outline-variant/10">
                   <p className="text-xs text-on-surface-variant uppercase font-bold mb-1">Température</p>
                   <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                     <span className="material-symbols-outlined">thermostat</span>
                     {boxData?.temperature || 24}°C
                   </div>
                 </div>
               </div>
            </div>
            
            {/* Manual Controls */}
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-8 flex flex-col gap-4 shadow-sm">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Commandes Forcées</h3>
              
              <button 
                onClick={() => handleOpenCompartment(1)}
                className="w-full h-16 bg-primary text-on-primary rounded-xl font-label-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-primary/20 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">lock_open</span>
                Ouvrir Compartiment Actif
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleOpenCompartment(0)}
                  className="h-14 border border-outline-variant text-on-surface rounded-xl font-label-md flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all"
                >
                  <span className="material-symbols-outlined text-sm">wb_sunny</span>
                  Ouvrir Matin
                </button>
                <button 
                   onClick={() => handleOpenCompartment(2)}
                   className="h-14 border border-outline-variant text-on-surface rounded-xl font-label-md flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all"
                >
                  <span className="material-symbols-outlined text-sm">bedtime</span>
                  Ouvrir Soir
                </button>
              </div>

              <div className="pt-4 border-t border-outline-variant/20">
                <button 
                  onClick={handleReset}
                  disabled={isResetting}
                  className="w-full h-14 border-2 border-dashed border-error/50 text-error rounded-xl font-label-md flex items-center justify-center gap-2 hover:bg-error/5 transition-all"
                >
                  <span className="material-symbols-outlined animate-spin-slow">refresh</span>
                  {isResetting ? 'Réinitialisation...' : 'Réinitialiser DWAYA'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Medication Detailed List */}
        <section className="mt-12">
          <h3 className="font-headline-sm text-headline-sm mb-6">Plan de la journée</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className={clsx(
              "p-6 rounded-2xl border transition-all shadow-sm",
              statusMatin === 'taken' ? "bg-success-container/20 border-success/30" : "bg-surface-container-lowest border-outline-variant/10"
            )}>
              <div className="flex items-center justify-between mb-4">
                <span className={clsx("px-3 py-1 rounded-full text-xs font-bold uppercase", statusMatin === 'taken' ? "bg-success text-white" : "bg-surface-container-highest text-on-surface-variant")}>
                  {statusMatin === 'taken' ? 'TERMINE' : 'MATIN'}
                </span>
                <span className={clsx("material-symbols-outlined", statusMatin === 'taken' ? "text-success" : "text-outline")}>
                  {statusMatin === 'taken' ? 'check_circle' : 'circle'}
                </span>
              </div>
              <h4 className="font-label-xl text-label-xl">Dose du Matin</h4>
              <p className="text-on-surface-variant mt-2 text-sm italic">
                {statusMatin === 'empty' ? 'Aucun médicament prévu' : medications.find(m => m.layer === 'matin')?.name || 'Médicament configuré'}
              </p>
            </div>
            
            <div className={clsx(
              "p-6 rounded-2xl border transition-all shadow-lg relative group",
              statusMidi === 'active' ? "bg-primary-container border-primary ring-4 ring-primary/10 scale-105" : 
              statusMidi === 'taken' ? "bg-success-container/20 border-success/30" : "bg-surface-container-lowest border-outline-variant/10 opacity-60"
            )}>
              <div className="flex items-center justify-between mb-4">
                <span className={clsx("px-3 py-1 rounded-full text-xs font-bold uppercase", statusMidi === 'active' ? "bg-primary text-white" : "bg-surface-container-highest text-on-surface-variant")}>
                  {statusMidi === 'active' ? 'EN ATTENTE' : statusMidi === 'taken' ? 'TERMINE' : 'APRES-MIDI'}
                </span>
                <span className={clsx("material-symbols-outlined", statusMidi === 'active' ? "text-primary animate-bounce" : "text-outline")}>
                  {statusMidi === 'active' ? 'notifications_active' : 'circle'}
                </span>
              </div>
              <h4 className="font-label-xl text-label-xl">Dose du Midi</h4>
              <p className="text-on-surface-variant mt-2 text-sm italic">
                {statusMidi === 'empty' ? 'Aucun médicament prévu' : medications.find(m => m.layer === 'apres-midi')?.name || 'Médicament configuré'}
              </p>
            </div>
            
            <div className={clsx(
              "p-6 rounded-2xl border transition-all shadow-sm",
              statusSoir === 'taken' ? "bg-success-container/20 border-success/30" : "bg-surface-container-lowest border-outline-variant/10"
            )}>
              <div className="flex items-center justify-between mb-4">
                <span className={clsx("px-3 py-1 rounded-full text-xs font-bold uppercase", statusSoir === 'taken' ? "bg-success text-white" : "bg-surface-container-highest text-on-surface-variant")}>
                  {statusSoir === 'taken' ? 'TERMINE' : 'SOIR'}
                </span>
                <span className={clsx("material-symbols-outlined", statusSoir === 'taken' ? "text-success" : "text-outline")}>
                  {statusSoir === 'taken' ? 'check_circle' : 'circle'}
                </span>
              </div>
              <h4 className="font-label-xl text-label-xl">Dose du Soir</h4>
              <p className="text-on-surface-variant mt-2 text-sm italic">
                {statusSoir === 'empty' ? 'Aucun médicament prévu' : medications.find(m => m.layer === 'soir')?.name || 'Médicament configuré'}
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
