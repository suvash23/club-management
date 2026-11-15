import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const memberProfile = user?.memberProfile;
  const displayName = memberProfile
    ? `${memberProfile.firstName} ${memberProfile.lastName}`
    : user?.email.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-sky-500/20">
          C
        </div>
        <div>
          <span className="font-extrabold text-slate-900 tracking-tight text-lg">ClubHub</span>
          <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {isAdmin ? 'Admin Console' : 'Member Portal'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 capitalize">{displayName}</p>
            <p className="text-xs text-slate-500 flex items-center justify-end gap-1 font-medium">
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600 inline" /> Administrator
                </>
              ) : (
                <>
                  <UserIcon className="w-3.5 h-3.5 text-emerald-600 inline" /> Member ({memberProfile?.memberCode || 'Active'})
                </>
              )}
            </p>
          </div>

          <div className="h-10 w-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shadow-sm">
            {memberProfile?.avatarUrl ? (
              <img
                src={memberProfile.avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-bold text-slate-600 text-sm">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
