import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  room: {}, // Change this to an array of objects with 'name', 'price', and 'count'
};

export const addToOrder = createSlice({
  name: "addToCart",
  initialState,
  reducers: {
    addRoom: (state, action) => {
      //   console.log(action.payload);
      state.room = action.payload;
    },
  },
});

export const { addRoom } = addToOrder.actions;
export default addToOrder.reducer;
