import { useState, useCallback } from 'react';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'success',
    duration: 3000,
  });

  const showToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success',
    duration: number = 3000
  ) => {
    setToast({
      visible: true,
      message,
      type,
      duration,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
