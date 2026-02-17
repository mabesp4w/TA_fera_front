/** @format */

import toast from "react-hot-toast";

/**
 * Toast service - Wrapper for react-hot-toast
 * Provides convenient methods for showing toast notifications
 */
export const toastService = {
  /**
   * Show success toast
   * @param message - Success message to display
   */
  success: (message: string) => {
    toast.success(message);
  },

  /**
   * Show error toast
   * @param message - Error message to display
   */
  error: (message: string) => {
    toast.error(message);
  },

  /**
   * Show loading toast
   * @param message - Loading message to display
   * @returns Toast ID for updating/dismissing
   */
  loading: (message: string) => {
    return toast.loading(message);
  },

  /**
   * Show custom toast
   * @param message - Message to display
   * @param options - Toast options
   */
  custom: (message: string, options?: Parameters<typeof toast>[1]) => {
    toast(message, options);
  },

  /**
   * Dismiss toast by ID
   * @param toastId - Toast ID to dismiss
   */
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Remove toast instantly by ID
   * @param toastId - Toast ID to remove
   */
  remove: (toastId?: string) => {
    toast.remove(toastId);
  },

  /**
   * Promise toast - automatically updates based on promise state
   * @param promise - Promise to track
   * @param messages - Messages for loading, success, and error states
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },
};

export default toastService;

