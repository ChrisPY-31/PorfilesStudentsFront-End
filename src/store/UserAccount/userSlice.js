import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  students: [],
  userId: 0,
  user: {},
  userToken: "",
};

export const userAccountSlice = createSlice({
  name: "userAccount",
  initialState,
  reducers: {
    getStudents: (state, action) => {
      state.students = action.payload;
    },

    getUserId: (state, action) => {
      state.userId = action.payload;
    },

    getUserDetails: (state, action) => {
      state.user = action.payload;
    },
    getUserToken: (state, action) => {
      state.userToken = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { getUserDetails, getUserToken, getStudents , getUserId} =
  userAccountSlice.actions;

export default userAccountSlice.reducer;
