import React, { useState } from 'react';
import { auth } from '../services/auth';
import Button from '../components/common/Button';

export default function Profile({ user, onUpdateUser }) {
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const response = await auth.updateProfile(name);
      onUpdateUser(response.user);
      setProfileMessage({ type: 'success', text: response.message });
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== newPasswordConfirmation) {
        setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
        setPasswordLoading(false);
        return;
    }

    try {
      const response = await auth.changePassword(currentPassword, newPassword, newPasswordConfirmation);
      setPasswordMessage({ type: 'success', text: response.message });
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Profile Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your account information and password.</p>
        </div>

        {/* Profile Information */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Update your account's profile information.</p>
            </div>
            <form className="mt-5 space-y-4" onSubmit={handleUpdateProfile}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1">
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm px-3 py-2 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email address cannot be changed.</p>
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1">
                    <input
                        type="text"
                        name="name"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm px-3 py-2 border"
                    />
                </div>
              </div>

              {profileMessage.text && (
                <div className={`rounded-md p-2 text-sm ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {profileMessage.text}
                </div>
              )}

              <div>
                <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Change Password</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Ensure your account is using a long, random password to stay secure.</p>
            </div>
            <form className="mt-5 space-y-4" onSubmit={handleChangePassword}>
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">Current Password</label>
                <div className="mt-1">
                    <input
                        type="password"
                        name="current_password"
                        id="current_password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm px-3 py-2 border"
                    />
                </div>
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="mt-1">
                    <input
                        type="password"
                        name="new_password"
                        id="new_password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm px-3 py-2 border"
                    />
                </div>
              </div>

              <div>
                <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="mt-1">
                    <input
                        type="password"
                        name="new_password_confirmation"
                        id="new_password_confirmation"
                        value={newPasswordConfirmation}
                        onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                        required
                        minLength={8}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm px-3 py-2 border"
                    />
                </div>
              </div>

              {passwordMessage.text && (
                <div className={`rounded-md p-2 text-sm ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {passwordMessage.text}
                </div>
              )}

              <div>
                <Button type="submit" disabled={passwordLoading}>
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
