import { create } from 'zustand';

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
  showNotification: (message: string, severity: 'success' | 'error') => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  open: false,
  message: '',
  severity: 'success',
  showNotification: (message: string, severity: 'success' | 'error') =>
    set({ open: true, message, severity }),
  hideNotification: () => set({ open: false }),
})); 