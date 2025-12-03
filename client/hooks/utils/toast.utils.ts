import * as React from "react";

import type { ToastActionElement } from "@/components/atoms/Toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 300;
const DEFAULT_DURATION = 5000;

export type ToastVariant = "default" | "success" | "error" | "warning" | "info" | "loading" | "notification" | "destructive";

export interface ToasterToast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: ToastVariant;
  duration?: number;
  showIcon?: boolean;
  showProgress?: boolean;
  timestamp?: Date;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  duration?: number;
  showIcon?: boolean;
  showProgress?: boolean;
  variant?: ToastVariant;
}

function createToast({ variant = "default", duration = DEFAULT_DURATION, showIcon = true, showProgress = true, ...props }: ToastOptions) {
  const id = genId();

  const update = (props: Partial<ToasterToast>) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
    
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      variant,
      duration,
      showIcon,
      showProgress,
      timestamp: new Date(),
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

function toast(options: ToastOptions) {
  return createToast(options);
}

toast.success = (options: Omit<ToastOptions, "variant"> | string) => {
  const opts = typeof options === "string" ? { title: options } : options;
  return createToast({ 
    ...opts, 
    variant: "success",
    duration: opts.duration ?? 4000,
  });
};

toast.error = (options: Omit<ToastOptions, "variant"> | string) => {
  const opts = typeof options === "string" ? { title: options } : options;
  return createToast({ 
    ...opts, 
    variant: "error",
    duration: opts.duration ?? 6000,
  });
};

toast.warning = (options: Omit<ToastOptions, "variant"> | string) => {
  const opts = typeof options === "string" ? { title: options } : options;
  return createToast({ 
    ...opts, 
    variant: "warning",
    duration: opts.duration ?? 5000,
  });
};

toast.info = (options: Omit<ToastOptions, "variant"> | string) => {
  const opts = typeof options === "string" ? { title: options } : options;
  return createToast({ 
    ...opts, 
    variant: "info",
    duration: opts.duration ?? 4000,
  });
};

toast.loading = (options: Omit<ToastOptions, "variant"> | string) => {
  const opts = typeof options === "string" ? { title: options } : options;
  return createToast({ 
    ...opts, 
    variant: "loading",
    duration: Infinity,
    showProgress: false,
  });
};

toast.notification = (options: Omit<ToastOptions, "variant"> | string) => {
  const opts = typeof options === "string" ? { title: options } : options;
  return createToast({ 
    ...opts, 
    variant: "notification",
    duration: opts.duration ?? 5000,
  });
};

toast.destructive = (options: Omit<ToastOptions, "variant"> | string) => {
  const opts = typeof options === "string" ? { title: options } : options;
  return createToast({ 
    ...opts, 
    variant: "destructive",
    duration: opts.duration ?? 6000,
  });
};

toast.promise = async <T,>(
  promise: Promise<T>,
  options: {
    loading: string | Omit<ToastOptions, "variant">;
    success: string | Omit<ToastOptions, "variant"> | ((data: T) => string | Omit<ToastOptions, "variant">);
    error: string | Omit<ToastOptions, "variant"> | ((err: unknown) => string | Omit<ToastOptions, "variant">);
  }
): Promise<T> => {
  const loadingOpts = typeof options.loading === "string" ? { title: options.loading } : options.loading;
  const { id, update, dismiss } = toast.loading(loadingOpts);

  try {
    const data = await promise;
    const successOpts = typeof options.success === "function" 
      ? options.success(data) 
      : options.success;
    const successProps = typeof successOpts === "string" ? { title: successOpts } : successOpts;
    
    update({
      ...successProps,
      variant: "success",
      duration: successProps.duration ?? 4000,
      showProgress: true,
    });

    setTimeout(() => dismiss(), successProps.duration ?? 4000);
    return data;
  } catch (err) {
    const errorOpts = typeof options.error === "function" 
      ? options.error(err) 
      : options.error;
    const errorProps = typeof errorOpts === "string" ? { title: errorOpts } : errorOpts;
    
    update({
      ...errorProps,
      variant: "error",
      duration: errorProps.duration ?? 6000,
      showProgress: true,
    });

    setTimeout(() => dismiss(), errorProps.duration ?? 6000);
    throw err;
  }
};

toast.dismiss = (toastId?: string) => {
  dispatch({ type: "DISMISS_TOAST", toastId });
};

toast.dismissAll = () => {
  dispatch({ type: "REMOVE_TOAST" });
};

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };
