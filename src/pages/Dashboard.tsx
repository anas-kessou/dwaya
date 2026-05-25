import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, rtdb, handleFirestoreError, OperationType, sendBoxCommand, triggerAlarm, stopAlarm, onAlarmStatus, dismissReminder } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const [medications, setMedications] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any>(null);
  const [boxFirestore, setBoxFirestore] = useState<any>(null);
  const [showLoader, setShowLoader] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0); // 0-6
  const [selectedLevel, setSelectedLevel] = useState(0); // 0-2 (Morning, Afternoon, Night)
  const [alarmActive, setAlarmActive] = useState(false);
  const [activeReminder, setActiveReminder] = useState<any>(null);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const levels = ['Matin', 'Après-midi', 'Soir'];

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

  // Listen to Firestore Box status
  useEffect(() => {
    const boxRef = doc(db, 'boxes', 'box_001');
    const unsubscribe = onSnapshot(boxRef, (doc) => {
      if (doc.exists()) {
        setBoxFirestore(doc.data());
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to RTDB for high-freq sensor data (if still used)
  useEffect(() => {
    const sensorRef = ref(rtdb, 'sensors/box_001');
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      setSensors(snapshot.val());
    });
    return () => unsubscribe();
  }, []);

  // Listen to alarm status from RTDB (/alarm)
  useEffect(() => {
    const unsubscribe = onAlarmStatus((status, data) => {
      setAlarmActive(status);
      setActiveReminder(data);
    });
    return () => unsubscribe();
  }, []);


  const handleLoadMedicament = async () => {
    try {
      const command = `OPEN:${selectedDay}:${selectedLevel}`;
      await sendBoxCommand('box_001', command);
      setShowLoader(false);
      alert(`Commande ${command} envoyée à la box !`);
    } catch (e) {
      alert('Erreur lors de l\'envoi de la commande.');
    }
  };

  const activeCylindersCount = new Set(medications.map(m => m.layer)).size;

  return (
    <main className="pt-24 px-4 lg:px-container-padding max-w-7xl mx-auto space-y-stack-gap pb-32">
      {/* Mobile Greeting */}
      <div className="lg:hidden mb-stack-gap">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">Bonjour, {userName}</h1>
        <p className="text-on-surface-variant mt-1">C'est le moment de prendre soin de vous.</p>
      </div>

      {/* Bento Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Cylindrical Visual Section (Left/Top) */}
        <div className="md:col-span-4 flex flex-col gap-stack-gap">
          <div className="bg-surface-container-lowest p-8 rounded-lg shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[400px] border border-outline-variant/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50"></div>
            <h2 className="font-label-xl text-label-xl text-primary mb-8 z-10">Votre DWAYA</h2>
            
            {/* Cylinder Visual Representation */}
            <div className="relative w-40 h-64 flex flex-col gap-2 z-10">
              <div className={clsx("w-full h-1/3 rounded-t-xl border-4 border-white shadow-md flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform", boxFirestore?.ledStatus === 'green' ? 'bg-success-container' : 'bg-surface-container-high')}>
                <span className={clsx("material-symbols-outlined", boxFirestore?.ledStatus === 'green' ? 'text-success' : 'text-outline')}>dark_mode</span>
              </div>
              
              <div className={clsx("w-full h-1/3 rounded-md border-4 border-white shadow-md flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform", boxFirestore?.ledStatus === 'yellow' ? 'bg-secondary-container animate-pulse' : 'bg-surface-container-high')}>
                <span className={clsx("material-symbols-outlined", boxFirestore?.ledStatus === 'yellow' ? 'text-on-secondary-container' : 'text-outline')}>light_mode</span>
              </div>
              
              <div className={clsx("w-full h-1/3 rounded-b-xl border-4 border-white shadow-md flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform", boxFirestore?.ledStatus === 'red' ? 'bg-error-container' : 'bg-surface-container-high')}>
                <span className={clsx("material-symbols-outlined", boxFirestore?.ledStatus === 'red' ? 'text-error' : 'text-outline')}>wb_sunny</span>
              </div>
              
              {/* Base */}
              <div className="w-48 h-4 bg-outline-variant/30 absolute -bottom-6 left-1/2 -translate-x-1/2 blur-lg rounded-full"></div>
            </div>
            
            <p className="text-center mt-12 text-on-surface-variant font-label-md z-10">{activeCylindersCount} compartiments actifs</p>
          </div>

          {/* Smart Box Sensors Section */}
          <div className="bg-surface-container p-6 rounded-lg border border-outline-variant/30 space-y-4">
            <h3 className="font-label-xl text-label-xl text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">sensors</span>
              État de la Box DWAYA
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20 flex flex-col items-center">
                <p className="text-xs text-on-surface-variant uppercase font-bold text-center">Température</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="material-symbols-outlined text-primary">thermostat</span>
                  <p className="text-2xl font-bold text-primary">{(boxFirestore?.temperature || sensors?.temperature || 0).toFixed(1)}°C</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20 flex flex-col items-center">
                <p className="text-xs text-on-surface-variant uppercase font-bold text-center">LED Alert</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={clsx("w-6 h-6 rounded-full border-2", 
                    boxFirestore?.ledStatus === 'red' ? 'bg-error border-error-container' : 
                    boxFirestore?.ledStatus === 'yellow' ? 'bg-warning border-warning-container' : 
                    boxFirestore?.ledStatus === 'green' ? 'bg-success border-success-container' : 'bg-outline-variant/20'
                  )}></div>
                  <p className="text-sm font-bold capitalize">{boxFirestore?.ledStatus || 'Off'}</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/20 flex justify-between items-center">
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-bold">Statut Actuel</p>
                <p className="font-bold text-lg text-secondary capitalize">{boxFirestore?.statut || 'En attente...'}</p>
              </div>
              <span className={clsx("material-symbols-outlined text-4xl animate-pulse", boxFirestore?.statut === 'en_mouvement' ? "text-primary" : "text-outline-variant")}>
                {boxFirestore?.statut === 'en_mouvement' ? 'autorenew' : 'medical_services'}
              </span>
            </div>
          </div>

          {/* Alarm Control (Phone & ESP32) */}
          <div className={clsx(
            "p-6 rounded-lg border space-y-4 transition-all",
            alarmActive 
              ? "bg-error/10 border-error shadow-lg shadow-error/20 animate-pulse" 
              : "bg-surface-container border-outline-variant/30"
          )}>
            <h3 className="font-label-xl text-label-xl flex items-center gap-2">
              <span className={clsx("material-symbols-outlined", alarmActive ? "text-error" : "text-primary")}>
                {alarmActive ? 'notifications_active' : 'notifications'}
              </span>
              <span className={alarmActive ? "text-error" : "text-primary"}>Rappel en cours</span>
            </h3>
            
            {alarmActive && activeReminder ? (
              <div className="bg-white/50 p-4 rounded-xl border border-error/20">
                <p className="font-bold text-error">{activeReminder.medicineName}</p>
                <p className="text-sm text-on-surface-variant">{activeReminder.dosage} • {activeReminder.quantity} comprimé(s)</p>
                <p className="text-[10px] uppercase font-bold text-outline mt-2 tracking-widest">{activeReminder.layer}</p>
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm">
                Aucune alarme active pour le moment.
              </p>
            )}

            <div className="flex gap-3">
              {alarmActive ? (
                <button
                  onClick={() => dismissReminder(activeReminder?.reminderId)}
                  className="flex-1 py-4 bg-success text-white rounded-xl font-label-xl shadow-lg hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Valider la prise
                </button>
              ) : (
                <button
                  onClick={triggerAlarm}
                  className="flex-1 py-3 border-2 border-primary text-primary rounded-xl font-label-xl flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-95"
                >
                  <span className="material-symbols-outlined">alarm</span>
                  Test Alarme
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area (Right) */}
        <div className="md:col-span-8 flex flex-col gap-stack-gap">
          {/* Today's Overview */}
          <div>
            <div className="flex justify-between items-center mb-gutter">
              <h3 className="font-headline-md text-headline-md">Mes Médicaments Actifs</h3>
              <button 
                onClick={() => setShowLoader(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-label-xl shadow-lg hover:brightness-110 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined">autofps_select</span>
                Charger Médicament
              </button>
            </div>

            {medications.length === 0 ? (
              <div className="text-center py-12 bg-surface-container-low rounded-lg border border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">medication_liquid</span>
                <p className="text-on-surface-variant">Aucun médicament configuré pour le moment.</p>
                <Link to="/add-medication" className="text-primary font-bold mt-2 block">Ajouter maintenant</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-unit">
                {medications.map(med => (
                  <div key={med.id} className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-lg shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-label-xl text-label-xl text-primary">{med.name}</h4>
                        <p className="text-on-surface-variant text-sm">{med.dosage} mg</p>
                      </div>
                      <span className={clsx(
                        "text-xs font-bold px-3 py-1 rounded-full uppercase",
                        med.layer === 'matin' ? 'bg-blue-100 text-blue-700' : 
                        med.layer === 'apres-midi' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'
                      )}>{med.layer}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm">inventory</span>
                      <span className="text-body-md text-body-md">Quantité: {med.quantity}</span>
                    </div>

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
                          
                          // Trigger physical dispense if linked to current day/time
                          const dayMap: {[key: string]: number} = {'Lundi':0,'Mardi':1,'Mercredi':2,'Jeudi':3,'Vendredi':4,'Samedi':5,'Dimanche':6};
                          const currentDayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date());
                          const dayIndex = dayMap[currentDayName.charAt(0).toUpperCase() + currentDayName.slice(1)] || 0;
                          const levelIndex = med.layer === 'matin' ? 0 : med.layer === 'apres-midi' ? 1 : 2;
                          
                          await sendBoxCommand('box_001', `OPEN:${dayIndex}:${levelIndex}`);
                          
                          alert('Prise enregistrée et distribution lancée !');
                        } catch (e) {
                          handleFirestoreError(e, OperationType.CREATE, 'history');
                        }
                      }}
                      className="mt-2 text-center py-3 px-4 bg-secondary text-white font-label-xl rounded-xl shadow-lg hover:bg-secondary-container hover:text-on-secondary-container transition-all active:scale-95 cursor-pointer w-full flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">valve</span>
                      Distribuer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adherence Progress */}
          <div className="bg-surface-container-lowest p-container-padding rounded-lg border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-label-xl text-label-xl text-on-surface">Adhérence du jour</h4>
              <span className="font-bold text-primary text-headline-md">100%</span>
            </div>
            <div className="w-full h-4 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-sm" style={{ width: '100%' }}></div>
            </div>
            <p className="text-on-surface-variant mt-4 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-success text-sm">verified</span>
              Excellent ! Vous avez synchronisé toutes vos données.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
        <Link to="/add-medication" className="flex items-center gap-gutter p-container-padding bg-primary text-white rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all text-left group">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <span className="material-symbols-outlined text-4xl">add_circle</span>
          </div>
          <div>
            <p className="font-label-xl text-label-xl">Ajouter médicament</p>
            <p className="text-primary-fixed-dim text-sm">Configurer un nouveau traitement</p>
          </div>
        </Link>
        <Link to="/analyses" className="flex items-center gap-gutter p-container-padding bg-surface-container-highest border-2 border-primary/20 text-on-surface rounded-lg shadow-sm hover:border-primary active:scale-95 transition-all text-left">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-primary">analytics</span>
          </div>
          <div>
            <p className="font-label-xl text-label-xl">Saisir mes analyses</p>
            <p className="text-on-surface-variant text-sm">Tension, glycémie, poids, etc.</p>
          </div>
        </Link>
      </div>

      {/* Loader Modal */}
      {showLoader && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-bright w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-outline-variant animate-in fade-in zoom-in duration-300">
            <div className="bg-primary p-6 text-on-primary flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm flex items-center gap-2">
                <span className="material-symbols-outlined">settings_input_component</span>
                Chargement Manuel
              </h3>
              <button onClick={() => setShowLoader(false)} className="material-symbols-outlined hover:bg-white/20 p-2 rounded-full transition-colors">close</button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-label-xl font-label-xl mb-3 text-on-surface">Sélectionner le Jour</label>
                <div className="grid grid-cols-4 gap-2">
                  {days.map((day, idx) => (
                    <button 
                      key={day}
                      onClick={() => setSelectedDay(idx)}
                      className={clsx(
                        "py-2 px-1 text-xs font-bold rounded-lg border-2 transition-all",
                        selectedDay === idx ? "bg-primary border-primary text-on-primary" : "bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-primary/50"
                      )}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-label-xl font-label-xl mb-3 text-on-surface">Sélectionner le Moment</label>
                <div className="flex gap-2">
                  {levels.map((level, idx) => (
                    <button 
                      key={level}
                      onClick={() => setSelectedLevel(idx)}
                      className={clsx(
                        "flex-1 py-4 flex flex-col items-center gap-1 rounded-xl border-2 transition-all",
                        selectedLevel === idx ? "bg-secondary-container border-secondary text-on-secondary-container" : "bg-surface-container-low border-outline-variant text-on-surface-variant hover:border-secondary/50"
                      )}
                    >
                      <span className="material-symbols-outlined">
                        {idx === 0 ? 'light_mode' : idx === 1 ? 'sunny' : 'bedtime'}
                      </span>
                      <span className="text-xs font-bold">{level}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleLoadMedicament}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline-sm shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Ouvrir Compartiment
                </button>
                <p className="text-[10px] text-center mt-4 text-on-surface-variant uppercase tracking-widest font-bold">L'index {selectedDay}:{selectedLevel} sera ouvert</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
