import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const DUMMY_AVATAR = "https://ui-avatars.com/api/?name=User&background=005ac2&color=fff";

export function DashboardLayout() {
  const location = useLocation();
  const { user } = useAuth();
  
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.photoURL || DUMMY_AVATAR;

  const navItems = [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Add Medication', path: '/add-medication', icon: 'add_circle', mobileIcon: 'add_box' },
    { name: 'Analyses', path: '/analyses', icon: 'analytics', mobileIcon: 'monitoring' },
    { name: 'History', path: '/history', icon: 'history' },
    { name: 'Profile Médical', path: '/medical-profile', icon: 'medical_information' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="bg-background text-on-surface font-body-md text-body-md antialiased min-h-screen pb-32 lg:pb-0 lg:pl-72 pt-[56px]">
      {/* Top AppBar */}
      <header className="fixed top-0 w-full flex justify-between items-center px-container-padding h-touch-target-min bg-surface/80 backdrop-blur-md z-50 border-b border-outline-variant/30 shadow-sm lg:left-72 lg:w-[calc(100%-18rem)]">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="DWAYA" className="h-8 lg:hidden" />
          <h1 className="hidden lg:block font-headline-md text-headline-md text-primary">Bonjour, {userName}</h1>
        </div>
        <div className="flex items-center gap-unit">
          <button onClick={handleSignOut} className="w-touch-target-min h-touch-target-min flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant cursor-pointer" title="Se déconnecter">
            <span className="material-symbols-outlined">logout</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-primary-fixed overflow-hidden border-2 border-primary/10">
            <img src={avatarUrl} alt={`${userName}'s Profile`} className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* SideNavBar (Desktop Only) */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low border-r border-outline-variant/20 shadow-md hidden lg:flex flex-col gap-stack-gap p-6 z-50">
        <div className="flex flex-col gap-unit mb-8 px-4">
          <img src="/logo.png" alt="DWAYA" className="h-8" />
          <div className="flex items-center gap-4 mt-6 p-4 bg-surface rounded-lg border border-outline-variant/10">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img src={avatarUrl} alt={`${userName}'s Avatar`} className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <p className="font-label-xl text-label-xl text-on-surface truncate">{userName}</p>
              <p className="text-sm text-on-surface-variant">Tableau de bord</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  "flex items-center gap-4 px-4 py-3 font-label-xl text-label-xl transition-all rounded-lg",
                  isActive
                    ? "bg-primary-container text-on-primary-container shadow-sm font-bold"
                    : "text-on-surface-variant hover:bg-surface-container-highest"
                )}
              >
                <span className={clsx("material-symbols-outlined", isActive && "fill-icon")}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <Outlet />

      {/* BottomNavBar (Mobile Only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-4 pt-2 bg-surface/90 backdrop-blur-lg z-50 rounded-t-lg border-t border-outline-variant/30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={clsx(
                "flex flex-col items-center justify-center px-2 py-2 transition-all",
                isActive
                  ? "bg-secondary-container text-on-secondary-container rounded-xl px-4 scale-110 shadow-sm"
                  : "text-on-surface-variant"
              )}
            >
              <span className={clsx("material-symbols-outlined", isActive && "fill-icon")}>{item.mobileIcon || item.icon}</span>
              <span className="font-label-md text-label-md">{item.name === 'Add Medication' ? 'Add' : item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
