import { toast as sonnerToast, ExternalToast } from "sonner";

const defaultOptions: ExternalToast = {
  duration: 4000,
  closeButton: true,
  style: {
    background: "oklch(0.08 0.02 220)",
    border: "1px solid oklch(0.14 0.03 220)",
    color: "oklch(0.92 0.02 210)",
    fontFamily: "var(--font-body)",
    fontSize: "12px",
  },
};

export const success = (message: string, options?: ExternalToast) =>
  sonnerToast.success(message, {
    ...defaultOptions,
    style: {
      ...defaultOptions.style,
      border: "1px solid oklch(0.82 0.18 155 / 0.35)",
      color: "oklch(0.82 0.18 155)",
      ...options?.style,
    },
    ...options,
  });

export const error = (message: string, options?: ExternalToast) =>
  sonnerToast.error(message, {
    ...defaultOptions,
    duration: 6000,
    style: {
      ...defaultOptions.style,
      border: "1px solid oklch(0.65 0.22 25 / 0.4)",
      color: "oklch(0.65 0.22 25)",
      ...options?.style,
    },
    ...options,
  });

export const warning = (message: string, options?: ExternalToast) =>
  sonnerToast.warning(message, {
    ...defaultOptions,
    duration: 5000,
    style: {
      ...defaultOptions.style,
      border: "1px solid oklch(0.80 0.18 80 / 0.35)",
      color: "oklch(0.80 0.18 80)",
      ...options?.style,
    },
    ...options,
  });

export const info = (message: string, options?: ExternalToast) =>
  sonnerToast.info(message, {
    ...defaultOptions,
    duration: 3000,
    ...options,
  });

export const loading = (message: string, options?: ExternalToast) =>
  sonnerToast.loading(message, {
    ...defaultOptions,
    duration: Infinity,
    ...options,
  });

export const promise = <T>(
  p: Promise<T>,
  messages: {
    loading: string;
    success: string | ((result: T) => string);
    error: string | ((error: any) => string);
  },
  options?: ExternalToast
) =>
  sonnerToast.promise(p, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    ...defaultOptions,
    ...options,
  });

export const userRejected = (message: string) =>
  sonnerToast.info(message, {
    duration: 2000,
    closeButton: false,
    style: {
      ...defaultOptions.style,
      color: "oklch(0.45 0.03 210)",
    },
  });

export { sonnerToast as toast };

export default {
  success,
  error,
  warning,
  info,
  loading,
  promise,
  userRejected,
  toast: sonnerToast,
};