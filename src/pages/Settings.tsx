import clsx from 'clsx';

export function Settings() {
  return (
    <main className="flex-1 lg:ml-72 p-4 lg:p-container-padding pt-24 pb-32">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2">Statut de votre DWAYA</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Appareil connecté : MC-9921-X</p>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          
          {/* Device Illustration Card */}
          <div className="md:col-span-7 bg-surface-container-lowest rounded-lg shadow-md p-8 flex flex-col items-center justify-center min-h-[500px] border border-outline-variant/30">
            <div className="relative w-64 h-96 flex flex-col items-center">
              {/* Top Layer: Matin */}
              <div className="w-48 h-28 bg-gradient-to-b from-surface-container-highest to-surface-bright border-2 border-outline-variant rounded-t-full flex flex-col items-center justify-center relative -mb-2 z-30 group hover:scale-105 transition-transform duration-300">
                <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-label-md text-label-md text-secondary uppercase tracking-widest mt-2">Pris</span>
                <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div className="w-4 h-4 bg-secondary rounded-full shadow-[0_0_8px_#006c49]"></div>
                  <span className="text-secondary font-bold">Matin</span>
                </div>
              </div>
              
              {/* Middle Layer: Midi (ACTIVE) */}
              <div className="w-56 h-32 bg-primary-container border-4 border-primary rounded-xl flex flex-col items-center justify-center relative z-40 shadow-[0_0_0_4px_rgba(0,88,190,0.2)] group hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-on-primary-container text-5xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
                <span className="font-headline-md text-headline-md text-on-primary-container mt-2">Action Requise</span>
                <div className="absolute -right-20 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary rounded-full shadow-[0_0_12px_#0058be]"></div>
                  <span className="text-primary font-extrabold text-xl">Midi</span>
                </div>
              </div>
              
              {/* Bottom Layer: Soir */}
              <div className="w-48 h-28 bg-gradient-to-b from-surface-container-highest to-surface-bright border-2 border-outline-variant rounded-b-full flex flex-col items-center justify-center relative -mt-2 z-20 group hover:scale-105 transition-transform duration-300">
                <span className="material-symbols-outlined text-tertiary-container text-4xl">schedule</span>
                <span className="font-label-md text-label-md text-tertiary-container uppercase tracking-widest mt-2">En attente</span>
                <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div className="w-4 h-4 bg-tertiary-container rounded-full shadow-[0_0_8px_#b75b00]"></div>
                  <span className="text-tertiary-container font-bold">Soir</span>
                </div>
              </div>
              
              {/* Base Shadow */}
              <div className="w-40 h-8 bg-black/5 rounded-full blur-xl mt-4"></div>
            </div>
          </div>

          {/* Actions & Details Card */}
          <div className="md:col-span-5 flex flex-col gap-stack-gap">
            {/* Summary Card */}
            <div className="bg-surface-container-high rounded-lg p-6 flex items-start gap-4">
              <div className="bg-primary text-on-primary p-3 rounded-full shrink-0">
                <span className="material-symbols-outlined">info</span>
              </div>
              <div>
                <h3 className="font-label-xl text-label-xl mb-1">Status Prochain</h3>
                <p className="text-on-surface-variant font-body-md">Votre compartiment "Midi" est déverrouillé et prêt. Veuillez prendre vos 3 médicaments.</p>
              </div>
            </div>
            
            {/* Manual Controls */}
            <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-lg p-8 flex flex-col gap-4">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Commandes Manuelles</h3>
              <button className="w-full h-touch-target-min bg-primary text-on-primary rounded-lg font-label-xl text-label-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer">
                <span className="material-symbols-outlined">lock_open</span>
                Ouvrir compartiment Midi
              </button>
              <button className="w-full h-touch-target-min border-2 border-outline text-on-surface-variant rounded-lg font-label-xl text-label-xl flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all cursor-pointer">
                <span className="material-symbols-outlined">refresh</span>
                Réinitialiser l'appareil
              </button>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <button className="h-touch-target-min bg-secondary-container text-on-secondary-container rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                  <span className="material-symbols-outlined">check</span>
                  Matin OK
                </button>
                <button className="h-touch-target-min border-2 border-outline-variant text-outline rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-container-high cursor-pointer">
                  <span className="material-symbols-outlined">skip_next</span>
                  Sauter Soir
                </button>
              </div>
            </div>
            
            {/* Technical Stats */}
            <div className="bg-surface-container-lowest rounded-lg p-6 border border-outline-variant/30 flex justify-around">
              <div className="text-center">
                <p className="text-on-surface-variant font-label-md">Batterie</p>
                <div className="flex items-center justify-center gap-1 text-secondary font-bold text-xl">
                  <span className="material-symbols-outlined text-xl">battery_full</span>
                  85%
                </div>
              </div>
              <div className="w-px h-full bg-outline-variant/30"></div>
              <div className="text-center">
                <p className="text-on-surface-variant font-label-md">Signal</p>
                <div className="flex items-center justify-center gap-1 text-primary font-bold text-xl">
                  <span className="material-symbols-outlined text-xl">wifi</span>
                  Fort
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medication Detailed Bento */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm font-bold">PRIS À 08:15</span>
              <span className="material-symbols-outlined text-secondary">check_circle</span>
            </div>
            <h4 className="font-label-xl text-label-xl">Dose du Matin</h4>
            <p className="text-on-surface-variant mt-2">Aspirine (100mg), Oméprazole (20mg)</p>
          </div>
          
          <div className="bg-primary-container p-6 rounded-lg border border-primary shadow-lg ring-4 ring-primary/20 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-on-primary-container text-primary px-3 py-1 rounded-full text-sm font-bold">À PRENDRE MAINTENANT</span>
              <span className="material-symbols-outlined text-on-primary-container animate-bounce">priority_high</span>
            </div>
            <h4 className="font-label-xl text-label-xl text-on-primary-container">Dose du Midi</h4>
            <p className="text-on-primary-container mt-2 opacity-90">Paracétamol (500mg), Vitamine D, Magnésium</p>
          </div>
          
          <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 shadow-sm relative">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full text-sm font-bold">PRÉVU À 20:00</span>
              <span className="material-symbols-outlined text-outline">schedule</span>
            </div>
            <h4 className="font-label-xl text-label-xl">Dose du Soir</h4>
            <p className="text-on-surface-variant mt-2">Simvastatine (40mg)</p>
          </div>
        </section>

      </div>
      
      {/* Floating Action Button Contextual (For mobile quick add) - Only on small screens */}
      <button className="lg:hidden fixed bottom-24 right-6 w-16 h-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 cursor-pointer">
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
      </button>
    </main>
  );
}
