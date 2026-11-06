import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/context/ThemeContext';
import { adminService } from '@/services/adminService';
import { KeyRound, Moon, Sun, Monitor, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminSettings() {
  const { theme, setTheme } = useTheme();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match');
      return;
    }

    setLoading(true);
    try {
      await adminService.changePassword(currentPassword, newPassword);
      setSuccessMsg('Your administrator password has been updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change failed', err);
      const msg = err?.response?.data?.message || 'Failed to update password. Please check your current password.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Admin Settings"
        subtitle="Manage administrator account credentials and platform interface preferences"
      />

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <KeyRound className="w-4 h-4 text-accent" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-success/10 border border-success/20 text-success text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
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
              <Button variant="accent" size="md" type="submit" isLoading={loading}>
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Theme Appearance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Sun className="w-4 h-4 text-accent" />
            Appearance & Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted mb-4">
            Customize your visual workspace. Choose between light, dark, or sync with your system preference.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-medium transition-all ${
                theme === 'light'
                  ? 'border-accent bg-accent/10 text-accent font-semibold shadow-sm'
                  : 'border-border bg-surface-2 hover:border-text/20 text-muted'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-medium transition-all ${
                theme === 'dark'
                  ? 'border-accent bg-accent/10 text-accent font-semibold shadow-sm'
                  : 'border-border bg-surface-2 hover:border-text/20 text-muted'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span>Dark</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-xs font-medium transition-all ${
                theme === 'system'
                  ? 'border-accent bg-accent/10 text-accent font-semibold shadow-sm'
                  : 'border-border bg-surface-2 hover:border-text/20 text-muted'
              }`}
            >
              <Monitor className="w-5 h-5" />
              <span>System</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
