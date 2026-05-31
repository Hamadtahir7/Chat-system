// src/components/Signup.jsx
import { useState } from "react";
import { Eye, EyeOff, MessageSquare } from "lucide-react";

export default function Signup({ onSwitch, onSignup }) {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [pass, setPass]         = useState("");
  const [show, setShow]         = useState(false);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl px-8 py-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-blue flex items-center justify-center mb-3">
            <MessageSquare size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-blue-light">ChatApp</h1>
          <p className="text-sm text-muted mt-1">Join the future of precision communication.</p>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-muted mb-1.5">
            Username
          </label>
          <input
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-primary
              placeholder-muted focus:outline-none focus:border-blue transition-colors"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-muted mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-primary
              placeholder-muted focus:outline-none focus:border-blue transition-colors"
          />
        </div>

        {/* Password */}
        <div className="mb-1">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-muted mb-1.5">
            Password
          </label>
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
          <p className="text-xs text-muted mt-1.5">Must be at least 8 characters long.</p>
        </div>

        {/* Submit */}
        <button
          onClick={onSignup}
          className="w-full mt-5 bg-blue hover:bg-blue-hover text-white font-semibold py-2.5 rounded-lg
            text-sm transition-colors"
        >
          Create Account
        </button>

        <p className="text-center text-xs text-muted mt-4">
          By registering, you agree to ChatApp's{" "}
          <span className="text-blue-light cursor-pointer hover:underline">Terms of Service</span> and{" "}
          <span className="text-blue-light cursor-pointer hover:underline">Privacy Policy</span>.
        </p>

        <div className="h-px bg-border my-5" />
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <button onClick={onSwitch} className="text-blue-light font-semibold hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
