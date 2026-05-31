// src/components/Signup.jsx
import { useState } from "react";
import { Eye, EyeOff, MessageSquare } from "lucide-react";
import { authService } from "../services/authService";

export default function Signup({ onSwitch, onSignup }) {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [pass, setPass]         = useState("");
  const [show, setShow]         = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!username || !email || !pass) {
      setError("Please fill in all fields");
      return;
    }
    if (pass.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await authService.signup(username, email, pass);
      console.log("Signup successful:", result);
      onSignup();
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-sidebar flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-light rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      <div className="w-full max-w-md glass rounded-3xl px-8 py-8 relative z-10 glow-effect shadow-2xl">

        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-light to-blue flex items-center justify-center mb-3 glow-effect shadow-lg">
            <MessageSquare size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-light to-blue bg-clip-text text-transparent">ChatApp</h1>
          <p className="text-sm text-muted mt-1">Join the future of precision communication.</p>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-muted mb-2">
            Username
          </label>
          <input
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full glass-sm rounded-lg px-4 py-3 text-sm text-primary
              placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-light transition-all"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-muted mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full glass-sm rounded-lg px-4 py-3 text-sm text-primary
              placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue-light transition-all"
          />
        </div>

        {/* Password */}
        <div className="mb-1">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-muted mb-2">
            Password
          </label>
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
          <p className="text-xs text-muted mt-2">Must be at least 8 characters long.</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-blue-light to-blue hover:from-blue hover:to-blue-hover text-white font-semibold py-3 rounded-lg
            text-sm transition-all duration-300 glow-effect shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        <p className="text-center text-xs text-muted mt-4">
          By registering, you agree to ChatApp's{" "}
          <span className="text-blue-light cursor-pointer hover:text-white transition-colors">Terms of Service</span> and{" "}
          <span className="text-blue-light cursor-pointer hover:text-white transition-colors">Privacy Policy</span>.
        </p>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-6" />
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <button onClick={onSwitch} className="text-blue-light font-semibold hover:text-white transition-colors">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
