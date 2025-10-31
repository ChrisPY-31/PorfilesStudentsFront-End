import { configureStore } from '@reduxjs/toolkit'
import { userAccountSlice } from './UserAccount/userSlice'
import { usersApiSlice } from '../services/autenticateUser'
import { userSlice } from '../services/UserSlice'
import { publicationApi } from '../services/publication'
import { publicationSlice } from './UserAccount/publicationSlice'
export const store = configureStore({
  reducer: {
    users : userAccountSlice.reducer,
    publications: publicationSlice.reducer,
    [usersApiSlice.reducerPath]: usersApiSlice.reducer,
    [userSlice.reducerPath]: userSlice.reducer,
    [publicationApi.reducerPath]:publicationApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      usersApiSlice.middleware, 
      userSlice.middleware, 
      publicationApi.middleware
    ),
})