import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  signInWithGoogle,
  signInWithPhone,
  verifyOTP,
  signInWithEmailPassword,
  createAccountWithEmail,
} from '../../services/auth';
import { toast } from 'sonner';

type AuthTab = 'google' | 'phone' | 'email';
type PhoneStep = 'number' | 'otp' | 'profile';

// Floating satellite particle
function SatParticle({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-[#52B788] opacity-20"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [0, -30, 0], opacity: [0.1, 0.4, 0.1] }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  delay: (i * 0.4) % 4,
  x: (i * 17 + 5) % 95,
  y: (i * 23 + 8) % 88,
  size: 4 + (i % 5) * 3,
}));

export default function Welcome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AuthTab>('google');
  const [loading, setLoading] = useState(false);

  // Phone auth state
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('number');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmResult, setConfirmResult] = useState<any>(null);
  const [profileName, setProfileName] = useState('');
  const [profileState, setProfileState] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const INDIAN_STATES = [
    'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana',
    'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana',
    'Uttar Pradesh','Uttarakhand','West Bengal',
  ];

  // ─── Google Sign-In ───────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/map');
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── Phone OTP ────────────────────────────────────────────────
  const handleSendOTP = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) { toast.error('Enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      const result = await signInWithPhone(`+91${cleaned}`);
      setConfirmResult(result);
      setPhoneStep('otp');
      toast.success('OTP sent to +91 ' + cleaned);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      await verifyOTP(confirmResult, code);
      setPhoneStep('profile');
    } catch (err: any) {
      toast.error('Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    if (!profileName.trim()) { toast.error('Enter your name'); return; }
    navigate('/map');
  };

  const handleOTPInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ─── Email Sign-In / Sign-Up ──────────────────────────────────
  const handleEmail = async () => {
    if (!email || !password) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      if (isSignUp) {
        await createAccountWithEmail(email, password);
        toast.success('Account created!');
      } else {
        await signInWithEmailPassword(email, password);
      }
      navigate('/map');
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050D05] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* ─── Animated background particles ─── */}
      {PARTICLES.map(p => (
        <SatParticle key={p.id} delay={p.delay} x={p.x} y={p.y} size={p.size} />
      ))}

      {/* ─── Grid overlay ─── */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#52B788 1px, transparent 1px), linear-gradient(90deg, #52B788 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ─── Radial glow ─── */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(82,183,136,0.08) 0%, transparent 70%)' }}
      />

      {/* ─── Logo & tagline ─── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-8 z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-5xl">🌾</span>
          <div>
            <h1 className="text-4xl font-black text-[#E8F5E9] tracking-tight leading-none">
              Khet<span className="text-[#52B788]">Map</span>
            </h1>
            <p className="text-[#95D5B2] text-sm font-medium tracking-widest uppercase">खेत मैप</p>
          </div>
          <span className="text-4xl">🛰️</span>
        </div>
        <p className="text-[#6B8E6B] text-sm max-w-xs mx-auto leading-relaxed">
          अपना खेत, अपना नक्शा<br/>
          <span className="text-[#52B788]/70">Satellite crop intelligence · Free forever</span>
        </p>

        {/* ─── Feature pills ─── */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {['🌿 NDVI', '💧 SAR Flood', '🤖 HARI AI', '📡 Sentinel-2'].map(f => (
            <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-[#0D2818] border border-[#1B4D2E] text-[#95D5B2]">{f}</span>
          ))}
        </div>
      </motion.div>

      {/* ─── Auth Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full max-w-sm z-10"
      >
        <div className="bg-[#0A1F0A]/90 border border-[#1B4D2E] rounded-2xl p-6 backdrop-blur-xl shadow-2xl">

          {/* ─── Tab switcher ─── */}
          <div className="flex rounded-xl overflow-hidden border border-[#1B4D2E] mb-6">
            {([
              { id: 'google', label: 'Google', icon: '🔵' },
              { id: 'phone',  label: 'Phone',  icon: '📱' },
              { id: 'email',  label: 'Email',  icon: '✉️'  },
            ] as { id: AuthTab; label: string; icon: string }[]).map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPhoneStep('number'); }}
                className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#52B788] text-[#0A1F0A]'
                    : 'text-[#6B8E6B] hover:text-[#95D5B2]'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ─── Tab content ─── */}
          <AnimatePresence mode="wait">

            {/* ── Google ── */}
            {activeTab === 'google' && (
              <motion.div key="google" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-[#6B8E6B] text-xs text-center mb-4">Sign in with your Google account securely</p>
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-50 transition-all shadow-lg disabled:opacity-60 active:scale-95"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.5 33.1 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9L37.5 9.4C34.1 6.4 29.3 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5C35.3 45.5 44 36.8 44 25.5c0-1.9-.2-3.7-.4-5.5z"/>
                      <path fill="#FF3D00" d="M6.3 15.2l6.6 4.8C14.6 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 2.9L37.5 9.4C34.1 6.4 29.3 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.7z"/>
                      <path fill="#4CAF50" d="M24 45.5c5.1 0 9.8-1.7 13.4-4.5l-6.2-5.2C29.2 37.5 26.7 38.5 24 38.5c-5.1 0-9.4-2.9-11.2-7.1l-6.6 5.1C9.6 41.1 16.3 45.5 24 45.5z"/>
                      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 5.9l6.2 5.2C40.9 35.9 44 31 44 25.5c0-1.9-.2-3.7-.4-5.5z"/>
                    </svg>
                  )}
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </button>
                <p className="text-center text-[#6B8E6B] text-xs mt-4">No account needed · Just sign in</p>
              </motion.div>
            )}

            {/* ── Phone ── */}
            {activeTab === 'phone' && (
              <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <AnimatePresence mode="wait">

                  {phoneStep === 'number' && (
                    <motion.div key="num" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-[#6B8E6B] text-xs mb-4">Enter your mobile number to receive OTP</p>
                      <div className="flex gap-2 mb-4">
                        <div className="flex items-center px-3 bg-[#0D2818] border border-[#1B4D2E] rounded-xl text-[#95D5B2] text-sm font-bold">🇮🇳 +91</div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="9876543210"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 bg-[#0D2818] border border-[#1B4D2E] rounded-xl px-4 py-3 text-[#E8F5E9] text-sm placeholder-[#3A5A3A] outline-none focus:border-[#52B788] transition-colors"
                          onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                        />
                      </div>
                      <div id="recaptcha-container" />
                      <button
                        onClick={handleSendOTP}
                        disabled={loading || phone.length < 10}
                        className="w-full py-3.5 rounded-xl bg-[#52B788] text-[#0A1F0A] font-bold text-sm hover:bg-[#40916C] transition-all disabled:opacity-50 active:scale-95"
                      >
                        {loading ? 'Sending OTP...' : 'Send OTP →'}
                      </button>
                    </motion.div>
                  )}

                  {phoneStep === 'otp' && (
                    <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-[#6B8E6B] text-xs mb-1">Enter 6-digit OTP sent to</p>
                      <p className="text-[#52B788] text-sm font-bold mb-4">+91 {phone}</p>
                      <div className="flex gap-2 justify-center mb-4">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={el => otpRefs.current[i] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleOTPInput(i, e.target.value)}
                            onKeyDown={e => handleOTPKeyDown(i, e)}
                            className="w-11 h-12 text-center bg-[#0D2818] border border-[#1B4D2E] rounded-xl text-[#E8F5E9] text-xl font-bold outline-none focus:border-[#52B788] transition-colors"
                          />
                        ))}
                      </div>
                      <button
                        onClick={handleVerifyOTP}
                        disabled={loading || otp.join('').length !== 6}
                        className="w-full py-3.5 rounded-xl bg-[#52B788] text-[#0A1F0A] font-bold text-sm hover:bg-[#40916C] transition-all disabled:opacity-50 active:scale-95"
                      >
                        {loading ? 'Verifying...' : 'Verify OTP ✓'}
                      </button>
                      <button onClick={() => setPhoneStep('number')} className="w-full mt-2 text-[#6B8E6B] text-xs hover:text-[#95D5B2] transition-colors">← Change number</button>
                    </motion.div>
                  )}

                  {phoneStep === 'profile' && (
                    <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-[#52B788] text-sm font-bold mb-1">✓ Phone verified!</p>
                      <p className="text-[#6B8E6B] text-xs mb-4">Tell us about yourself</p>
                      <input
                        type="text"
                        placeholder="Your name (eg. Ramesh)"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        className="w-full bg-[#0D2818] border border-[#1B4D2E] rounded-xl px-4 py-3 text-[#E8F5E9] text-sm placeholder-[#3A5A3A] outline-none focus:border-[#52B788] mb-3 transition-colors"
                      />
                      <select
                        value={profileState}
                        onChange={e => setProfileState(e.target.value)}
                        className="w-full bg-[#0D2818] border border-[#1B4D2E] rounded-xl px-4 py-3 text-[#E8F5E9] text-sm outline-none focus:border-[#52B788] mb-4 transition-colors"
                      >
                        <option value="">Select your state</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button
                        onClick={handleProfileSave}
                        className="w-full py-3.5 rounded-xl bg-[#52B788] text-[#0A1F0A] font-bold text-sm hover:bg-[#40916C] transition-all active:scale-95"
                      >
                        Enter KhetMap 🌾
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </motion.div>
            )}

            {/* ── Email ── */}
            {activeTab === 'email' && (
              <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex rounded-lg overflow-hidden border border-[#1B4D2E] mb-4">
                  <button onClick={() => setIsSignUp(false)} className={`flex-1 py-2 text-xs font-semibold ${!isSignUp ? 'bg-[#1B4D2E] text-[#E8F5E9]' : 'text-[#6B8E6B]'}`}>Sign In</button>
                  <button onClick={() => setIsSignUp(true)} className={`flex-1 py-2 text-xs font-semibold ${isSignUp ? 'bg-[#1B4D2E] text-[#E8F5E9]' : 'text-[#6B8E6B]'}`}>Sign Up</button>
                </div>
                <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#0D2818] border border-[#1B4D2E] rounded-xl px-4 py-3 text-[#E8F5E9] text-sm placeholder-[#3A5A3A] outline-none focus:border-[#52B788] mb-3 transition-colors" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#0D2818] border border-[#1B4D2E] rounded-xl px-4 py-3 text-[#E8F5E9] text-sm placeholder-[#3A5A3A] outline-none focus:border-[#52B788] mb-4 transition-colors"
                  onKeyDown={e => e.key === 'Enter' && handleEmail()} />
                <button onClick={handleEmail} disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#52B788] text-[#0A1F0A] font-bold text-sm hover:bg-[#40916C] transition-all disabled:opacity-50 active:scale-95">
                  {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ─── Footer note ─── */}
        <p className="text-center text-[#3A5A3A] text-xs mt-4">
          Free for all Indian farmers · Powered by ESA Copernicus & NASA
        </p>
      </motion.div>
    </div>
  );
}
