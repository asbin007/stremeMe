import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import api from '../services/api';

/**
 * Custom hook to track user activity/visits
 * Sends a request to backend every time user navigates to update lastVisitedAt timestamp
 */
export const useTrackVisit = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const trackVisit = async () => {
      if (!user?.id) return;

      try {
        // The server identifies the user from the bearer token; sending an id
        // in the body would be ignored (and was previously spoofable).
        await api.post('/reminders/track-visit');
      } catch (error) {
        // Silently fail - not critical if tracking fails
        console.debug('Activity tracking:', error);
      }
    };

    trackVisit();
  }, [user?.id]);
};

export default useTrackVisit;
