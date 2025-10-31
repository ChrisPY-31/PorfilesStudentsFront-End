import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  publications: [],
};

export const publicationSlice = createSlice({
  name: "userAccount",
  initialState,
  reducers: {
    getAllPublications: (state, action) => {
      state.publications = action.payload;
    },

  },
});

// Action creators are generated for each case reducer function
export const { getAllPublications} = publicationSlice.actions;

export default publicationSlice.reducer;
