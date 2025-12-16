import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    schoolName: '',
    specialization: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Must be at least 8 characters and contain both letters and numbers
    const hasMinLength = password.length >= 8;
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    return hasMinLength && hasLetters && hasNumbers;
  };

  const validateLoginForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors = {};

    if (!formData.fullName || formData.fullName.trim() === '') {
      newErrors.fullName = '名前を入力してください';
    }

    if (!formData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'パスワードは8文字以上で、英字と数字を含める必要があります';
    }

    if (!formData.schoolName || formData.schoolName.trim() === '') {
      newErrors.schoolName = '学校名を入力してください';
    }

    if (!formData.specialization || formData.specialization.trim() === '') {
      newErrors.specialization = '専攻を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateLoginForm()) {
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'ログインしました' });
      setTimeout(() => {
        navigate('/search');
      }, 500);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateRegisterForm()) {
      return;
    }

    setLoading(true);
    const result = await register({
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
      school_name: formData.schoolName,
      specialization: formData.specialization
    });
    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: '登録が完了しました。ログインしてください。' });
      // Clear form and switch to login tab
      setFormData({
        email: '',
        password: '',
        fullName: '',
        schoolName: '',
        specialization: ''
      });
      setTimeout(() => {
        setActiveTab('login');
        setMessage({ type: '', text: '' });
      }, 2000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Title */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            教師サポートHub
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Teacher Support Hub - コミュニティプラットフォーム
          </p>
        </div>

        {/* Tabs */}
        <div className="relative bg-gray-100 rounded-full p-1 mb-6 sm:mb-8">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-md transition-all duration-300 ease-in-out ${
              activeTab === 'login' ? 'left-1' : 'left-[calc(50%+4px-1px)]'
            }`}
          />
          <div className="relative flex">
            <button
              onClick={() => {
                setActiveTab('login');
                setMessage({ type: '', text: '' });
                setErrors({});
              }}
              className={`flex-1 py-2 text-center text-sm sm:text-base font-medium rounded-full transition-colors duration-300 z-10 ${
                activeTab === 'login'
                  ? 'text-gray-900'
                  : 'text-gray-600'
              }`}
            >
              ログイン
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setMessage({ type: '', text: '' });
                setErrors({});
              }}
              className={`flex-1 py-2 text-center text-sm sm:text-base font-medium rounded-full transition-colors duration-300 z-10 ${
                activeTab === 'register'
                  ? 'text-gray-900'
                  : 'text-gray-600'
              }`}
            >
              新規登録
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <div>
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2 text-left">
                  メールアドレス
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-gray-300 focus:bg-white transition-colors ${
                    errors.email ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2 text-left">
                  パスワード
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-gray-300 focus:bg-white transition-colors ${
                    errors.password ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-4 sm:mt-6"
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
            </form>
          </div>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <div>
            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="register-fullName" className="block text-xs sm:text-sm font-bold text-gray-900 mb-2 text-left">
                  氏名
                </label>
                <input
                  id="register-fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-gray-300 focus:bg-white transition-colors ${
                    errors.fullName ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="山田 太郎"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="register-email" className="block text-xs sm:text-sm font-bold text-gray-900 mb-2 text-left">
                  メールアドレス
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-gray-300 focus:bg-white transition-colors ${
                    errors.email ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="register-password" className="block text-xs sm:text-sm font-bold text-gray-900 mb-2 text-left">
                  パスワード
                </label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-gray-300 focus:bg-white transition-colors ${
                    errors.password ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="register-schoolName" className="block text-xs sm:text-sm font-bold text-gray-900 mb-2 text-left">
                  勤務校
                </label>
                <input
                  id="register-schoolName"
                  name="schoolName"
                  type="text"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-gray-300 focus:bg-white transition-colors ${
                    errors.schoolName ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="○○大学"
                />
                {errors.schoolName && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.schoolName}</p>
                )}
              </div>

              <div>
                <label htmlFor="register-specialization" className="block text-xs sm:text-sm font-bold text-gray-900 mb-2 text-left">
                  専門分野
                </label>
                <input
                  id="register-specialization"
                  name="specialization"
                  type="text"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-gray-300 focus:bg-white transition-colors ${
                    errors.specialization ? 'ring-2 ring-red-500' : ''
                  }`}
                  placeholder="数学、物理など"
                />
                {errors.specialization && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.specialization}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-4 sm:mt-6"
              >
                {loading ? '登録中...' : '登録'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
