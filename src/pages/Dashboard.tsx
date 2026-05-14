import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const [medications, setMedications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'medications'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const medsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMedications(medsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'medications');
    });

    return () => unsubscribe();
  }, [user]);

  const activeCylindersCount = new Set(medications.map(m => m.layer)).size;

  return (
    <main className="pt-24 px-4 lg:px-container-padding max-w-7xl mx-auto space-y-stack-gap">
      {/* Mobile Greeting */}
      <div className="lg:hidden mb-stack-gap">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">Bonjour, {userName}</h1>
        <p className="text-on-surface-variant mt-1">C'est le moment de prendre soin de vous.</p>
      </div>

      {/* Bento Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Cylindrical Visual Section (Left/Top) */}
        <div className="md:col-span-4 flex flex-col gap-stack-gap">
          <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50"></div>
            <h2 className="font-label-xl text-label-xl text-primary mb-8 z-10">Votre DWAYA</h2>
            
            {/* Cylinder Visual Representation */}
            <div className="relative w-40 h-64 flex flex-col gap-2 z-10">
              {/* Top Layer (Soir) */}
              <div className="w-full h-1/3 bg-surface-container-high rounded-t-xl border-4 border-white shadow-md flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-outline">dark_mode</span>
              </div>
              
              {/* Middle Layer (Après-midi) */}
              <div className="w-full h-1/3 bg-secondary-container rounded-md border-4 border-white shadow-md flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-on-secondary-container">light_mode</span>
              </div>
              
              {/* Bottom Layer (Matin) */}
              <div className="w-full h-1/3 bg-primary-container rounded-b-xl border-4 border-white shadow-md flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-white">wb_sunny</span>
              </div>
              
              {/* Base */}
              <div className="w-48 h-4 bg-outline-variant/30 absolute -bottom-6 left-1/2 -translate-x-1/2 blur-lg rounded-full"></div>
            </div>
            
            <p className="text-center mt-12 text-on-surface-variant font-label-md z-10">{activeCylindersCount} compartiments actifs</p>
          </div>
        </div>

        {/* Main Content Area (Right) */}
        <div className="md:col-span-8 flex flex-col gap-stack-gap">
          {/* Today's Overview (Matin, Midi, Soir Cards) */}
          <div>
            <h3 className="font-headline-md text-headline-md mb-gutter">Mes Médicaments Actifs</h3>
            {medications.length === 0 ? (
              <p className="text-on-surface-variant bg-surface-container-low p-6 rounded-lg border border-outline-variant/30">Aucun médicament configuré pour le moment.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-unit">
                {medications.map(med => (
                  <div key={med.id} className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-lg shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-label-xl text-label-xl text-primary">{med.name}</h4>
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full uppercase">{med.layer}</span>
                    </div>
                    <p className="text-on-surface-variant font-body-md text-body-md">{med.dosage} mg - x{med.quantity}</p>
                    <button 
                      onClick={async () => {
                        try {
                          await addDoc(collection(db, 'history'), {
                            userId: user.uid,
                            medicationId: med.id,
                            date: new Date().toISOString().split('T')[0],
                            time: new Date().toTimeString().slice(0, 5),
                            status: 'taken',
                            layer: med.layer,
                            createdAt: serverTimestamp()
                          });
                          alert('Prise enregistrée avec succès !');
                        } catch (e) {
                          handleFirestoreError(e, OperationType.CREATE, 'history');
                        }
                      }}
                      className="mt-2 text-center py-2 px-4 bg-secondary text-white font-label-md text-label-md rounded-lg shadow hover:bg-secondary-container hover:text-on-secondary-container transition-colors active:scale-95 cursor-pointer w-full"
                    >
                      Prendre
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adherence Progress */}
          <div className="bg-surface-container-lowest p-container-padding rounded-lg border border-outline-variant/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-label-xl text-label-xl text-on-surface">Adhérence du jour</h4>
              <span className="font-bold text-primary text-headline-md">100%</span>
            </div>
            <div className="w-full h-4 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
            </div>
            <p className="text-on-surface-variant mt-4 text-sm">Excellent ! Vous avez synchronisé toutes vos données.</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter mb-12">
        <Link to="/add-medication" className="flex items-center gap-gutter p-container-padding bg-primary text-white rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all text-left">
          <span className="material-symbols-outlined text-4xl">add_circle</span>
          <div>
            <p className="font-label-xl text-label-xl">Ajouter médicament</p>
            <p className="text-primary-fixed-dim text-sm">Scanner ou saisir un nouveau traitement</p>
          </div>
        </Link>
        <Link to="/analyses" className="flex items-center gap-gutter p-container-padding bg-surface-container-highest border-2 border-primary/20 text-on-surface rounded-lg shadow-sm hover:bg-surface-container-high active:scale-95 transition-all text-left">
          <span className="material-symbols-outlined text-4xl text-primary">analytics</span>
          <div>
            <p className="font-label-xl text-label-xl">Saisir mes analyses</p>
            <p className="text-on-surface-variant text-sm">Tension, glycémie, poids, etc.</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
