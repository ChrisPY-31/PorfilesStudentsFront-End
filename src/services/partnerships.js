import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";
import { companyApi } from "./company";

// Convenios con empresas (solo ADMIN). CorporatePartnershipsUAEMexDto:
// { idCorporacion, nombreEmpresa (obligatorio), categoria, tipoAcuerdo, fechaInicio (obligatoria, yyyy-MM-dd),
//   fechaFinal (null = sin fecha de termino), activo, vigente }
// activo y vigente son de solo lectura; vigente = activo, ya iniciado y sin vencer.
// Los GET regresan el convenio directo; POST, PUT y PATCH dentro de { mensaje, object }.
const auth = (token) => ({ Authorization: `Bearer ${token}` });

// Un convenio cambia lo que se ve en /companies y /Empresa/:id (columna de Inicio, paginas de empresa)
const refrescarEmpresas = async (_arg, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(companyApi.util.invalidateTags(["Empresas"]));
  } catch {
    // El error lo muestra quien llamo la mutacion
  }
};

export const partnershipsApi = createApi({
  reducerPath: "partnershipsApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  tagTypes: ["Convenios"],
  endpoints: (builder) => ({
    // Sin vigente regresa todos; vigente=true solo vigentes, false el resto
    getPartnerships: builder.query({
      query: ({ token, vigente }) => ({
        url: "/partnerships",
        params: vigente === undefined ? undefined : { vigente },
        headers: auth(token),
      }),
      providesTags: (res) => [
        "Convenios",
        ...(Array.isArray(res) ? res.map((c) => ({ type: "Convenios", id: c.idCorporacion })) : []),
      ],
    }),
    // 404 si no existe
    getPartnership: builder.query({
      query: ({ id, token }) => ({ url: `/partnerships/${id}`, headers: auth(token) }),
      providesTags: (_res, _err, { id }) => [{ type: "Convenios", id }],
    }),
    // 400: datos invalidos, nombre repetido (sin importar mayusculas) o fechaFinal antes de fechaInicio
    createPartnership: builder.mutation({
      query: ({ convenio, token }) => ({
        url: "/partnerships",
        method: "POST",
        body: convenio,
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["Convenios"]),
      onQueryStarted: refrescarEmpresas,
    }),
    // Reemplaza nombre, categoria, tipo de acuerdo y fechas (no el estado)
    updatePartnership: builder.mutation({
      query: ({ id, convenio, token }) => ({
        url: `/partnerships/${id}`,
        method: "PUT",
        body: convenio,
        headers: auth(token),
      }),
      invalidatesTags: (_res, error, { id }) => (error ? [] : ["Convenios", { type: "Convenios", id }]),
      onQueryStarted: refrescarEmpresas,
    }),
    // Baja logica. Al reactivar no se revisan fechas: si ya vencio sigue sin estar vigente
    changePartnershipStatus: builder.mutation({
      query: ({ id, activo, token }) => ({
        url: `/partnerships/${id}/status`,
        method: "PATCH",
        params: { activo },
        headers: auth(token),
      }),
      invalidatesTags: (_res, error, { id }) => (error ? [] : ["Convenios", { type: "Convenios", id }]),
      onQueryStarted: refrescarEmpresas,
    }),
  }),
});

export const {
  useGetPartnershipsQuery,
  useGetPartnershipQuery,
  useCreatePartnershipMutation,
  useUpdatePartnershipMutation,
  useChangePartnershipStatusMutation,
} = partnershipsApi;
