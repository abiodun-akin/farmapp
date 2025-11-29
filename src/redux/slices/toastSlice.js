import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  toasts: [],
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    addToast: (state, action) => {
      const { message, type = "info", duration = 3000 } = action.payload;
      const id = Date.now();
      state.toasts.push({ id, message, type });
      
      if (duration) {
        setTimeout(() => {
          state.toasts = state.toasts.filter((t) => t.id !== id);
        }, duration);
      }
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
