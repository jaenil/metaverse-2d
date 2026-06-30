import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as SelectPrimitive from '@radix-ui/react-select';
import {
  Lock,
  User,
  UserPlus,
  LogIn,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import * as api from '../api';

// ─── Types ───────────────────────────────────────────────────────────────────

type TabValue = 'signin' | 'signup';

// ─── Robot image with graceful fallback ──────────────────────────────────────

const FALLBACK_IMG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

function RobotImage({ src }: { src: string }) {
  const [hasError, setHasError] = useState(false);
  return (
    <img
      src={hasError ? FALLBACK_IMG : src}
      alt="Robot mascot"
      onError={() => setHasError(true)}
      className="w-full h-auto object-contain"
    />
  );
}

// ─── IconBox ─────────────────────────────────────────────────────────────────
// Standalone left-side icon container, aligned level with the input via FormRow.

function IconBox({ icon }: { icon: React.ReactNode }) {
  return (
    <div
      className="
        w-20 h-16 shrink-0
        flex items-center justify-center
        bg-[#0b1326]/80
        border border-indigo-500/25
        rounded-xl
        text-indigo-400
      "
      style={{ boxShadow: '0 0 16px rgba(99,102,241,0.20)' }}
    >
      {icon}
    </div>
  );
}

// ─── FormInput ────────────────────────────────────────────────────────────────
// Label above + input below. No icon inside — icon lives in IconBox via FormRow.

interface FormInputProps {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  label: string;
  required?: boolean;
}

function FormInput({
  id,
  type,
  placeholder,
  value,
  onChange,
  label,
  required,
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={id}
        className="text-lg font-semibold text-[#c7c4d7]/70 uppercase tracking-widest"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="
          w-full h-16 px-8
          bg-[#0b1326]/80
          border border-indigo-500/25
          rounded-xl
          text-xl text-[#dae2fd]
          placeholder:text-[#464554]
          outline-none
          focus:border-indigo-500/55
          focus:ring-1 focus:ring-indigo-500/25
          transition-all duration-200
        "
      />
    </div>
  );
}

// ─── FormRow ──────────────────────────────────────────────────────────────────
// Lays out [IconBox | FormInput] side-by-side.
// items-end keeps the icon box flush with the bottom of the input,
// while the label floats above only the input column.

function FormRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-end gap-6">
      <IconBox icon={icon} />
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ─── Reusable SubmitButton ────────────────────────────────────────────────────

interface SubmitButtonProps {
  loading: boolean;
  label: string;
  loadingLabel: string;
}

function SubmitButton({ loading, label, loadingLabel }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="
        w-full h-16 mt-2
        rounded-xl
        text-xl font-semibold text-white
        bg-indigo-600 hover:bg-indigo-500
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-indigo-500/40
      "
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="
        p-3.5 rounded-xl
        bg-red-500/10 border border-red-500/20
        text-red-400 text-base text-center
      "
    >
      {message}
    </div>
  );
}

// ─── Sign In Form ─────────────────────────────────────────────────────────────

interface SignInFormProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  error: string;
}

function SignInForm({
  onSuccess,
  onError,
  loading,
  setLoading,
  error,
}: SignInFormProps) {
  const [data, setData] = useState({ username: '', password: '' });
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError('');
    setLoading(true);
    try {
      const res = await api.signin(data);
      setAuth(res.data.token, res.data.userId || 'user-id', 'user');
      onSuccess();
    } catch (err: any) {
      onError(err.response?.data?.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 px-12 sm:px-20 pt-12 pb-16">
      <div className="mb-2">
        <h2 className="text-4xl font-bold text-[#dae2fd] tracking-tight">
          Welcome back
        </h2>
        <p className="text-lg text-[#908fa0] mt-2">
          Sign in to your account to continue
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      <FormRow icon={<User className="w-8 h-8" />}>
        <FormInput
          id="signin-username"
          type="text"
          label="Username"
          placeholder="Enter your username"
          value={data.username}
          onChange={(v) => setData({ ...data, username: v })}
          required
        />
      </FormRow>

      <FormRow icon={<Lock className="w-8 h-8" />}>
        <FormInput
          id="signin-password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={data.password}
          onChange={(v) => setData({ ...data, password: v })}
          required
        />
      </FormRow>

      <SubmitButton loading={loading} label="Sign In" loadingLabel="Signing in…" />
    </form>
  );
}

// ─── Sign Up Form ─────────────────────────────────────────────────────────────

interface SignUpFormProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  error: string;
}

function SignUpForm({
  onSuccess,
  onError,
  loading,
  setLoading,
  error,
}: SignUpFormProps) {
  const [data, setData] = useState({ username: '', password: '', userType: 'user' });
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError('');
    setLoading(true);
    try {
      await api.signup({
        username: data.username,
        password: data.password,
        type: data.userType as 'admin' | 'user',
      });
      const res = await api.signin({ username: data.username, password: data.password });
      setAuth(
        res.data.token,
        res.data.userId || 'user-id',
        data.userType as 'admin' | 'user',
      );
      onSuccess();
    } catch (err: any) {
      onError(err.response?.data?.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 px-12 sm:px-20 pt-12 pb-16">
      <div className="mb-2">
        <h2 className="text-4xl font-bold text-[#dae2fd] tracking-tight">
          Create account
        </h2>
        <p className="text-lg text-[#908fa0] mt-2">
          Fill in the details below to get started
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      <FormRow icon={<User className="w-8 h-8" />}>
        <FormInput
          id="signup-username"
          type="text"
          label="Username"
          placeholder="Choose a username"
          value={data.username}
          onChange={(v) => setData({ ...data, username: v })}
          required
        />
      </FormRow>

      <FormRow icon={<Lock className="w-8 h-8" />}>
        <FormInput
          id="signup-password"
          type="password"
          label="Password"
          placeholder="Create a password"
          value={data.password}
          onChange={(v) => setData({ ...data, password: v })}
          required
        />
      </FormRow>

      {/* Account Type Select — icon on the left, select on the right */}
      <div className="flex items-end gap-6">
        <IconBox icon={<ShieldCheck className="w-8 h-8" />} />
        <div className="flex-1 flex flex-col gap-3">
          <label
            htmlFor="signup-account-type"
            className="text-lg font-semibold text-[#c7c4d7]/70 uppercase tracking-widest"
          >
            Account Type
          </label>
          <SelectPrimitive.Root
            value={data.userType}
            onValueChange={(v) => setData({ ...data, userType: v })}
          >
            <SelectPrimitive.Trigger
              id="signup-account-type"
              className="
                flex w-full h-16 items-center justify-between
                px-8
                bg-[#0b1326]/80
                border border-indigo-500/25
                rounded-xl
                text-xl text-[#dae2fd]
                outline-none
                focus:border-indigo-500/55
                focus:ring-1 focus:ring-indigo-500/25
                transition-all duration-200
                data-[placeholder]:text-[#464554]
              "
            >
              <SelectPrimitive.Value placeholder="Select account type" />
              <ChevronDown className="w-6 h-6 text-[#464554] shrink-0" />
            </SelectPrimitive.Trigger>
            <SelectPrimitive.Portal>
              <SelectPrimitive.Content
                className="
                  z-50 w-[var(--radix-select-trigger-width)]
                  overflow-hidden rounded-xl
                  border border-indigo-500/25
                  bg-[#0b1326]
                  shadow-2xl
                "
                position="popper"
                sideOffset={6}
              >
                <SelectPrimitive.Viewport className="p-2">
                  {(['user', 'admin'] as const).map((v) => (
                    <SelectPrimitive.Item
                      key={v}
                      value={v}
                      className="
                        relative flex cursor-default select-none items-center
                        rounded-lg py-4 pl-6 pr-8
                        text-xl text-[#c7c4d7]
                        outline-none
                        focus:bg-indigo-600/25 focus:text-[#dae2fd]
                        capitalize
                      "
                    >
                      <SelectPrimitive.ItemText>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </SelectPrimitive.ItemText>
                    </SelectPrimitive.Item>
                  ))}
                </SelectPrimitive.Viewport>
              </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
          </SelectPrimitive.Root>
        </div>
      </div>

      <SubmitButton loading={loading} label="Create Account" loadingLabel="Creating…" />
    </form>
  );
}

// ─── Auth Card ────────────────────────────────────────────────────────────────

function AuthCard() {
  const [activeTab, setActiveTab] = useState<TabValue>('signin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSuccess = () => navigate('/dashboard');
  const handleError = (msg: string) => setError(msg);

  const handleTabChange = (v: string) => {
    setActiveTab(v as TabValue);
    setError('');
  };

  return (
    <div
      className="
        w-full rounded-2xl overflow-hidden
        border border-white/[0.08]
        backdrop-blur-2xl
      "
      style={{
        background:
          'linear-gradient(160deg, rgba(11,19,38,0.97) 0%, rgba(8,13,28,0.98) 100%)',
        boxShadow:
          '0 0 0 1px rgba(99,102,241,0.12), 0 32px 80px rgba(0,0,0,0.80), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Top accent line */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(99,102,241,0.60) 35%, rgba(139,92,246,0.60) 65%, transparent)',
        }}
      />

      {/* Brand mark */}
      <div className="flex flex-col items-center gap-4 pt-16 pb-8">
        <div
          className="
            w-20 h-20 rounded-2xl
            bg-indigo-600/15 border border-indigo-500/30
            flex items-center justify-center
          "
          style={{ boxShadow: '0 0 32px rgba(99,102,241,0.28)' }}
        >
          <ShieldCheck className="w-10 h-10 text-indigo-400" />
        </div>
        <span className="text-base font-semibold tracking-[0.28em] text-indigo-400/65 uppercase">
          Secure Access
        </span>
      </div>

      {/* Tab bar */}
      <TabsPrimitive.Root value={activeTab} onValueChange={handleTabChange}>
        <div className="px-12 sm:px-20">
          <TabsPrimitive.List
            className="
              grid grid-cols-2
              bg-white/[0.03] border border-white/[0.07]
              p-1.5 rounded-xl
            "
          >
            <TabsPrimitive.Trigger
              value="signin"
              className="
                flex items-center justify-center gap-3
                py-4 text-xl font-medium
                text-[#908fa0] rounded-lg
                transition-all duration-200
                data-[state=active]:bg-[#1e1e40]
                data-[state=active]:text-[#dae2fd]
                data-[state=active]:shadow-sm
                focus:outline-none
              "
            >
              <LogIn className="w-6 h-6 shrink-0" />
              Sign In
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger
              value="signup"
              className="
                flex items-center justify-center gap-3
                py-4 text-xl font-medium
                text-[#908fa0] rounded-lg
                transition-all duration-200
                data-[state=active]:bg-[#1e1e40]
                data-[state=active]:text-[#dae2fd]
                data-[state=active]:shadow-sm
                focus:outline-none
              "
            >
              <UserPlus className="w-6 h-6 shrink-0" />
              Sign Up
            </TabsPrimitive.Trigger>
          </TabsPrimitive.List>
        </div>

        <TabsPrimitive.Content value="signin">
          <SignInForm
            onSuccess={handleSuccess}
            onError={handleError}
            loading={loading}
            setLoading={setLoading}
            error={error}
          />
        </TabsPrimitive.Content>

        <TabsPrimitive.Content value="signup">
          <SignUpForm
            onSuccess={handleSuccess}
            onError={handleError}
            loading={loading}
            setLoading={setLoading}
            error={error}
          />
        </TabsPrimitive.Content>
      </TabsPrimitive.Root>

      {/* Bottom accent */}
      <div
        className="h-px w-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(139,92,246,0.30) 50%, transparent)',
        }}
      />
    </div>
  );
}

// ─── Background Grid ──────────────────────────────────────────────────────────

function BackgroundGrid() {
  return (
    <>
      {/* Top-down perspective grid */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.38) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.38) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 18%, black 78%, transparent 100%)',
        }}
      />
      {/* Perspective floor grid */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2 opacity-35 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139,92,246,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.55) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          transform: 'perspective(400px) rotateX(60deg)',
          transformOrigin: 'bottom center',
        }}
      />
    </>
  );
}

// ─── Atmospheric Glows ────────────────────────────────────────────────────────

function AtmosphericGlows() {
  return (
    <>
      <div className="absolute -top-60 -left-60 w-[700px] h-[700px] bg-indigo-600/12 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-60 -right-60 w-[600px] h-[600px] bg-violet-700/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />
    </>
  );
}

// ─── Decorative SVGs ──────────────────────────────────────────────────────────

function RoboticHandSvg() {
  return (
    <svg
      className="absolute top-[8%] right-[16%] opacity-35 text-indigo-400 -rotate-12 pointer-events-none hidden md:block"
      width="160"
      height="210"
      viewBox="0 0 140 180"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M50,180 L40,120 L30,60 L40,30 L50,10 L60,30 L60,80" />
      <path d="M70,180 L70,110 L75,50 L85,20 L95,50 L85,90" />
      <path d="M90,180 L100,120 L110,60 L120,40 L130,60 L115,100" />
      <path d="M30,120 L10,90 L5,70 L15,60 L25,80" />
      <circle cx="40" cy="120" r="4" />
      <circle cx="30" cy="60" r="3" />
      <circle cx="70" cy="110" r="4" />
      <circle cx="75" cy="50" r="3" />
      <circle cx="100" cy="120" r="4" />
      <circle cx="110" cy="60" r="3" />
      <circle cx="10" cy="90" r="3" />
      <line x1="30" y1="150" x2="110" y2="150" strokeDasharray="3 3" />
    </svg>
  );
}

function VrHeadsetSvg() {
  return (
    <svg
      className="absolute bottom-[18%] right-[8%] opacity-45 text-cyan-400 rotate-12 pointer-events-none hidden md:block"
      width="190"
      height="120"
      viewBox="0 0 160 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        d="M20,30 Q40,10 80,10 Q120,10 140,30 L150,50 Q155,70 140,80 Q120,90 80,90 Q40,90 20,80 L10,50 Z"
        strokeDasharray="4 2"
      />
      <rect x="30" y="30" width="100" height="40" rx="10" />
      <path d="M80,30 L80,70" />
      <circle cx="55" cy="50" r="10" strokeWidth="1" />
      <circle cx="105" cy="50" r="10" strokeWidth="1" />
    </svg>
  );
}

function CircuitNodesSvg() {
  return (
    <svg
      className="absolute bottom-[6%] left-[20%] opacity-35 text-cyan-400 pointer-events-none hidden lg:block"
      width="240"
      height="180"
      viewBox="0 0 200 150"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M10,140 L50,100 L120,100 L160,60 L190,60" />
      <path d="M50,100 L70,120 L150,120" strokeDasharray="4 4" />
      <path d="M120,100 L140,80 L180,80" />
      <circle cx="10" cy="140" r="4" fill="currentColor" />
      <circle cx="50" cy="100" r="3" />
      <circle cx="120" cy="100" r="4" fill="currentColor" />
      <circle cx="160" cy="60" r="3" />
      <circle cx="190" cy="60" r="4" fill="currentColor" />
      <rect x="145" y="115" width="10" height="10" />
      <rect x="175" y="75" width="10" height="10" />
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AuthPage() {
  return (
    <div className="auth-page min-h-screen bg-[#050510] flex items-center justify-center relative overflow-hidden">
      {/* Background layers */}
      <BackgroundGrid />
      <AtmosphericGlows />

      {/* Scan lines */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(139,92,246,1) 3px, rgba(139,92,246,1) 4px)',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 60% at 50% 50%, rgba(5,5,16,0.0) 0%, rgba(5,5,16,0.60) 100%)',
        }}
      />

      {/* Robot image — top-left, prominent */}
      <div
        className="
          absolute top-[6%] left-[2%]
          md:top-[8%] md:left-[5%]
          lg:left-[6%]
          w-[220px] md:w-[300px] lg:w-[360px]
          opacity-85 rotate-[-5deg]
          pointer-events-none z-0
        "
      >
        <RobotImage src="/image.png" />
      </div>

      {/* Decorative SVGs */}
      <RoboticHandSvg />
      <VrHeadsetSvg />
      <CircuitNodesSvg />

      {/* Auth card — centred, properly sized */}
      <div className="relative z-10 w-full max-w-[800px] px-6 md:px-12 py-10">
        <AuthCard />
      </div>
    </div>
  );
}
