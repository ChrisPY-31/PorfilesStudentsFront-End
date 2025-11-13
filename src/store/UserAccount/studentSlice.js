import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  students: [],
  idStudent:localStorage.getItem("idPerson") || null,
  studentById: {},
};

export const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    getStudents: (state, action) => {
      state.students = action.payload;
    },

    getIdStudent: (state, action) => {
      state.idStudent = action.payload
    },

    getStudentById: (state, action) => {
      state.studentById = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { getStudents , getStudentById , getIdStudent} = studentSlice.actions;

export default studentSlice.reducer;
