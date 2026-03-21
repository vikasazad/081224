import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  checkInData: {},
};

export const checkInSlice = createSlice({
  name: "checkIn",
  initialState,
  reducers: {
    setCheckInData: (state, action) => {
      const prevData = state.checkInData;
      state.checkInData = {
        ...prevData,
        [action.payload.bookingId]: action.payload,
      };
    },
  },
});

export const { setCheckInData } = checkInSlice.actions;

export const getCheckInData = (state: any, bookingId: string) =>
  state.checkInData.checkInData[bookingId.replaceAll("%3A", ":")] || null;
export default checkInSlice.reducer;
