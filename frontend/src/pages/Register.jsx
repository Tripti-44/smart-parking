import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { setCredentials } from '../redux/slices/authSlice';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success('Account created! Welcome to SmartPark');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-[#1e3a5f] mb-1">Create Account</h1>
        <p className="text-gray-500 mb-8 text-sm">Join SmartPark — park smarter every day</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'name',     label: 'Full Name',    type: 'text',     placeholder: 'Rahul Sharma' },
            { name: 'email',    label: 'Email',         type: 'email',    placeholder: 'you@example.com' },
            { name: 'phone',    label: 'Phone Number',  type: 'tel',      placeholder: '9876543210' },
            { name: 'password', label: 'Password',      type: 'password', placeholder: '••••••••' },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input
                name={f.name} type={f.type} required
                value={form[f.name]} onChange={handleChange}
                placeholder={f.placeholder}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <button
            type="submit" disabled={loading}
            className="w-full bg-[#1e3a5f] hover:bg-[#2d5282] text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
