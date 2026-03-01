import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { addToast as addToastAction, removeToast } from "../redux/slices/toastSlice";

/**
 * Custom hook for toast notifications with auto-removal
 * @param {number} defaultDuration - Default duration in ms before toast auto-removes (default: 3000)
 */
export const useToast = (defaultDuration = 3000) => {
  const dispatch = useDispatch();

  const addToast = useCallback(
    (message, type = "info", duration = defaultDuration) => {
      const id = Date.now() + Math.random();
      
      dispatch(addToastAction({ 
        message, 
        type,
        id 
      }));

      // Auto-remove toast after duration
      if (duration > 0) {
        setTimeout(() => {
          dispatch(removeToast(id));
        }, duration);
      }

      return id;
    },
    [dispatch, defaultDuration]
  );

  return { addToast, removeToast: (id) => dispatch(removeToast(id)) };
};

export default useToast;
