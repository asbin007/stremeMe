import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Info } from 'lucide-react';
import api from '../services/api';

interface ReminderPreferences {
  reminderEmailEnabled: boolean;
  lastNotificationSentAt: string | null;
  lastVisitedAt: string | null;
}

interface StatusMessage {
  type: 'success' | 'error';
  text: string;
}

const formatTimestamp = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const ReminderEmailSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<ReminderPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<StatusMessage | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<ReminderPreferences>(
        '/reminders/reminder-preferences'
      );
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleToggle = async () => {
    if (!preferences) return;

    const next = !preferences.reminderEmailEnabled;

    // Optimistic: the switch tracks the pointer immediately, then reconciles.
    setPreferences({ ...preferences, reminderEmailEnabled: next });
    setSaving(true);

    try {
      const response = await api.put('/reminders/reminder-preferences', {
        reminderEmailEnabled: next,
      });

      setPreferences(current =>
        current
          ? { ...current, reminderEmailEnabled: response.data.reminderEmailEnabled }
          : current
      );
      setMessage({ type: 'success', text: response.data.message });
    } catch (error) {
      console.error('Error updating preferences:', error);
      setPreferences(current =>
        current ? { ...current, reminderEmailEnabled: !next } : current
      );
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
        text: 'Test reminder email sent. Check your inbox.',
      });
    } catch (error) {
      console.error('Error sending test reminder:', error);
      const detail =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined;
      setMessage({ type: 'error', text: detail || 'Failed to send test email' });
    } finally {
      setSaving(false);
    }
  };

  // Clear a status message a few seconds after it appears, cancelling the timer
  // if another message replaces it first.
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface/70 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-64 rounded bg-white/10" />
          <div className="h-20 w-full rounded-xl bg-white/5" />
          <div className="h-11 w-full rounded-lg bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      aria-labelledby="reminder-settings-heading"
      // `bg-[var(--secondary-color)]` was used here, but that variable does not
      // exist — the theme defines `--color-secondary`. The panel rendered with
      // no background at all.
      className="rounded-2xl border border-white/10 bg-surface/70 p-6 backdrop-blur-xl"
    >
      <h3
        id="reminder-settings-heading"
        className="mb-6 flex items-center gap-3 text-xl font-semibold text-text"
      >
        <Mail className="size-5 text-accent" aria-hidden="true" />
        Reminder email preferences
      </h3>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          aria-live="polite"
          className={`mb-4 rounded-lg border p-3 text-sm ${
            message.type === 'success'
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-error/30 bg-error/10 text-error'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/[0.07]">
          <div className="flex-1">
            <h4 className="mb-1 font-medium text-text">Receive reminder emails</h4>
            <p className="text-sm text-text-muted">
              Get a personalised email with your favourites and new
              recommendations when you haven&apos;t visited in a few days.
            </p>
          </div>

          <label className="relative ml-2 inline-flex shrink-0 cursor-pointer items-center">
            <span className="sr-only">Receive reminder emails</span>
            <input
              type="checkbox"
              checked={preferences?.reminderEmailEnabled ?? false}
              onChange={handleToggle}
              disabled={saving}
              className="peer sr-only"
            />
            <div className="h-7 w-14 rounded-full bg-white/15 transition-colors after:absolute after:left-1 after:top-0.5 after:size-6 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-7 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent peer-disabled:opacity-60" />
          </label>
        </div>

        {(preferences?.lastVisitedAt || preferences?.lastNotificationSentAt) && (
          <dl className="grid gap-3 sm:grid-cols-2">
            {preferences.lastVisitedAt && (
              <div className="rounded-xl bg-white/5 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Last visited
                </dt>
                <dd className="mt-1 text-sm text-text">
                  {formatTimestamp(preferences.lastVisitedAt)}
                </dd>
              </div>
            )}

            {preferences.lastNotificationSentAt && (
              <div className="rounded-xl bg-white/5 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Last reminder sent
                </dt>
                <dd className="mt-1 text-sm text-text">
                  {formatTimestamp(preferences.lastNotificationSentAt)}
                </dd>
              </div>
            )}
          </dl>
        )}

        <button
          type="button"
          onClick={handleSendTestReminder}
          disabled={saving || !preferences?.reminderEmailEnabled}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-primary transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-text-muted"
        >
          <Send className="size-4" aria-hidden="true" />
          {saving ? 'Sending…' : 'Send test email'}
        </button>

        <p className="flex gap-2 rounded-lg border border-accent/20 bg-accent/5 p-4 text-sm leading-relaxed text-text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
          <span>
            Reminders go out to people who haven&apos;t visited in three days,
            and include your favourites plus new trending titles. You can
            unsubscribe any time from the email footer.
          </span>
        </p>
      </div>
    </motion.section>
  );
};

export default ReminderEmailSettings;
