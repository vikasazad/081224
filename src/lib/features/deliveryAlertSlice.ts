import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  deliveryAlert: {
    name: "",
    contact: "",
  },
};

export const deliveryAlert = createSlice({
  name: "deliveryAlert",
  initialState,
  reducers: {
    setDeliveryAlertData: (
      state,
      action: PayloadAction<{ name: string; contact: string }>
    ) => {
      console.log("setDeliveryAlertData", action.payload);
      state.deliveryAlert = action.payload;
    },
  },
});

export const { setDeliveryAlertData } = deliveryAlert.actions;
export default deliveryAlert.reducer;
