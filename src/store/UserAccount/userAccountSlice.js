import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tipo: "",
  userId: 0,
  user: {},
  userToken: localStorage.getItem("token") || "",
  username: localStorage.getItem("username") || "",
};

export const userAccountSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    getUserId: (state, action) => {
      state.userId = action.payload;
    },

    getUserDetails: (state, action) => {
      state.tipo = action.payload.tipo;
      state.userId = action.payload.id;
      state.user = action.payload;
    },
    getUserToken: (state, action) => {
      state.userToken = action.payload;
    },
    getUserName: (state, action) => {
      state.username = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  getUserToken,
  getUserId,
  getMyUserAccount,
  getUserDetails,
  getUserName,
} = userAccountSlice.actions;

export default userAccountSlice.reducer;
