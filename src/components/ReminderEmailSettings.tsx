import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';

interface ReminderPreferences {
  reminderEmailEnabled: boolean;
  lastNotificationSentAt: string | null;
  lastVisitedAt: string | null;
}

export const ReminderEmailSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<ReminderPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reminders/reminder-preferences');
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      const response = await api.put('/reminders/reminder-preferences', {
        reminderEmailEnabled: !preferences.reminderEmailEnabled,
      });

      setPreferences({
        ...preferences,
        reminderEmailEnabled: response.data.reminderEmailEnabled,
      });

      setMessage({
        type: 'success',
        text: response.data.message,
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage({ type: 'error', text: 'Failed to update preferences' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestReminder = async () => {
    try {
      setSaving(true);
      await api.post('/reminders/send-test-reminder', {});

      setMessage({
        type: 'success',
        text: 'Test reminder email sent! Check your inbox.',
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error sending test reminder:', error);
      const errorMsg = error.response?.data?.error || 'Failed to send test email';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-[var(--secondary-color)] rounded-lg">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-[var(--secondary-color)] rounded-lg border border-white/10"
    >
      <h3 className="text-xl font-bold mb-6 text-white">📧 Reminder Email Preferences</h3>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Reminder Toggle */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
          <div className="flex-1">
            <h4 className="text-white font-semibold mb-1">Receive Reminder Emails</h4>
            <p className="text-gray-400 text-sm">
              Get personalized reminder emails with your favorite movies and new recommendations when you haven't visited in a few days.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={preferences?.reminderEmailEnabled || false}
              onChange={handleToggle}
              disabled={saving}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Last Activity Info */}
        {preferences?.lastVisitedAt && (
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-sm">
              <span className="text-white font-semibold">Last visited:</span>{' '}
              {new Date(preferences.lastVisitedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}

        {preferences?.lastNotificationSentAt && (
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-sm">
              <span className="text-white font-semibold">Last reminder sent:</span>{' '}
              {new Date(preferences.lastNotificationSentAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}

        {/* Test Email Button */}
        <button
          onClick={handleSendTestReminder}
          disabled={saving || !preferences?.reminderEmailEnabled}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>📨</span>
          <span>{saving ? 'Sending...' : 'Send Test Email'}</span>
        </button>

        {/* Info Box */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm leading-relaxed">
            <strong>ℹ️ How it works:</strong> Reminder emails are sent to users who haven't visited in 3 days. Each reminder includes your favorite movies and new trending content. You can unsubscribe anytime from the email footer.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ReminderEmailSettings;
