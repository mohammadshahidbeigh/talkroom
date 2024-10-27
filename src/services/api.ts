// client/src/services/api.ts
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

interface Item {
  id: string;
  name: string;
  // Add other properties as needed
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({baseUrl: "/api"}),
  endpoints: (builder) => ({
    getItems: builder.query<Item[], void>({
      query: () => "items",
    }),
    addItem: builder.mutation<Item, Partial<Item>>({
      query: (body) => ({
        url: "items",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {useGetItemsQuery, useAddItemMutation} = api;
