// src/components/Login.jsx
import { useState } from "react";
import { Eye, EyeOff, Cloud } from "lucide-react";

export default function Login({ onSwitch, onLogin }) {
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [show, setShow]     = useState(false);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-blue-light tracking-tight">ChatApp</h1>
        <p className="text-muted text-sm mt-1">Precision Communication</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl px-8 py-8">
        <h2 className="text-xl font-bold text-primary mb-6">Welcome back</h2>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-muted mb-1.5">
            Email or Username
          </label>
          <input
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-primary
              placeholder-muted focus:outline-none focus:border-blue transition-colors"
          />
        </div>

        {/* Password */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted">Password</label>
            <span className="text-xs text-blue-light cursor-pointer hover:underline">Forgot password?</span>
          </div>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="••••••••"
              value={pass}
              onChange={e => setPass(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-primary
                placeholder-muted pr-10 focus:outline-none focus:border-blue transition-colors"
            />
            <button
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Login btn */}
        <button
          onClick={onLogin}
          className="w-full mt-5 bg-blue hover:bg-blue-hover text-white font-semibold py-2.5 rounded-lg
            text-sm transition-colors"
        >
          Login
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-muted tracking-widest uppercase">Or continue with</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social buttons */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 bg-input border border-border
            rounded-lg py-2.5 text-sm font-semibold text-primary hover:bg-card transition-colors">
            <span className="font-black text-xs">G</span> Google
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-input border border-border
            rounded-lg py-2.5 text-sm font-semibold text-primary hover:bg-card transition-colors">
            <Cloud size={14} /> SSO
          </button>
        </div>

        <div className="h-px bg-border my-6" />
        <p className="text-center text-sm text-muted">
          Need an account?{" "}
          <button onClick={onSwitch} className="text-blue-light font-semibold hover:underline">
            Sign up
          </button>
        </p>
      </div>

      {/* Footer */}
      <div className="flex gap-6 mt-8">
        {["Privacy Policy", "Terms of Service", "Help Center"].map(l => (
          <span key={l} className="text-xs text-muted hover:text-primary cursor-pointer transition-colors">{l}</span>
        ))}
      </div>
    </div>
  );
}
