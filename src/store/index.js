import { configureStore } from '@reduxjs/toolkit'
import { userAccountSlice } from './UserAccount/userAccountSlice'
import { usersApiSlice } from '../services/autenticateUser'
import { studentSlice} from './UserAccount/studentSlice'
import { publicationApi } from '../services/publication'
import { publicationSlice } from './UserAccount/publicationSlice'
import { userSlice } from '../services/UserSlice'
import { updatePersonApi } from '../services/updatePerson'
import { recomendationStudent } from '../services/recomentationStudent'
import { projectUserApi } from '../services/projectsUser'
export const store = configureStore({
  reducer: {
    users : userAccountSlice.reducer,
    students: studentSlice.reducer,
    publications: publicationSlice.reducer,
    [usersApiSlice.reducerPath]: usersApiSlice.reducer,
    [userSlice.reducerPath]: userSlice.reducer,
    [projectUserApi.reducerPath]: projectUserApi.reducer,
    [publicationApi.reducerPath]:publicationApi.reducer,
    [updatePersonApi.reducerPath]:updatePersonApi.reducer,
    [recomendationStudent.reducerPath]:recomendationStudent.reducer

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      usersApiSlice.middleware, 
      userSlice.middleware, 
      publicationApi.middleware,
      updatePersonApi.middleware,
      recomendationStudent.middleware,
      projectUserApi.middleware
    ),
})