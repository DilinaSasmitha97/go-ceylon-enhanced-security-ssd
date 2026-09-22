import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from "../config/config";

const PasswordReset = () => {
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#ffffff");
    }, []);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/request-otp`, { email });
            setStep('otp');
        } catch (err) {
            console.error(err);
            setError('Failed to send OTP. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // limit to 1 char
        setOtp(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length !== 5) {
            setError("Please enter all 5 digits.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
                email,
                otp: fullOtp
            });
            setStep('password');
        } catch (err) {
            console.error(err);
            setError("Invalid OTP. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
                email,
                newPassword: newPassword,
                otp: otp.join('')
            });
            alert("Password reset successful!");
            navigate('/');
        } catch (err) {
            console.error(err);
            setError("Failed to reset password. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center relative lg:bg-gray-100">
            <div className="bg-white bg-opacity-80 p-10 max-w-[400px] w-full z-10 relative lg:shadow-lg lg:rounded-lg">
                <div className="text-left mb-6">
                    <h2 className="text-3xl font-semibold text-gray-800">Reset Password</h2>
                    <p className="text-sm mt-2 text-gray-500">Discover Sri Lanka’s stunning destinations, rich culture, and unforgettable tours.</p>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                {/* Step 1: Email Form */}
                {step === 'email' && (
                    <form className="space-y-6" onSubmit={handleSendOtp}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 mt-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-[#007a55] text-white py-3 rounded-lg">
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Input */}
                {step === 'otp' && (
                    <div className="space-y-6">
                        <p className="text-sm text-gray-600">Enter the 5-digit OTP sent to <strong>{email}</strong></p>
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(e.target.value, index)}
                                    maxLength={1}
                                    className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            ))}
                        </div>
                        <button onClick={handleVerifyOtp} className="w-full bg-[#007a55] text-white py-3 rounded-lg">
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </div>
                )}

                {/* Step 3: New Password */}
                {step === 'password' && (
                    <form className="space-y-6" onSubmit={handleResetPassword}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 mt-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 mt-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-[#007a55] text-white py-3 rounded-lg">
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="mt-4">
                    <p className="text-center text-gray-500 text-sm">OR Back To <Link to="/" className="text-sm text-[#007a55] hover:underline">Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default PasswordReset;
