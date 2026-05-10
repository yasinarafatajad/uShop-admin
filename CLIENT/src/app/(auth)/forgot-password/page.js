'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, UserCircle, Mail, MessageSquare, Phone, KeyRound, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [otpMethod, setOtpMethod] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  // Mock users
  const mockUsers = [
    { id: 1, name: 'Admin User', email: 'a***n@example.com', phone: '017****1234', avatar: 'A' },
    { id: 2, name: 'Agent John', email: 'j***n@delivery.com', phone: '018****5678', avatar: 'J' }
  ];

  // OTP Timer
  useEffect(() => {
    let interval;
    if (step === 3 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2); // Move to select user step
    }, 1000);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setStep(3); // Move to OTP method selection
  };

  const handleSendOTP = (method) => {
    setOtpMethod(method);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setTimer(60);
      setCanResend(false);
      setStep(4); // Move to OTP verification
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleVerifyOTP = () => {
    if (otp.join('').length === 6) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep(5); // Move to set password
      }, 1000);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    
    // Strong password policy check
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    if (!strongRegex.test(passwords.new)) {
      setPassError("Password must contain at least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPassError("Passwords do not match.");
      return;
    }

    setPassError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(6); // Success
    }, 1500);
  };

  return (
    <div className="bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500 w-full max-w-md mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none"></div>

      {step < 6 && (
        <div className="mb-6 relative z-10 flex items-center gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight">Reset Password</h1>
            <p className="text-xs text-muted-foreground">
              {step === 1 && "Find your account"}
              {step === 2 && "Select your account"}
              {step === 3 && "Choose recovery method"}
              {step === 4 && "Verify your identity"}
              {step === 5 && "Create new password"}
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* STEP 1: Search */}
        {step === 1 && (
          <form onSubmit={handleSearch} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Email, Phone, or Username</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" required value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter your details" 
                  className="w-full h-12 pl-10 pr-4 bg-background/50 backdrop-blur-sm border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-sm" />
              </div>
            </div>
            <button type="submit" disabled={isLoading || !searchQuery} className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search Account'}
            </button>
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back to Login</Link>
            </div>
          </form>
        )}

        {/* STEP 2: Select User */}
        {step === 2 && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-muted-foreground mb-4">We found multiple accounts matching your search. Please select yours.</p>
            {mockUsers.map(user => (
              <button key={user.id} onClick={() => handleSelectUser(user)} className="w-full flex items-center gap-4 p-4 bg-background/50 hover:bg-secondary border border-border rounded-xl transition-all text-left group">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              </button>
            ))}
          </div>
        )}

        {/* STEP 3: OTP Options */}
        {step === 3 && selectedUser && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg mb-6">
              <UserCircle className="w-10 h-10 text-primary" />
              <div>
                <p className="text-sm font-medium">{selectedUser.name}</p>
                <p className="text-xs text-muted-foreground">Select where to send the OTP</p>
              </div>
            </div>

            <button onClick={() => handleSendOTP('email')} disabled={isLoading} className="w-full flex items-center gap-4 p-4 bg-background/50 hover:bg-secondary border border-border rounded-xl transition-all text-left">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Send via Email</p>
                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
              </div>
            </button>

            <button onClick={() => handleSendOTP('sms')} disabled={isLoading} className="w-full flex items-center gap-4 p-4 bg-background/50 hover:bg-secondary border border-border rounded-xl transition-all text-left">
              <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Send via SMS</p>
                <p className="text-xs text-muted-foreground">{selectedUser.phone}</p>
              </div>
            </button>
            
            <button onClick={() => handleSendOTP('whatsapp')} disabled={isLoading} className="w-full flex items-center gap-4 p-4 bg-background/50 hover:bg-secondary border border-border rounded-xl transition-all text-left">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Send via WhatsApp</p>
                <p className="text-xs text-muted-foreground">{selectedUser.phone}</p>
              </div>
            </button>
          </div>
        )}

        {/* STEP 4: Verify OTP */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in text-center">
            <p className="text-sm text-muted-foreground">
              We've sent a 6-digit code to your {otpMethod}.<br/>Enter it below to verify.
            </p>

            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-12 h-14 text-center text-xl font-bold bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none transition-all"
                />
              ))}
            </div>

            <div className="text-sm">
              <button 
                onClick={() => setTimer(60)} 
                disabled={timer > 0}
                className={`font-medium transition-colors ${timer > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:underline'}`}
              >
                {timer > 0 ? `Resend OTP Code (${timer}s)` : 'Resend OTP Code'}
              </button>
            </div>

            <button onClick={handleVerifyOTP} disabled={isLoading || otp.join('').length !== 6} className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
            </button>
          </div>
        )}

        {/* STEP 5: New Password */}
        {step === 5 && (
          <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
            {passError && <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg border border-destructive/20">{passError}</div>}
            
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">New Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPass ? "text" : "password"} required value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  placeholder="Enter strong password" 
                  className="w-full h-12 pl-10 pr-10 bg-background/50 backdrop-blur-sm border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 ml-1">At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5 ml-1">Confirm Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showConfirmPass ? "text" : "password"} required value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  placeholder="Retype new password" 
                  className="w-full h-12 pl-10 pr-10 bg-background/50 backdrop-blur-sm border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all text-sm" />
                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full h-12 mt-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
            </button>
          </form>
        )}

        {/* STEP 6: Success */}
        {step === 6 && (
          <div className="text-center animate-fade-in py-4">
            <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
            <p className="text-muted-foreground mb-8 text-sm">
              Your password has been successfully changed. You can now log in with your new password.
            </p>
            <Link href="/login" className="inline-flex items-center justify-center w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
