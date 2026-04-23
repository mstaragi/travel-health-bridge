/**
 * usePhoneAuth — Phone authentication hook
 * Handles SMS OTP send/verify flow with Supabase
 * Per spec: 15-minute lockout on 3 OTP failures
 */
import { useState, useCallback } from 'react';
import { supabase } from '../api/supabase';

interface UsePhoneAuthResult {
  loading: boolean;
  error: string;
  successMessage: string;
  lockUntil: number | null;
  sendOTP: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (phone: string, otp: string) => Promise<{
    success: boolean;
    session?: any;
    error?: string;
  }>;
  canRetry: boolean;
  retryAfterSeconds: number;
}

const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const OTP_FAILURE_THRESHOLD = 3;

export function usePhoneAuth(): UsePhoneAuthResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const now = Date.now();
  const canRetry = !lockUntil || now > lockUntil;
  const retryAfterSeconds = lockUntil ? Math.ceil((lockUntil - now) / 1000) : 0;

  const sendOTP = useCallback(
    async (phone: string): Promise<{ success: boolean; error?: string }> => {
      if (!phone || phone.length < 10) {
        setError('Enter a valid 10-digit phone number');
        return { success: false, error: 'Invalid phone number' };
      }

      try {
        setLoading(true);
        setError('');
        setSuccessMessage('');

        // Format phone with India country code
        const phoneWithCode = `+91${phone.replace(/\D/g, '').slice(-10)}`;

        const { error: err } = await supabase.auth.signInWithOtp({
          phone: phoneWithCode,
        });

        if (err) {
          setError(err.message || 'Failed to send OTP');
          return { success: false, error: err.message };
        }

        setSuccessMessage(`OTP sent to ${phoneWithCode}`);
        setFailedAttempts(0); // reset on successful send
        return { success: true };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An error occurred while sending OTP';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const verifyOTP = useCallback(
    async (
      phone: string,
      otp: string
    ): Promise<{ success: boolean; session?: any; error?: string }> => {
      if (otp.length !== 6) {
        setError('Enter the 6-digit code');
        return { success: false, error: 'Invalid OTP length' };
      }

      // Check lockout
      if (!canRetry) {
        const message = `Too many attempts. Try again in ${retryAfterSeconds} seconds.`;
        setError(message);
        return { success: false, error: message };
      }

      try {
        setLoading(true);
        setError('');

        // Format phone with India country code
        const phoneWithCode = `+91${phone.replace(/\D/g, '').slice(-10)}`;

        const { data, error: err } = await supabase.auth.verifyOtp({
          phone: phoneWithCode,
          token: otp,
          type: 'sms',
        });

        if (err) {
          setFailedAttempts((prev) => {
            const newAttempts = prev + 1;
            if (newAttempts >= OTP_FAILURE_THRESHOLD) {
              setLockUntil(Date.now() + LOCKOUT_DURATION_MS);
              setError(
                `Too many failed attempts. Locked for 15 minutes. Try again later.`
              );
            } else {
              setError(
                `Invalid OTP. ${OTP_FAILURE_THRESHOLD - newAttempts} attempt(s) remaining.`
              );
            }
            return newAttempts;
          });
          return { success: false, error: err.message };
        }

        // Success
        setFailedAttempts(0);
        setLockUntil(null);
        setSuccessMessage('Verified successfully!');
        return { success: true, session: data.session };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Verification failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [canRetry, retryAfterSeconds]
  );

  return {
    loading,
    error,
    successMessage,
    lockUntil,
    sendOTP,
    verifyOTP,
    canRetry,
    retryAfterSeconds,
  };
}
