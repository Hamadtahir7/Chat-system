// src/components/Login.jsx
import { useState } from "react";
import { Eye, EyeOff, Cloud, Lock } from "lucide-react";
import { authService } from "../services/authService";

export default function Login({ onSwitch, onLogin }) {
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !pass) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await authService.login(email, pass);
      console.log("Login successful:", result);
      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-sidebar flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-light rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      
      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-block p-3 rounded-2xl glass mb-4 glow-effect">
          <Lock size={28} className="text-blue-light" />
        </div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-light to-blue bg-clip-text text-transparent tracking-tight">ChatApp</h1>
        <p className="text-muted text-sm mt-1">Precision Communication</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md glass rounded-3xl px-8 py-8 relative z-10 glow-effect shadow-2xl">
        <h2 className="text-2xl font-bold text-primary mb-2">Welcome back</h2>
        <p className="text-muted text-sm mb-6">Sign in to continue your conversations</p>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-muted mb-2">
            Email or Username
          </label>
          <input
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full glass-sm rounded-lg px-4 py-3 text-sm text-primary
              placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-light transition-all"
          />
        </div>

        {/* Password */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-muted">Password</label>
            <span className="text-xs text-blue-light cursor-pointer hover:underline">Forgot password?</span>
          </div>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="••••••••"
              value={pass}
              onChange={e => setPass(e.target.value)}
              className="w-full glass-sm rounded-lg px-4 py-3 text-sm text-primary
                placeholder-muted pr-10 focus:outline-none focus:ring-2 focus:ring-blue-light transition-all"
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
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-blue-light to-blue hover:from-blue hover:to-blue-hover text-white font-semibold py-3 rounded-lg
            text-sm transition-all duration-300 glow-effect shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-[10px] text-muted tracking-widest uppercase font-semibold">Or continue with</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
        </div>

        {/* Social buttons */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 glass-sm
            rounded-lg py-3 text-sm font-semibold text-primary hover:bg-card/50 transition-all">
            <span className="font-black text-xs">G</span> Google
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 glass-sm
            rounded-lg py-3 text-sm font-semibold text-primary hover:bg-card/50 transition-all">
            <Cloud size={14} /> SSO
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-6" />
        <p className="text-center text-sm text-muted">
          Don't have an account?{" "}
          <button onClick={onSwitch} className="text-blue-light font-semibold hover:text-white transition-colors">
            Sign up
          </button>
        </p>
      </div>

      {/* Footer */}
      <div className="flex gap-6 mt-8 relative z-10">
        {["Privacy Policy", "Terms of Service", "Help Center"].map(l => (
          <span key={l} className="text-xs text-muted hover:text-primary cursor-pointer transition-colors">{l}</span>
        ))}
      </div>
    </div>
  );
}
