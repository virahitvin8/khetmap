import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Welcome to KhetMap</h1>
          <p className="text-sm text-[#475569] mt-2">Sign in to manage your fields and analysis</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-xl border border-[#E2E8F0] rounded-2xl',
              headerTitle: 'text-[#1E293B] text-xl',
              headerSubtitle: 'text-[#475569]',
              formButtonPrimary: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-sm font-semibold py-3',
              formFieldInput: 'border-[#E2E8F0] rounded-lg text-sm py-2.5',
              formFieldLabel: 'text-[#475569] text-sm font-medium',
              footerActionLink: 'text-[#2563EB] hover:text-[#1D4ED8]',
              socialButtonsBlockButton: 'border-[#E2E8F0] rounded-lg text-sm font-medium py-2.5 hover:bg-[#F8FAFC]',
              dividerLine: 'bg-[#E2E8F0]',
              dividerText: 'text-[#94A3B8] text-xs',
              formFieldAction: 'text-[#2563EB] text-xs',
              footer: 'hidden',
            },
          }}
        />
        <p className="text-center text-xs text-[#94A3B8] mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
