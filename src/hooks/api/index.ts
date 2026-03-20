import axiosInstance from "@/api/axios";
import {
    useMutation,
    useQuery,
    type UseMutationOptions,
    type UseQueryOptions,
} from "@tanstack/react-query";

export interface ApiError {
    message: string;
    status?: number;
    errors?: Record<string, string[]>;
}

export interface ApiResponse<T = unknown> {
    success?: boolean;
    message?: string;
    data?: T;
    error?: ApiError;
    show_toast?: boolean;
}

type UrlOrFactory<TParams> = string | ((params?: TParams) => string);

const resolveUrl = <TParams>(url: UrlOrFactory<TParams>, params?: TParams) =>
    typeof url === "function" ? url(params) : url;

// ─── GET ────────────────────────────────────────────────────────────────────

export const useGetApi = <TData, TParams extends Record<string, any> = {}>(
    url: UrlOrFactory<TParams>,
    params?: TParams,
    options?: Omit<UseQueryOptions<ApiResponse<TData>>, "queryKey" | "queryFn"> & {
        queryKey?: string;
    }
) => {
    const { queryKey, ...restOptions } = options ?? {};
    return useQuery<ApiResponse<TData>>({
        queryKey: queryKey ? [queryKey, params] : [resolveUrl(url, params), params],
        queryFn: async () => {
            const { data } = await axiosInstance.get<ApiResponse<TData>>(
                resolveUrl(url, params),
                { params }
            );
            return data;
        },
        ...restOptions,
    });
};

// ─── POST ───────────────────────────────────────────────────────────────────

export const usePostApi = <TData, TBody = unknown>(
    url: string,
    options?: UseMutationOptions<ApiResponse<TData>, ApiError, TBody>
) => {
    return useMutation<ApiResponse<TData>, ApiError, TBody>({
        mutationFn: async (body) => {
            const { data } = await axiosInstance.post<ApiResponse<TData>>(url, body);
            return data;
        },
        ...options,
    });
};

// ─── PUT ────────────────────────────────────────────────────────────────────

type WithOptionalId<TBody> = { id?: string | number; body: TBody };

export const usePutApi = <TData, TBody = unknown>(
    url: string,
    options?: UseMutationOptions<ApiResponse<TData>, ApiError, WithOptionalId<TBody>>
) => {
    return useMutation<ApiResponse<TData>, ApiError, WithOptionalId<TBody>>({
        mutationFn: async ({ id, body }) => {
            const endpoint = id !== undefined ? `${url}/${id}` : url;
            const { data } = await axiosInstance.put<ApiResponse<TData>>(endpoint, body);
            return data;
        },
        ...options,
    });
};

// ─── PATCH ──────────────────────────────────────────────────────────────────

export const usePatchApi = <TData, TBody = unknown>(
    url: string,
    options?: UseMutationOptions<ApiResponse<TData>, ApiError, WithOptionalId<TBody>>
) => {
    return useMutation<ApiResponse<TData>, ApiError, WithOptionalId<TBody>>({
        mutationFn: async ({ id, body }) => {
            const endpoint = id !== undefined ? `${url}/${id}` : url;
            const { data } = await axiosInstance.patch<ApiResponse<TData>>(endpoint, body);
            return data;
        },
        ...options,
    });
};

// ─── DELETE ─────────────────────────────────────────────────────────────────

type DeleteVars<TId> = { id: TId; body?: unknown } | TId;

export const useDeleteApi = <TData, TId extends string | number = string | number>(
    url: string,
    options?: UseMutationOptions<ApiResponse<TData>, ApiError, DeleteVars<TId>>
) => {
    return useMutation<ApiResponse<TData>, ApiError, DeleteVars<TId>>({
        mutationFn: async (vars) => {
            const id = typeof vars === "object" && "id" in vars ? vars.id : vars;
            const body = typeof vars === "object" && "id" in vars ? vars.body : undefined;
            const { data } = await axiosInstance.delete<ApiResponse<TData>>(
                `${url}/${id}`,
                { data: body }
            );
            return data;
        },
        ...options,
    });
};