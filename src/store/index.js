import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { userAccountSlice } from './UserAccount/userAccountSlice'
import { usersApiSlice } from '../services/autenticateUser'
import { studentSlice} from './UserAccount/studentSlice'
import { publicationApi } from '../services/publication'
import { publicationSlice } from './UserAccount/publicationSlice'
import { userSlice } from '../services/UserSlice'
import { updatePersonApi } from '../services/updatePerson'
import { recomendationStudent } from '../services/recomentationStudent'
import { projectUserApi } from '../services/projectsUser'
import { notificationsApi } from '../services/notifications'
import { reiniciarSesion } from './sesion'

const appReducer = combineReducers({
    users : userAccountSlice.reducer,
    students: studentSlice.reducer,
    publications: publicationSlice.reducer,
    [usersApiSlice.reducerPath]: usersApiSlice.reducer,
    [userSlice.reducerPath]: userSlice.reducer,
    [projectUserApi.reducerPath]: projectUserApi.reducer,
    [publicationApi.reducerPath]:publicationApi.reducer,
    [updatePersonApi.reducerPath]:updatePersonApi.reducer,
    [recomendationStudent.reducerPath]:recomendationStudent.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer
})

// Al cambiar de sesion todo regresa a su estado inicial (ver store/sesion.js)
const rootReducer = (state, action) =>
  appReducer(reiniciarSesion.match(action) ? undefined : state, action)

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      usersApiSlice.middleware, 
      userSlice.middleware, 
      publicationApi.middleware,
      updatePersonApi.middleware,
      recomendationStudent.middleware,
      projectUserApi.middleware,
      notificationsApi.middleware
    ),
})