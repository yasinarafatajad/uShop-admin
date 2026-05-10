'use client'
import { useState } from 'react';
import Link from 'next/link';
import { Store, Phone, Mail, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [method, setMethod] = useState('email'); // 'email' or 'mobile'
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500); // Simulate API call
  };

  return (
    <div className="bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500">
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>

      <div className="flex flex-col items-center mb-8 relative z-10">
        <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-4 transform hover:rotate-12 transition-transform duration-300">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Welcome Back</h1>
        <p className="text-sm text-muted-foreground text-center">
          Sign in to your account to continue
        </p>
      </div>

      <div className="flex bg-secondary/50 p-1 rounded-xl mb-6 relative z-10 backdrop-blur-sm border border-border/50">
        <button
          onClick={() => setMethod('email')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
            method === 'email'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setMethod('mobile')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
            method === 'mobile'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Mobile
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 relative z-10">
        <div className="space-y-4 animate-fade-in">
          {method === 'email' ? (
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  className="w-full h-12 pl-11 pr-4 bg-background/50 backdrop-blur-sm border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Mobile Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="+880 1XXXXXXXXX"
                  className="w-full h-12 pl-11 pr-4 bg-background/50 backdrop-blur-sm border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <label className="block text-sm font-medium">Password</label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full h-12 px-4 pr-10 bg-background/50 backdrop-blur-sm border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2 group shadow-lg shadow-primary/25 disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 relative z-10">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <button className="w-full h-12 bg-background hover:bg-secondary border border-border rounded-xl font-medium flex items-center justify-center gap-3 transition-all shadow-sm group">
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground relative z-10">
        Don't have an admin account?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
