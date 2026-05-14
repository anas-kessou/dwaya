import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [medications, setMedications] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;

    // Load Medications for reference
    const qMeds = query(collection(db, 'medications'), where('userId', '==', user.uid));
    const unsubMeds = onSnapshot(qMeds, (snapshot) => {
      const medsDict: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        medsDict[doc.id] = doc.data();
      });
      setMedications(medsDict);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'medications'));

    // Load History
    const qHist = query(collection(db, 'history'), where('userId', '==', user.uid));
    const unsubHist = onSnapshot(qHist, (snapshot) => {
      const histData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                    .sort((a,b) => b.createdAt - a.createdAt);
      setHistory(histData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'history'));

    return () => {
      unsubMeds();
      unsubHist();
    };
  }, [user]);

  return (
    <main className="flex-1 min-h-screen px-4 lg:px-container-padding py-stack-gap lg:ml-72 mb-16 pt-24">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Page Header & Filters */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">Mon Historique</h1>
            <p className="text-on-surface-variant font-body-lg text-body-lg mt-2">Suivi complet de vos prises médicamenteuses.</p>
          </div>
          <div className="flex gap-4 p-1.5 bg-surface-container-high rounded-xl">
            <button className="px-8 py-3 bg-surface-container-lowest text-primary shadow-sm rounded-lg font-label-xl text-label-xl cursor-pointer">Semaine</button>
            <button className="px-8 py-3 text-on-surface-variant hover:bg-surface-container-lowest/50 rounded-lg font-label-xl text-label-xl transition-colors cursor-pointer">Mois</button>
          </div>
        </section>

        {/* Journal Entries (Timeline Style) */}
        <div className="space-y-12 relative before:content-[''] before:absolute before:left-8 md:before:left-12 before:top-4 before:bottom-0 before:w-1 before:bg-outline-variant/30">
          
          {history.length === 0 ? (
            <p className="text-center text-on-surface-variant relative pl-20 md:pl-28 py-8">Aucun historique disponible pour le moment.</p>
          ) : (
            <article className="relative pl-20 md:pl-28 space-y-6">
              <div className="absolute left-0 top-1 w-16 md:w-24 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-primary ring-4 ring-primary-fixed mb-2"></div>
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Récent</span>
              </div>
              <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-headline-md text-headline-md text-on-surface">Vos Enregistrements</h3>
              </header>

              <div className="bg-surface-container-lowest p-6 rounded-lg shadow-[0_15px_30px_rgba(0,0,0,0.03)] border border-outline-variant/10 space-y-4">
                <div className="divide-y divide-outline-variant/20">
                  {history.map(item => {
                    const med = medications[item.medicationId] || { name: 'Inconnu', dosage: 'N/A' };
                    const isTaken = item.status === 'taken';
                    return (
                      <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-4">
                        <div className={`flex items-center gap-4 ${!isTaken ? 'opacity-70' : ''}`}>
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${isTaken ? 'bg-primary-fixed text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined text-[32px]">{isTaken ? 'pill' : 'medication'}</span>
                          </div>
                          <div>
                            <p className={`font-label-xl text-label-xl text-on-surface ${!isTaken ? 'line-through' : ''}`}>
                              {med.name}
                            </p>
                            <p className="text-on-surface-variant text-label-md">{med.dosage}</p>
                            <p className="text-on-surface-variant text-label-md uppercase text-xs font-bold mt-1 bg-surface-container w-max px-2 rounded-full">{item.layer}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className={`flex items-center gap-2 font-bold ${isTaken ? 'text-secondary' : 'text-error'}`}>
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {isTaken ? 'check_circle' : 'cancel'}
                            </span>
                            <span className="font-label-md text-label-md">
                              {isTaken ? 'Pris' : 'Manqué'} à {item.time} le {item.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          )}

        </div>
      </div>
    </main>
  );
}
