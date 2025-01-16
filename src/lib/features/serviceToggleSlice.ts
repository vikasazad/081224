import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categoryFlag: false, // Add activeItem to the state
};

export const serviceToggle = createSlice({
  name: "serviceToggle",
  initialState,
  reducers: {
    toggleService: (state, action) => {
      state.categoryFlag = action.payload;
    },
  },
});

export const { toggleService } = serviceToggle.actions;
export default serviceToggle.reducer;
