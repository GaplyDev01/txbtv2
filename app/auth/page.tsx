'use client';

import { AuthForm } from '@/components/auth/auth-form';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#181719] flex items-center justify-center relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed top-0 right-0 w-[790px] h-[878px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[#7FDDAD]/10 blur-[151.5px]" />
      </div>
      <div className="fixed bottom-0 right-0 w-[677px] h-[1600px] opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8DD7F]/5 to-[#11FFF1]/7 blur-[151.5px]" />
      </div>
      <div className="fixed bottom-0 left-0 w-[680px] h-[1880px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8DD7F]/5 to-[#11FFF1]/7 blur-[151.5px]" />
      </div>
      <AuthForm />
    </div>
  );
}