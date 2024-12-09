import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  addToOrderData: "aaaaaa", // Change this to an array of objects with 'name', 'price', and 'count'
};

export const addToOrder = createSlice({
  name: "addToCart",
  initialState,
  reducers: {
    addData: (state, action) => {
      console.log(action.payload);
      state.addToOrderData = action.payload;
    },
  },
});

export const { addData } = addToOrder.actions;
export default addToOrder.reducer;
