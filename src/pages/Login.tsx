import React from 'react';
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/"); // Redirect to home
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (error) {
      console.error("Google sign in failed", error);
    }
  };

  return (
    <div className="font-body-md text-body-md min-h-screen flex flex-col bg-background text-on-surface lg:pb-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(0, 88, 190, 0.05) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(78, 222, 163, 0.05) 0%, transparent 40%)' }}>
      <main className="flex-grow flex items-center justify-center px-container-padding py-12">
        <div className="max-w-[560px] w-full flex flex-col items-center space-y-12">
          
          <header className="w-full flex flex-col items-center text-center space-y-8">
            <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center p-4">
              <img src="/logo.jpeg" alt="DWAYA Logo" className="w-full h-full object-contain rounded-2xl shadow-xl" />
            </div>
            <div className="space-y-4">
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
                Bienvenue
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[400px]">
                Prenez vos médicaments en toute sérénité
              </p>
            </div>
          </header>

          <section className="w-full bg-surface-container-lowest rounded-lg p-8 md:p-12 shadow-[0px_20px_40px_rgba(0,88,190,0.08)] border border-outline-variant/30 relative z-10">
            <form className="space-y-8" onSubmit={handleLogin}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block font-label-xl text-label-xl text-on-surface ml-1" htmlFor="email">
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline">mail</span>
                    <input className="w-full h-[72px] pl-14 pr-6 rounded-DEFAULT border-2 border-outline-variant bg-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-body-lg font-body-lg outline-none appearance-none" id="email" name="email" placeholder="nom@exemple.fr" type="email" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-label-xl text-label-xl text-on-surface ml-1" htmlFor="password">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline">lock</span>
                    <input className="w-full h-[72px] pl-14 pr-14 rounded-DEFAULT border-2 border-outline-variant bg-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-body-lg font-body-lg outline-none appearance-none" id="password" name="password" placeholder="••••••••" type="password" />
                    <button className="absolute right-5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors" type="button">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </div>
                  <div className="flex justify-end mt-2">
                    <a className="font-label-md text-label-md text-primary font-bold hover:underline" href="#">Mot de passe oublié ?</a>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <button className="w-full h-touch-target-min bg-primary text-on-primary rounded-full font-headline-md text-headline-md shadow-lg shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer" type="submit">
                  Se connecter
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-outline-variant"></div>
                  <span className="flex-shrink mx-4 font-label-md text-label-md text-on-surface-variant">ou</span>
                  <div className="flex-grow border-t border-outline-variant"></div>
                </div>
                
                <button onClick={handleGoogleLogin} className="w-full h-touch-target-min bg-surface border-2 border-outline-variant rounded-full font-label-xl text-label-xl text-on-surface hover:bg-surface-container-high active:scale-[0.98] transition-all flex items-center justify-center gap-4 cursor-pointer" type="button">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK_Mc2ruDO-UI5fO-xPzmXNqRi6kxrmO8JjlHmMFdAlb2JRKfBZeyx1JpCqZypKXlNILfpFV5BwKcdAJKBTdI6K4F3M4Ns2kd997V_3Iua-wqrqPiHu4r8wphXldyQ3wdRQhcKrJbSQpS8b3FetUOM_-LwlDCMQtdNjNnJX0ZIm-fiXLjMcrATnxFxbocMghBNT2rOsk40wFPEV7rCW5rY9sC_rbYBp0oxMIMIWnFAsy_y7gUeNdHf8ecwcgeGNAVaS5D6JY6aN6s" alt="Google Logo" className="w-6 h-6" />
                  Continuer avec Google
                </button>
              </div>
            </form>
          </section>

          <footer className="w-full text-center pb-8">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Pas encore de compte ? <Link className="text-primary font-bold hover:underline" to="/signup">Inscrivez-vous ici</Link>
            </p>
            <div className="mt-12 flex justify-center gap-8 font-label-md text-label-md text-outline">
              <a className="hover:text-primary transition-colors" href="#">Confidentialité</a>
              <a className="hover:text-primary transition-colors" href="#">Conditions d'utilisation</a>
              <a className="hover:text-primary transition-colors" href="#">Aide</a>
            </div>
          </footer>

        </div>
      </main>
      
      {/* Background Decorative Icon */}
      <div className="fixed bottom-10 right-10 pointer-events-none opacity-10 hidden lg:block z-0">
        <div className="relative w-96 h-96">
          <div className="absolute inset-0 bg-secondary rounded-full blur-[100px]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-[240px] text-secondary">medication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
