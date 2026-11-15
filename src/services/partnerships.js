import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_KEY } from "../api/api";
import { companyApi } from "./company";
import { userSlice } from "./UserSlice";
import { POR_PAGINA, limpiarParams } from "../helpers/paginacion";

// Convenios con empresas (solo ADMIN). CorporatePartnershipsUAEMexDto:
// { idCorporacion, nombreEmpresa (obligatorio), categoria, tipoAcuerdo, fechaInicio (obligatoria, yyyy-MM-dd),
//   fechaFinal (null = sin fecha de termino), activo, vigente, logo }
// activo, vigente y logo son de solo lectura; vigente = activo, ya iniciado y sin vencer.
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

// Cuentas de empresa y reclutadores tambien salen en Usuarios (GET /users, otra API)
const refrescarUsuarios = async (_arg, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(userSlice.util.invalidateTags(["CuentasAdmin"]));
  } catch {
    // El error lo muestra quien llamo la mutacion
  }
};

export const partnershipsApi = createApi({
  reducerPath: "partnershipsApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_KEY}` }),
  tagTypes: ["Convenios", "CuentasEmpresa", "ReclutadoresConvenio"],
  endpoints: (builder) => ({
    // Paginado, por nombre. Sin vigente regresa todos; vigente=true solo vigentes, false el resto.
    // q busca en empresa, categoria o tipo de acuerdo
    getPartnerships: builder.query({
      query: ({ token, vigente, q, page = 0, size = POR_PAGINA }) => ({
        url: "/partnerships",
        params: limpiarParams({ page, size, vigente, q: q?.trim() }),
        headers: auth(token),
      }),
      providesTags: (res) => [
        "Convenios",
        ...(res?.content ?? []).map((c) => ({ type: "Convenios", id: c.idCorporacion })),
      ],
    }),
    // { total, vigentes, noVigentes, vencenPronto, categorias: [], tiposAcuerdo: [] }
    getPartnershipsSummary: builder.query({
      query: ({ token, dias }) => ({ url: "/partnerships/summary", params: limpiarParams({ dias }), headers: auth(token) }),
      providesTags: ["Convenios"],
    }),
    // Selector: [{ idCorporacion, nombreEmpresa }] de convenios activos; sinCuenta (por defecto) = sin cuenta de empresa activa
    getPartnershipOptions: builder.query({
      query: ({ token, sinCuenta = true }) => ({ url: "/partnerships/options", params: { sinCuenta }, headers: auth(token) }),
      providesTags: ["Convenios", "CuentasEmpresa"],
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
      // Activar un reclutador depende del estado del convenio: se refrescan tambien sus cuentas
      invalidatesTags: (_res, error, { id }) => (error ? [] : ["Convenios", { type: "Convenios", id }, "CuentasEmpresa", "ReclutadoresConvenio"]),
      onQueryStarted: refrescarEmpresas,
    }),

    // --- Cuenta de empresa (COMPANY_ADMIN) de cada convenio ---
    // CompanyAdminDto: { id (persona), nombre, apellido, puesto, username, email, cuentaActiva, idCorporacion,
    //   empresa: convenio, ... }. Un convenio tiene a lo mas UNA cuenta activa; las desactivadas quedan como historial
    // Paginado, de la mas reciente a la mas antigua. Filtros opcionales: idCorporacion, activa y q
    getCompanyAdmins: builder.query({
      query: ({ token, idCorporacion, activa, q, page = 0, size = POR_PAGINA }) => ({
        url: "/company-admins",
        params: limpiarParams({ page, size, idCorporacion, activa, q: q?.trim() }),
        headers: auth(token),
      }),
      providesTags: ["CuentasEmpresa"],
    }),
    // { username, email, nombre, apellido, puesto }. La contrasena la genera el back y SOLO se manda por correo:
    // si el correo falla la cuenta no se crea. 400: convenio desactivado, ya tiene cuenta activa, username/correo en uso
    createCompanyAdmin: builder.mutation({
      query: ({ idCorporacion, cuenta, token }) => ({
        url: `/partnerships/${idCorporacion}/company-admin`,
        method: "POST",
        body: cuenta,
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["CuentasEmpresa"]),
      onQueryStarted: refrescarUsuarios,
    }),
    // 400 al reactivar si el convenio ya tiene otra cuenta activa. Un token ya emitido sigue valido hasta 30 min
    changeCompanyAdminStatus: builder.mutation({
      query: ({ id, activo, token }) => ({
        url: `/company-admins/${id}/status`,
        method: "PATCH",
        params: { activo },
        headers: auth(token),
      }),
      invalidatesTags: (_res, error) => (error ? [] : ["CuentasEmpresa"]),
      onQueryStarted: refrescarUsuarios,
    }),

    // --- Reclutadores de un convenio (los crea la cuenta de empresa; el admin solo los ve y bloquea) ---
    // RecruiterAccountDto: { id, idCorporacion, username, email, nombre, apellido, puesto, cuentaActiva }
    // Paginado: primero los activos y luego por nombre. Filtros opcionales: activo y q
    getPartnershipRecruiters: builder.query({
      query: ({ idCorporacion, token, activo, q, page = 0, size = POR_PAGINA }) => ({
        url: `/partnerships/${idCorporacion}/recruiters`,
        params: limpiarParams({ page, size, activo, q: q?.trim() }),
        headers: auth(token),
      }),
      providesTags: (_res, _err, { idCorporacion }) => [{ type: "ReclutadoresConvenio", id: idCorporacion }],
    }),
    // 400 al activar si el convenio esta desactivado. La cuenta de empresa tambien puede reactivarlo
    changeRecruiterStatusAdmin: builder.mutation({
      query: ({ id, activo, token }) => ({
        url: `/recruiters/${id}/status`,
        method: "PATCH",
        params: { activo },
        headers: auth(token),
      }),
      invalidatesTags: (_res, error, { idCorporacion }) => (error ? [] : [{ type: "ReclutadoresConvenio", id: idCorporacion }]),
      onQueryStarted: refrescarUsuarios,
    }),
  }),
});

export const {
  useGetPartnershipsQuery,
  useGetPartnershipQuery,
  useGetPartnershipsSummaryQuery,
  useGetPartnershipOptionsQuery,
  useCreatePartnershipMutation,
  useUpdatePartnershipMutation,
  useChangePartnershipStatusMutation,
  useGetCompanyAdminsQuery,
  useCreateCompanyAdminMutation,
  useChangeCompanyAdminStatusMutation,
  useGetPartnershipRecruitersQuery,
  useChangeRecruiterStatusAdminMutation,
} = partnershipsApi;
