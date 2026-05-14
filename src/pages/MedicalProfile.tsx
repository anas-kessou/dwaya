import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function MedicalProfile() {
  const { user } = useAuth();
  
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'medicalProfiles', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBloodType(data.bloodType || '');
          setAllergies(data.allergies || '');
          setChronicConditions(data.chronicConditions || '');
          setEmergencyContactName(data.emergencyContactName || '');
          setEmergencyContactPhone(data.emergencyContactPhone || '');
          setWeight(data.weight ? String(data.weight) : '');
          setHeight(data.height ? String(data.height) : '');
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, 'medicalProfiles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        userId: user.uid,
        bloodType,
        allergies,
        chronicConditions,
        emergencyContactName,
        emergencyContactPhone,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        updatedAt: serverTimestamp()
      };
      // Clean up nulls so we don't violate rules if we want to be strict,
      // but actually our rules say ? : true so they allow missing fields.
      // Firebase doesn't allow undefined.
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
          delete payload[key]; // Just remove empty fields
        }
      });
      // We need userId and updatedAt minimally
      payload.userId = user.uid;
      payload.updatedAt = serverTimestamp();

      await setDoc(doc(db, 'medicalProfiles', user.uid), payload);
      alert('Profil médical mis à jour avec succès !');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'medicalProfiles');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 lg:ml-72 pt-24 text-center text-on-surface-variant text-label-xl">Chargement...</div>;
  }

  return (
    <main className="flex-1 lg:ml-72 p-4 lg:p-container-padding pt-24 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2 text-primary">Profil Médical</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Vos informations de santé essentielles en cas de besoin.</p>
        </header>

        <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 shadow-sm space-y-6">
          <h2 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-4">Informations Générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-2">Groupe Sanguin</label>
              <select 
                value={bloodType}
                onChange={e => setBloodType(e.target.value)}
                className="w-full h-14 bg-surface-container rounded-lg border-2 border-transparent focus:border-primary px-4 outline-none font-body-lg"
              >
                <option value="">Sélectionner</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="Inconnu">Je ne sais pas</option>
              </select>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-label-md text-on-surface-variant mb-2">Taille (cm)</label>
                <input 
                  type="number"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  className="w-full h-14 bg-surface-container rounded-lg border-2 border-transparent focus:border-primary px-4 outline-none font-body-lg"
                  placeholder="175"
                />
              </div>
              <div className="flex-1">
                <label className="block text-label-md text-on-surface-variant mb-2">Poids (kg)</label>
                <input 
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  className="w-full h-14 bg-surface-container rounded-lg border-2 border-transparent focus:border-primary px-4 outline-none font-body-lg"
                  placeholder="70"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 shadow-sm space-y-6">
          <h2 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-4">Antécédents & Facteurs</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-2">Maladies Chroniques</label>
              <textarea 
                value={chronicConditions}
                onChange={e => setChronicConditions(e.target.value)}
                className="w-full h-24 bg-surface-container rounded-lg border-2 border-transparent focus:border-primary p-4 outline-none font-body-lg resize-none"
                placeholder="Ex: Diabète type 2, Hypertension..."
              ></textarea>
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant mb-2">Allergies (médicamenteuses ou autres)</label>
              <textarea 
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
                className="w-full h-24 bg-surface-container rounded-lg border-2 border-transparent focus:border-primary p-4 outline-none font-body-lg resize-none"
                placeholder="Ex: Pénicilline, Arachides..."
              ></textarea>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 shadow-sm space-y-6">
          <h2 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/30 pb-4 flex items-center gap-2">
            Contact d'Urgence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-2">Nom</label>
              <input 
                type="text"
                value={emergencyContactName}
                onChange={e => setEmergencyContactName(e.target.value)}
                className="w-full h-14 bg-surface-container rounded-lg border-2 border-transparent focus:border-error px-4 outline-none font-body-lg"
                placeholder="Nom du proche"
              />
            </div>
            <div>
              <label className="block text-label-md text-on-surface-variant mb-2">Numéro de téléphone</label>
              <input 
                type="tel"
                value={emergencyContactPhone}
                onChange={e => setEmergencyContactPhone(e.target.value)}
                className="w-full h-14 bg-surface-container rounded-lg border-2 border-transparent focus:border-error px-4 outline-none font-body-lg"
                placeholder="+33 6 00 00 00 00"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-primary text-on-primary font-label-xl text-label-xl px-12 py-4 rounded-xl shadow-md hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le Profil'}
          </button>
        </div>
      </div>
    </main>
  );
}
