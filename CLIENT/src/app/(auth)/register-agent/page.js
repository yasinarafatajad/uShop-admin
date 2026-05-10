'use client'
import { useState } from 'react';
import Link from 'next/link';
import { Truck, User, Phone, Mail, FileText, CheckCircle2, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export default function RegisterAgent() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', 
    nid: '', vehicleType: '', vehicleReg: '',
    password: '', confirmPassword: ''
  });

  const validateStep1 = () => {
    let err = {};
    if (!formData.fullName) err.fullName = "Full name is required";
    if (!formData.phone || formData.phone.length < 11) err.phone = "Valid phone number required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) err.email = "Valid email required";
    if (!formData.nid) err.nid = "NID number is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateStep2 = () => {
    let err = {};
    if (!formData.vehicleType) err.vehicleType = "Please select a vehicle type";
    if (!formData.vehicleReg) err.vehicleReg = "Vehicle registration is required";
    if (!formData.password || formData.password.length < 8) err.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) err.confirmPassword = "Passwords do not match";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep2()) {
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
          Your application has been received. Our team will review your details and contact you shortly.
        </p>
        <Link href="/login" className="inline-flex items-center justify-center w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500 max-w-lg w-full mx-auto">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>

      <div className="flex flex-col items-center mb-6 relative z-10">
        <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Become an Agent</h1>
        <p className="text-sm text-muted-foreground text-center">
          Join our delivery network today
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-center mb-8 relative z-10">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>1</div>
        <div className={`h-1 w-12 mx-2 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`}></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>2</div>
      </div>

      <div className="relative z-10">
        {step === 1 ? (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium mb-1.5 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="01XXXXXXXXX" className={`w-full h-11 pl-9 pr-4 bg-background/50 backdrop-blur-sm border ${errors.phone ? 'border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} focus:ring-2 rounded-xl outline-none transition-all text-sm`} />
                </div>
                {errors.phone && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="agent@example.com" className={`w-full h-11 pl-9 pr-4 bg-background/50 backdrop-blur-sm border ${errors.email ? 'border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} focus:ring-2 rounded-xl outline-none transition-all text-sm`} />
              </div>
              {errors.email && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">National ID (NID)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={formData.nid} onChange={e => setFormData({...formData, nid: e.target.value})}
                  placeholder="XXXXXXXXXX" className={`w-full h-11 pl-9 pr-4 bg-background/50 backdrop-blur-sm border ${errors.nid ? 'border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} focus:ring-2 rounded-xl outline-none transition-all text-sm`} />
              </div>
              {errors.nid && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.nid}</p>}
            </div>

            <button onClick={handleNext} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 mt-6 transition-all shadow-lg shadow-primary/25">
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 ml-1">Vehicle Type</label>
                <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})}
                  className={`w-full h-11 px-4 bg-background/50 backdrop-blur-sm border ${errors.vehicleType ? 'border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} focus:ring-2 rounded-xl outline-none transition-all text-sm appearance-none cursor-pointer`}>
                  <option value="">Select type</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Van">Van / Pickup</option>
                </select>
                {errors.vehicleType && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.vehicleType}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 ml-1">Reg. Number</label>
                <input type="text" value={formData.vehicleReg} onChange={e => setFormData({...formData, vehicleReg: e.target.value})}
                  placeholder="DHK-MA-XX-XXXX" className={`w-full h-11 px-4 bg-background/50 backdrop-blur-sm border ${errors.vehicleReg ? 'border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} focus:ring-2 rounded-xl outline-none transition-all text-sm`} />
                {errors.vehicleReg && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.vehicleReg}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Create Password</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="Min 8 characters" className={`w-full h-11 pl-9 pr-4 bg-background/50 backdrop-blur-sm border ${errors.password ? 'border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} focus:ring-2 rounded-xl outline-none transition-all text-sm`} />
              </div>
              {errors.password && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Confirm Password</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Retype password" className={`w-full h-11 pl-9 pr-4 bg-background/50 backdrop-blur-sm border ${errors.confirmPassword ? 'border-destructive focus:ring-destructive/20' : 'border-input focus:border-primary focus:ring-primary/20'} focus:ring-2 rounded-xl outline-none transition-all text-sm`} />
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-destructive mt-1 ml-1">{errors.confirmPassword}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setStep(1)} className="w-1/3 h-12 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors">
                Back
              </button>
              <button type="submit" disabled={isLoading} className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 disabled:opacity-70">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground relative z-10">
        Already an agent?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
