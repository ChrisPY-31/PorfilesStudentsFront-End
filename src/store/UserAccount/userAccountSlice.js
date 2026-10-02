import { createSlice } from "@reduxjs/toolkit";

// Funcion: se vuelve a leer localStorage cada vez que el slice se reinicia
const initialState = () => ({
  tipo: "",
  userId: 0,
  user: {},
  userToken: localStorage.getItem("token") || "",
  username: localStorage.getItem("username") || "",
});

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
    // El perfil no se pudo cargar: no dejar el de una sesion anterior
    limpiarPerfil: (state) => {
      state.tipo = "";
      state.userId = 0;
      state.user = {};
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
  limpiarPerfil,
} = userAccountSlice.actions;

export default userAccountSlice.reducer;
