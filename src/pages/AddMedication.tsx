import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function AddMedication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedLayer, setSelectedLayer] = useState<'matin' | 'apres-midi' | 'soir'>('matin');
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || isSubmitting) return;
    if (!name || !dosage || !startDate) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);
    try {
      const medicationData = {
        userId: user.uid,
        name,
        dosage,
        quantity,
        layer: selectedLayer,
        startDate,
        durationDays,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'medications'), medicationData);
      navigate('/');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'medications');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-24 pb-32 px-4 lg:px-container-padding max-w-6xl mx-auto space-y-stack-gap">
      <section className="mb-stack-gap">
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Ajouter un médicament</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Configurez votre nouveau rappel de santé étape par étape.</p>
      </section>

      {/* Bento Grid Layout for Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Step 1: Basic Info */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/10">
          <div className="space-y-stack-gap">
            {/* Medication Name */}
            <div>
              <label className="block font-label-xl text-label-xl text-on-surface mb-2">Nom du médicament</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-16 px-6 text-body-lg rounded-xl border-2 border-outline-variant focus:border-primary focus:ring-0 transition-colors bg-surface-bright outline-none" 
                placeholder="Ex: Paracétamol" 
                type="text" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {/* Dosage */}
              <div>
                <label className="block font-label-xl text-label-xl text-on-surface mb-2">Dosage (mg/ml)</label>
                <input 
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full h-16 px-6 text-body-lg rounded-xl border-2 border-outline-variant focus:border-primary focus:ring-0 transition-colors bg-surface-bright outline-none" 
                  placeholder="Ex: 500" 
                  type="text" 
                />
              </div>
              
              {/* Quantity */}
              <div>
                <label className="block font-label-xl text-label-xl text-on-surface mb-2">Quantité</label>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-16 w-16 flex items-center justify-center rounded-xl bg-surface-container-high border-2 border-outline-variant cursor-pointer active:scale-95 transition-transform"
                  >
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <input 
                    className="w-full h-16 text-center text-body-lg rounded-xl border-2 border-outline-variant focus:border-primary focus:ring-0 bg-surface-bright outline-none" 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
                    min="1" 
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-16 w-16 flex items-center justify-center rounded-xl bg-surface-container-high border-2 border-outline-variant cursor-pointer active:scale-95 transition-transform"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Layer Selection */}
          <div className="mt-12">
            <label className="block font-label-xl text-label-xl text-on-surface mb-6 text-center lg:text-left">Choisir le compartiment (Layer)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Morning Card */}
              <button 
                onClick={() => setSelectedLayer('matin')}
                className={clsx(
                  "flex flex-col items-center gap-4 p-8 rounded-lg border-2 transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer",
                  selectedLayer === 'matin' ? "border-primary bg-primary-fixed shadow-md" : "border-outline-variant bg-surface-bright"
                )}
              >
                <span className={clsx("material-symbols-outlined text-5xl", selectedLayer === 'matin' ? "text-primary" : "text-on-surface-variant")}>light_mode</span>
                <span className="font-label-xl text-label-xl">Matin</span>
                <div className={clsx("h-2 w-12 rounded-full", selectedLayer === 'matin' ? "bg-primary" : "bg-outline-variant/30")}></div>
              </button>
              
              {/* Afternoon Card */}
              <button 
                onClick={() => setSelectedLayer('apres-midi')}
                className={clsx(
                  "flex flex-col items-center gap-4 p-8 rounded-lg border-2 transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer",
                  selectedLayer === 'apres-midi' ? "border-primary bg-primary-fixed shadow-md" : "border-outline-variant bg-surface-bright"
                )}
              >
                <span className={clsx("material-symbols-outlined text-5xl", selectedLayer === 'apres-midi' ? "text-primary" : "text-on-surface-variant")}>sunny</span>
                <span className="font-label-xl text-label-xl">Après-midi</span>
                <div className={clsx("h-2 w-12 rounded-full", selectedLayer === 'apres-midi' ? "bg-primary" : "bg-outline-variant/30")}></div>
              </button>

              {/* Evening Card */}
              <button 
                onClick={() => setSelectedLayer('soir')}
                className={clsx(
                  "flex flex-col items-center gap-4 p-8 rounded-lg border-2 transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer",
                  selectedLayer === 'soir' ? "border-primary bg-primary-fixed shadow-md" : "border-outline-variant bg-surface-bright"
                )}
              >
                <span className={clsx("material-symbols-outlined text-5xl", selectedLayer === 'soir' ? "text-primary" : "text-on-surface-variant")}>bedtime</span>
                <span className="font-label-xl text-label-xl">Soir</span>
                <div className={clsx("h-2 w-12 rounded-full", selectedLayer === 'soir' ? "bg-primary" : "bg-outline-variant/30")}></div>
              </button>
            </div>
          </div>

          {/* Step 3: Date & Duration */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div>
              <label className="block font-label-xl text-label-xl text-on-surface mb-2">Date de début</label>
              <input 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-16 px-6 text-body-lg rounded-xl border-2 border-outline-variant focus:border-primary bg-surface-bright outline-none" 
                type="date" 
              />
            </div>
            <div>
              <label className="block font-label-xl text-label-xl text-on-surface mb-2">Durée du traitement</label>
              <div className="flex gap-2">
                {[7, 14, 30].map(days => (
                  <button 
                    key={days}
                    onClick={() => setDurationDays(days)}
                    className={clsx(
                      "flex-1 h-16 rounded-xl border-2 font-bold cursor-pointer transition-colors",
                      durationDays === days 
                        ? "border-primary bg-primary-fixed text-on-primary-fixed"
                        : "border-outline-variant hover:bg-surface-container text-on-surface-variant"
                    )}
                  >
                    {days}j
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Preview Column */}
        <div className="lg:col-span-4 space-y-stack-gap">
          {/* Cylinder Preview Card */}
          <div className="bg-surface-container-high p-8 rounded-lg border border-outline-variant/20 flex flex-col items-center justify-center min-h-[400px]">
            <h3 className="font-label-xl text-label-xl text-on-surface-variant mb-12">Aperçu de DWAYA</h3>
            
            {/* Cylinder Graphic Simulation */}
            <div className="relative w-32 h-64 border-4 border-outline-variant rounded-full p-2 flex flex-col gap-1 overflow-hidden bg-surface-container-lowest shadow-inner">
              <div className={clsx(
                "w-full h-1/3 rounded-t-full flex items-center justify-center transition-colors",
                selectedLayer === 'matin' ? "bg-primary-container animate-pulse" : "bg-surface-container-highest"
              )}>
                {selectedLayer === 'matin' && <span className="material-symbols-outlined text-on-primary-container">check_circle</span>}
              </div>
              <div className={clsx(
                "w-full h-1/3 flex items-center justify-center transition-colors",
                selectedLayer === 'apres-midi' ? "bg-primary-container animate-pulse" : "bg-surface-container-highest"
              )}>
                {selectedLayer === 'apres-midi' && <span className="material-symbols-outlined text-on-primary-container">check_circle</span>}
              </div>
              <div className={clsx(
                "w-full h-1/3 rounded-b-full flex items-center justify-center transition-colors",
                selectedLayer === 'soir' ? "bg-primary-container animate-pulse" : "bg-surface-container-highest"
              )}>
                {selectedLayer === 'soir' && <span className="material-symbols-outlined text-on-primary-container">check_circle</span>}
              </div>
            </div>
            
            <p className="mt-8 text-center font-body-md text-on-surface-variant px-4">
              Le médicament sera stocké dans la <strong>{selectedLayer === 'matin' ? 'première' : selectedLayer === 'apres-midi' ? 'deuxième' : 'troisième'} couche</strong> ({selectedLayer === 'matin' ? 'Matin' : selectedLayer === 'apres-midi' ? 'Après-midi' : 'Soir'}).
            </p>
          </div>

          {/* Large Action Button */}
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full h-24 bg-primary text-on-primary rounded-xl font-headline-md text-headline-md shadow-lg shadow-primary/20 flex items-center justify-center gap-4 transition-all hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-4xl">add_task</span>
            {isSubmitting ? 'Enregistrement...' : 'Ajouter'}
          </button>
        </div>
      </div>
    </main>
  );
}
