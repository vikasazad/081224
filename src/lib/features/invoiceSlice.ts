import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  invoice: {} as any,
};

export const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    setInvoiceData: (state, action) => {
      const prevData = state.invoice;
      state.invoice = {
        ...prevData,
        [action.payload.invoice]: action.payload.data,
      };
    },

    removeInvoiceData: (state, action) => {
      const prevData = state.invoice;
      delete prevData[action.payload];
      state.invoice = prevData;
    },
  },
});

export const { setInvoiceData, removeInvoiceData } = invoiceSlice.actions;

export const getInvoiceData = (state: any, invoiceId: string) =>
  state.invoiceData.invoice[invoiceId] || null;

export default invoiceSlice.reducer;
