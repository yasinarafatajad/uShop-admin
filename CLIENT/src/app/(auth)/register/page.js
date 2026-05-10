'use client'
import { useState } from 'react';
import Link from 'next/link';
import { User, Phone, Mail, ShieldCheck, CheckCircle2, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

export default function RegisterAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', 
    password: '', confirmPassword: ''
  });

  const validateForm = () => {
    let err = {};
    if (!formData.fullName) err.fullName = "Full name is required";
    if (!formData.phone || formData.phone.length < 11) err.phone = "Valid phone number required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) err.email = "Valid email required";
    if (!formData.password || formData.password.length < 8) err.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) err.confirmPassword = "Passwords do not match";
    
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true);
      }, 1500);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-success/5 to-transparent pointer-events-none"></div>
        <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
        <p className="text-muted-foreground mb-8">
          Your admin account has been created successfully. You can now log in.
        </p>
        <Link href="/login" className="inline-flex items-center justify-center w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500 max-w-md w-full mx-auto">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>

      <div className="flex flex-col items-center mb-8 relative z-10">
        <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Admin Registration</h1>
        <p className="text-sm text-muted-foreground text-center">
          Create a new administrative account
        </p>
      </div>

      <div className="relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                placeholder="John Doe" className={`w-full h-11 pl-9 pr-4 bg-background/50 backdrop-blur-sm border ${errors.fullName ? 'border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} focus:ring-2 rounded-xl outline-none transition-all text-sm`} />
            </div>
            {errors.fullName && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="admin@example.com" className={`w-full h-11 pl-9 pr-4 bg-background/50 backdrop-blur-sm border ${errors.email ? 'border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} focus:ring-2 rounded-xl outline-none transition-all text-sm`} />
            </div>
            {errors.email && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="01XXXXXXXXX" className={`w-full h-11 pl-9 pr-4 bg-background/50 backdrop-blur-sm border ${errors.phone ? 'border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} focus:ring-2 rounded-xl outline-none transition-all text-sm`} />
            </div>
            {errors.phone && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Create Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type={showPass ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="Min 8 characters" className={`w-full h-11 pl-9 pr-10 bg-background/50 backdrop-blur-sm border ${errors.password ? 'border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} focus:ring-2 rounded-xl outline-none transition-all text-sm`} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 ml-1">Confirm Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type={showConfirmPass ? "text" : "password"} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Retype password" className={`w-full h-11 pl-9 pr-10 bg-background/50 backdrop-blur-sm border ${errors.confirmPassword ? 'border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} focus:ring-2 rounded-xl outline-none transition-all text-sm`} />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 mt-6 transition-all shadow-lg shadow-primary/25 disabled:opacity-70">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Admin Account'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground relative z-10">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
