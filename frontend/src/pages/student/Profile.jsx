import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { studentService } from '@/services/studentService';
import { User, KeyRound, CheckCircle2, AlertCircle, Mail, Calendar } from 'lucide-react';

export default function Profile() {
  const { user, login } = useAuth();

  // Profile Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [joinedDate, setJoinedDate] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setProfileLoading(true);
    studentService.getProfile()
      .then((res) => {
        const data = res?.data || res || {};
        setFullName(data.fullName || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAvatarUrl(data.avatarUrl || '');
        if (data.createdAt) {
          setJoinedDate(new Date(data.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }));
        }
      })
      .catch((err) => {
        console.error('Failed to load profile', err);
        setProfileError('Failed to fetch profile details.');
      })
      .finally(() => setProfileLoading(false));
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileSaving(true);
    try {
      const res = await studentService.updateProfile({
        fullName,
        phone: phone || null,
        avatarUrl: avatarUrl || null
      });
      setProfileSuccess('Profile updated successfully!');
      // Update local storage user details if available
      if (user && res.data) {
        const stored = localStorage.getItem('token');
        if (stored) {
          // Keep auth context synced
          login(stored, { ...user, fullName: res.data.fullName });
        }
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      setProfileError(err?.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await studentService.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password has been changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Failed to change password', err);
      setPasswordError(err?.response?.data?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information, contact credentials, and account security"
      />

      {/* Profile Overview Card */}
      <div className="p-5 rounded-2xl bg-surface-2 border border-border flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-accent/20 text-accent font-bold text-xl flex items-center justify-center shrink-0">
          {fullName ? fullName.charAt(0).toUpperCase() : 'S'}
        </div>
        <div className="space-y-0.5 min-w-0">
          <h3 className="font-bold text-base text-text truncate">{fullName || 'Student'}</h3>
          <p className="text-xs text-muted flex items-center gap-1.5 truncate">
            <Mail className="w-3.5 h-3.5" />
            {email}
          </p>
          {joinedDate && (
            <p className="text-[11px] text-muted/80 flex items-center gap-1.5 pt-0.5">
              <Calendar className="w-3 h-3" />
              Member since {joinedDate}
            </p>
          )}
        </div>
      </div>

      {/* Edit Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-accent" />
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-surface-2 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              {profileSuccess && (
                <div className="p-3.5 rounded-xl bg-success/10 border border-success/20 text-success text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />

              <Input
                label="Registered Email"
                value={email}
                disabled
                helperText="Email cannot be changed directly for examination integrity."
              />

              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />

              <Input
                label="Avatar URL (Optional)"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
              />

              <div className="pt-2">
                <Button variant="accent" size="md" type="submit" isLoading={profileSaving}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-accent" />
            Security & Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-success/10 border border-success/20 text-success text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />

            <div className="pt-2">
              <Button variant="accent" size="md" type="submit" isLoading={passwordLoading}>
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
