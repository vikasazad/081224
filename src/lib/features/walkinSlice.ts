import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  room: {}, // Change this to an array of objects with 'name', 'price', and 'count'
  gstTax: {},
};

export const addToOrder = createSlice({
  name: "addToCart",
  initialState,
  reducers: {
    addRoom: (state, action) => {
      //   console.log(action.payload);
      state.room = action.payload;
    },
    addGstTax: (state, action) => {
      state.gstTax = action.payload;
    },
  },
});

export const { addRoom, addGstTax } = addToOrder.actions;
export default addToOrder.reducer;
