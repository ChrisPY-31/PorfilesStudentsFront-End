import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";

export const userSlice = createApi({
  reducerPath: "userSlice",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  tagTypes: ["Users", "CuentasAdmin", "Carreras"],
  endpoints: (builder) => ({
    getTeachers: builder.query({
      query: () => ({
        url: "/teachers",
      }),
    }),
    // Solo ADMIN: [{ id (de la cuenta), username, email, enabled, accountNonLocked, roles: ["STUDENT"] }]
    getUsersAdmin: builder.query({
      query: ({ token }) => ({
        url: "/users",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["CuentasAdmin"],
    }),
    // Bloquear/desbloquear (toggle). El back pide el id de la PERSONA y /users solo trae
    // el de la cuenta, asi que primero se busca la persona por username.
    toggleBloqueoCuenta: builder.mutation({
      async queryFn({ username, token }, _api, _extra, baseQuery) {
        const headers = { Authorization: `Bearer ${token}` };
        const cuenta = await baseQuery({ url: `/userAccount/${username}`, headers });
        if (cuenta.error) return { error: cuenta.error };
        const idPersona = cuenta.data?.object?.id;
        if (!idPersona) {
          return { error: { status: 404, data: { mensaje: "Esta cuenta no tiene un perfil asociado" } } };
        }
        return baseQuery({ url: `/users/${idPersona}/blocked`, method: "POST", headers });
      },
      // Solo recarga la lista si el cambio se aplico
      invalidatesTags: (_res, error) => (error ? [] : ["CuentasAdmin"]),
    }),
    // Dashboard: todos los estudiantes para contarlos por carrera (respuesta paginada de Spring)
    getEstudiantesResumen: builder.query({
      query: ({ token }) => ({
        url: "/students",
        params: { page: 0, size: 1000 },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      transformResponse: (respuesta) => ({
        estudiantes: respuesta?.content ?? [],
        total: respuesta?.totalElements ?? respuesta?.content?.length ?? 0,
      }),
      // Cada alumno trae el nombre de su carrera: recargar si se renombra una
      providesTags: ["Carreras"],
    }),
    getUserById: builder.query({
      query: ({ id, token }) => ({
        url: `/person/${id}`,
        headers: {
          Authorization: `Bearer ${token}`, // Solo el token, sin "Bearer"
        },
      }),
    }),
    getAccountUserByUsername: builder.query({
      query: ({ username, token }) => ({
        url: `/userAccount/${username}`,
        headers: {
          Authorization: `Bearer ${token}`, // Solo el token, sin "Bearer"
        },
      }),
    }),

    getCareers: builder.query({
      query: ({ token }) => ({
        url: "/career",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["Carreras"],
    }),
    // Catalogo de carreras (solo ADMIN). Body: { idCarrera?, carrera }
    createCareer: builder.mutation({
      query: ({ carrera, token }) => ({
        url: "/career",
        method: "POST",
        body: { carrera },
        headers: { Authorization: `Bearer ${token}` },
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["Carreras"]),
    }),
    updateCareer: builder.mutation({
      query: ({ idCarrera, carrera, token }) => ({
        url: "/career",
        method: "PATCH",
        body: { idCarrera, carrera },
        headers: { Authorization: `Bearer ${token}` },
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["Carreras"]),
    }),
    // OJO: el back no valida si la carrera tiene alumnos; el front lo impide antes
    deleteCareer: builder.mutation({
      query: ({ idCarrera, token }) => ({
        url: `/career/${idCarrera}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["Carreras"]),
    }),
    getUbications: builder.query({
      query: ({ token }) => ({
        url: "/ubication",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    getContactTypes: builder.query({
      query: ({ token }) => ({
        url: "/contact",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    // Educacion: institucion, grado, educacionTipo y fechaInicio son obligatorios
    createEducationUser: builder.mutation({
      query: ({ educacion, token }) => ({
        url: "/education",
        method: "POST",
        body: educacion,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    updateEducationUser: builder.mutation({
      query: ({ educacion, token }) => ({
        url: `/education/${educacion.idEducacion}`,
        method: "PUT",
        body: educacion,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    deleteEducationUser: builder.mutation({
      query: ({ idEducacion, token }) => ({
        url: `/education/${idEducacion}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    createSocialLink: builder.mutation({
      query: ({ newSocialLink, token }) => ({
        url: "/personContact",
        method: "POST",
        body: newSocialLink,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        providesTags: ["userById"],
      }),
    }),
    deleteSocialLink: builder.mutation({
      query: ({ idContact, token }) => ({
        url: `/personContact/${idContact}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    // Catalogo de tecnologias + aptitudes: [{ id, nombre, tipo: "TECNOLOGIA" | "APTITUD" }]
    getSkillsCatalog: builder.query({
      query: ({ token }) => ({
        url: "/skills/catalog",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    // Reemplaza todas las habilidades del usuario autenticado: { tecnologias: [ids], aptitudes: [ids] }
    updateMySkills: builder.mutation({
      query: ({ skills, token }) => ({
        url: "/person/skills",
        method: "PUT",
        body: skills,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    // Idiomas del usuario autenticado; el dueno se resuelve por JWT
    createLanguages: builder.mutation({
      query: ({ idiomas, token }) => ({
        url: "/language",
        method: "POST",
        body: idiomas,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    updateLanguage: builder.mutation({
      query: ({ idioma, token }) => ({
        url: `/language/${idioma.idIdioma}`,
        method: "PUT",
        body: idioma,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    deleteLanguage: builder.mutation({
      query: ({ idIdioma, token }) => ({
        url: `/language/${idIdioma}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    changePasswordUser: builder.mutation({
      query: ({ currentPassword, newPassword, token }) => ({
        url: "/users/password",
        method: "PUT",
        body: { currentPassword, newPassword },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    resetPasswordUser: builder.mutation({
      query: ({ username, newPassword, token }) => ({
        url: `/users/${username}/password/reset`,
        method: "PUT",
        body: { newPassword },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetUsersAdminQuery,
  useGetEstudiantesResumenQuery,
  useGetUserByIdQuery,
  useGetCareersQuery,
  useCreateCareerMutation,
  useUpdateCareerMutation,
  useDeleteCareerMutation,
  useGetUbicationsQuery,
  useGetContactTypesQuery,
  useGetAccountUserByUsernameQuery,
  useCreateEducationUserMutation,
  useCreateSocialLinkMutation,
  useDeleteSocialLinkMutation,
  useUpdateEducationUserMutation,
  useDeleteEducationUserMutation,
  useGetSkillsCatalogQuery,
  useUpdateMySkillsMutation,
  useCreateLanguagesMutation,
  useUpdateLanguageMutation,
  useDeleteLanguageMutation,
  useChangePasswordUserMutation,
  useResetPasswordUserMutation,
  useToggleBloqueoCuentaMutation,
} = userSlice;
