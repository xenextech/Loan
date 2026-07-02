export const creditScoreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCreditScore: builder.query<number, void>({