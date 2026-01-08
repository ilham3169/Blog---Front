import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, Activity, User, AlertCircle, CheckCircle} from 'lucide-react';
import { login, update_login, register } from '../services/authService';
import { useNavigate } from 'react-router-dom'; 
import { checkExistingSession } from '../services/authService';



export default function Login() {
  const [mode, setMode] = useState('login'); 

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [message, setMessage] = useState({ type: '', text: '' }); 
  const navigate = useNavigate(); 

  const [showPassword, setShowPassword] = useState(false);

  const isRegister = mode === 'register';

  useEffect(() => {
    const verify = async () => {
        const session = await checkExistingSession();
        if (session.isValid) {
            navigate('/dashboard');
        }
    };
    verify()
  }, [navigate])

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    resetForm();
  };

  const validate = () => {
    if (!username.trim()) return 'Username is required.';
    if (!password) return 'Password is required.';

    if (isRegister) {
      if (!email.trim()) return 'Email is required.';
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Please enter a valid email.';
      if (!confirmPassword) return 'Please confirm your password.';
      if (password !== confirmPassword) return 'Passwords do not match.';
      if (password.length < 6) return 'Password must be at least 6 characters.';
    }

    return null;
  };

  const handleSubmit = async () => {
    setMessage({ type: '', text: '' })
    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    if (!username || !password) { 
      setMessage({ type: 'error', text: t.errorEmptyFields }); 
      return; 
    }

    if (isRegister) {

      try {
        await register(username, password, email); 
        setMessage({ type: 'success', text: "Succesful Registered" });

        setTimeout(() => {
          setMessage({type: "", text: ""})
        }, 5000);


      } catch (error) { 
        setMessage({type: 'error', text: error.message})
        setTimeout(() => {
          setMessage({type: "", text: ""})
        }, 5000);
      }

    }else {
      try {
        const response = await login(username, password); 
        localStorage.setItem('token', response.access_token); 
        setMessage({ type: 'success', text: "Succesful Login" });
        await update_login(username)

        setTimeout(() => {
          setMessage({ type: "", text: "" });
          navigate("/dashboard");
        }, 3000);
        
      } catch (error) { 
        console.log(error.message)
        setMessage({ type: 'error', text: "Invalid Credentials" }); 
        setTimeout(() => {
          setMessage({type: "", text: ""})
        }, 3000);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
              <Activity className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Blog Management</h1>
          <p className="text-blue-100 text-center text-sm">Blog - Intern</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {/* Mode switch */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 rounded-lg font-semibold border transition ${
                !isRegister
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-transparent'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 rounded-lg font-semibold border transition ${
                isRegister
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-transparent'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              Register
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-center text-sm text-gray-500">
              {isRegister ? 'Fill the form to create a new user.' : 'Sign in to continue.'}
            </p>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* Email (register only) */}
          {isRegister && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your email"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password (register only) */}
          {isRegister && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Re-enter your password"
                />
              </div>
            </div>
          )}



          {/* Submit button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>

          {message.text && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-start gap-3 animate-fade-in ${
                message.type === 'error'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}
            >
              {message.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm font-medium ${
                  message.type === 'error' ? 'text-red-700' : 'text-green-700'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Need assistance?</span>
            </div>
          </div>

          {/* Bottom links */}
          <div className="text-center space-y-2">
            <a
              href="https://t.me/darwinyeahjustadarwin"
              className="block text-sm text-gray-600 hover:text-blue-600"
            >
              Contact IT Support
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">Protected by Ilham Yagubzade</p>
        </div>
      </div>
    </div>
  );
}
 