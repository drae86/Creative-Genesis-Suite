import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ActivityItem, Collection, CollectionInput, CollectionItem, CollectionItemInput, CollectionUpdate, CollectionWithGenerations, DashboardStats, Generation, GenerationInput, GenerationUpdate, GetDashboardActivityParams, GetPublicGalleryParams, GlassRoomEntry, GlassRoomInput, HealthStatus, ListGenerationsParams, ListGlassRoomParams, ListRecentGenerationsParams, VariationInput } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListGenerationsUrl: (params?: ListGenerationsParams) => string;
/**
 * @summary List all generations
 */
export declare const listGenerations: (params?: ListGenerationsParams, options?: RequestInit) => Promise<Generation[]>;
export declare const getListGenerationsQueryKey: (params?: ListGenerationsParams) => readonly ["/api/generations", ...ListGenerationsParams[]];
export declare const getListGenerationsQueryOptions: <TData = Awaited<ReturnType<typeof listGenerations>>, TError = ErrorType<unknown>>(params?: ListGenerationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGenerations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listGenerations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListGenerationsQueryResult = NonNullable<Awaited<ReturnType<typeof listGenerations>>>;
export type ListGenerationsQueryError = ErrorType<unknown>;
/**
 * @summary List all generations
 */
export declare function useListGenerations<TData = Awaited<ReturnType<typeof listGenerations>>, TError = ErrorType<unknown>>(params?: ListGenerationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGenerations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateGenerationUrl: () => string;
/**
 * @summary Create a new AI generation
 */
export declare const createGeneration: (generationInput: GenerationInput, options?: RequestInit) => Promise<Generation>;
export declare const getCreateGenerationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGeneration>>, TError, {
        data: BodyType<GenerationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createGeneration>>, TError, {
    data: BodyType<GenerationInput>;
}, TContext>;
export type CreateGenerationMutationResult = NonNullable<Awaited<ReturnType<typeof createGeneration>>>;
export type CreateGenerationMutationBody = BodyType<GenerationInput>;
export type CreateGenerationMutationError = ErrorType<unknown>;
/**
* @summary Create a new AI generation
*/
export declare const useCreateGeneration: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGeneration>>, TError, {
        data: BodyType<GenerationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createGeneration>>, TError, {
    data: BodyType<GenerationInput>;
}, TContext>;
export declare const getListRecentGenerationsUrl: (params?: ListRecentGenerationsParams) => string;
/**
 * @summary Get most recent generations
 */
export declare const listRecentGenerations: (params?: ListRecentGenerationsParams, options?: RequestInit) => Promise<Generation[]>;
export declare const getListRecentGenerationsQueryKey: (params?: ListRecentGenerationsParams) => readonly ["/api/generations/recent", ...ListRecentGenerationsParams[]];
export declare const getListRecentGenerationsQueryOptions: <TData = Awaited<ReturnType<typeof listRecentGenerations>>, TError = ErrorType<unknown>>(params?: ListRecentGenerationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRecentGenerations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listRecentGenerations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListRecentGenerationsQueryResult = NonNullable<Awaited<ReturnType<typeof listRecentGenerations>>>;
export type ListRecentGenerationsQueryError = ErrorType<unknown>;
/**
 * @summary Get most recent generations
 */
export declare function useListRecentGenerations<TData = Awaited<ReturnType<typeof listRecentGenerations>>, TError = ErrorType<unknown>>(params?: ListRecentGenerationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listRecentGenerations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetGenerationUrl: (id: number) => string;
/**
 * @summary Get a single generation
 */
export declare const getGeneration: (id: number, options?: RequestInit) => Promise<Generation>;
export declare const getGetGenerationQueryKey: (id: number) => readonly [`/api/generations/${number}`];
export declare const getGetGenerationQueryOptions: <TData = Awaited<ReturnType<typeof getGeneration>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGeneration>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getGeneration>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetGenerationQueryResult = NonNullable<Awaited<ReturnType<typeof getGeneration>>>;
export type GetGenerationQueryError = ErrorType<void>;
/**
 * @summary Get a single generation
 */
export declare function useGetGeneration<TData = Awaited<ReturnType<typeof getGeneration>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGeneration>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateGenerationUrl: (id: number) => string;
/**
 * @summary Update a generation (title, notes, favorite)
 */
export declare const updateGeneration: (id: number, generationUpdate: GenerationUpdate, options?: RequestInit) => Promise<Generation>;
export declare const getUpdateGenerationMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateGeneration>>, TError, {
        id: number;
        data: BodyType<GenerationUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateGeneration>>, TError, {
    id: number;
    data: BodyType<GenerationUpdate>;
}, TContext>;
export type UpdateGenerationMutationResult = NonNullable<Awaited<ReturnType<typeof updateGeneration>>>;
export type UpdateGenerationMutationBody = BodyType<GenerationUpdate>;
export type UpdateGenerationMutationError = ErrorType<void>;
/**
* @summary Update a generation (title, notes, favorite)
*/
export declare const useUpdateGeneration: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateGeneration>>, TError, {
        id: number;
        data: BodyType<GenerationUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateGeneration>>, TError, {
    id: number;
    data: BodyType<GenerationUpdate>;
}, TContext>;
export declare const getDeleteGenerationUrl: (id: number) => string;
/**
 * @summary Delete a generation
 */
export declare const deleteGeneration: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteGenerationMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteGeneration>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteGeneration>>, TError, {
    id: number;
}, TContext>;
export type DeleteGenerationMutationResult = NonNullable<Awaited<ReturnType<typeof deleteGeneration>>>;
export type DeleteGenerationMutationError = ErrorType<void>;
/**
* @summary Delete a generation
*/
export declare const useDeleteGeneration: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteGeneration>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteGeneration>>, TError, {
    id: number;
}, TContext>;
export declare const getCreateVariationUrl: (id: number) => string;
/**
 * @summary Create a variation of an existing generation
 */
export declare const createVariation: (id: number, variationInput: VariationInput, options?: RequestInit) => Promise<Generation>;
export declare const getCreateVariationMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createVariation>>, TError, {
        id: number;
        data: BodyType<VariationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createVariation>>, TError, {
    id: number;
    data: BodyType<VariationInput>;
}, TContext>;
export type CreateVariationMutationResult = NonNullable<Awaited<ReturnType<typeof createVariation>>>;
export type CreateVariationMutationBody = BodyType<VariationInput>;
export type CreateVariationMutationError = ErrorType<void>;
/**
* @summary Create a variation of an existing generation
*/
export declare const useCreateVariation: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createVariation>>, TError, {
        id: number;
        data: BodyType<VariationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createVariation>>, TError, {
    id: number;
    data: BodyType<VariationInput>;
}, TContext>;
export declare const getListCollectionsUrl: () => string;
/**
 * @summary List all collections
 */
export declare const listCollections: (options?: RequestInit) => Promise<Collection[]>;
export declare const getListCollectionsQueryKey: () => readonly ["/api/collections"];
export declare const getListCollectionsQueryOptions: <TData = Awaited<ReturnType<typeof listCollections>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCollections>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCollections>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCollectionsQueryResult = NonNullable<Awaited<ReturnType<typeof listCollections>>>;
export type ListCollectionsQueryError = ErrorType<unknown>;
/**
 * @summary List all collections
 */
export declare function useListCollections<TData = Awaited<ReturnType<typeof listCollections>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCollections>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCollectionUrl: () => string;
/**
 * @summary Create a new collection
 */
export declare const createCollection: (collectionInput: CollectionInput, options?: RequestInit) => Promise<Collection>;
export declare const getCreateCollectionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCollection>>, TError, {
        data: BodyType<CollectionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCollection>>, TError, {
    data: BodyType<CollectionInput>;
}, TContext>;
export type CreateCollectionMutationResult = NonNullable<Awaited<ReturnType<typeof createCollection>>>;
export type CreateCollectionMutationBody = BodyType<CollectionInput>;
export type CreateCollectionMutationError = ErrorType<unknown>;
/**
* @summary Create a new collection
*/
export declare const useCreateCollection: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCollection>>, TError, {
        data: BodyType<CollectionInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCollection>>, TError, {
    data: BodyType<CollectionInput>;
}, TContext>;
export declare const getGetCollectionUrl: (id: number) => string;
/**
 * @summary Get a collection with its generations
 */
export declare const getCollection: (id: number, options?: RequestInit) => Promise<CollectionWithGenerations>;
export declare const getGetCollectionQueryKey: (id: number) => readonly [`/api/collections/${number}`];
export declare const getGetCollectionQueryOptions: <TData = Awaited<ReturnType<typeof getCollection>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCollection>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCollection>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCollectionQueryResult = NonNullable<Awaited<ReturnType<typeof getCollection>>>;
export type GetCollectionQueryError = ErrorType<void>;
/**
 * @summary Get a collection with its generations
 */
export declare function useGetCollection<TData = Awaited<ReturnType<typeof getCollection>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCollection>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateCollectionUrl: (id: number) => string;
/**
 * @summary Update a collection
 */
export declare const updateCollection: (id: number, collectionUpdate: CollectionUpdate, options?: RequestInit) => Promise<Collection>;
export declare const getUpdateCollectionMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCollection>>, TError, {
        id: number;
        data: BodyType<CollectionUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCollection>>, TError, {
    id: number;
    data: BodyType<CollectionUpdate>;
}, TContext>;
export type UpdateCollectionMutationResult = NonNullable<Awaited<ReturnType<typeof updateCollection>>>;
export type UpdateCollectionMutationBody = BodyType<CollectionUpdate>;
export type UpdateCollectionMutationError = ErrorType<void>;
/**
* @summary Update a collection
*/
export declare const useUpdateCollection: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCollection>>, TError, {
        id: number;
        data: BodyType<CollectionUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCollection>>, TError, {
    id: number;
    data: BodyType<CollectionUpdate>;
}, TContext>;
export declare const getDeleteCollectionUrl: (id: number) => string;
/**
 * @summary Delete a collection
 */
export declare const deleteCollection: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCollectionMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCollection>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCollection>>, TError, {
    id: number;
}, TContext>;
export type DeleteCollectionMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCollection>>>;
export type DeleteCollectionMutationError = ErrorType<void>;
/**
* @summary Delete a collection
*/
export declare const useDeleteCollection: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCollection>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCollection>>, TError, {
    id: number;
}, TContext>;
export declare const getAddToCollectionUrl: (id: number) => string;
/**
 * @summary Add a generation to a collection
 */
export declare const addToCollection: (id: number, collectionItemInput: CollectionItemInput, options?: RequestInit) => Promise<CollectionItem>;
export declare const getAddToCollectionMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addToCollection>>, TError, {
        id: number;
        data: BodyType<CollectionItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addToCollection>>, TError, {
    id: number;
    data: BodyType<CollectionItemInput>;
}, TContext>;
export type AddToCollectionMutationResult = NonNullable<Awaited<ReturnType<typeof addToCollection>>>;
export type AddToCollectionMutationBody = BodyType<CollectionItemInput>;
export type AddToCollectionMutationError = ErrorType<void>;
/**
* @summary Add a generation to a collection
*/
export declare const useAddToCollection: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addToCollection>>, TError, {
        id: number;
        data: BodyType<CollectionItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addToCollection>>, TError, {
    id: number;
    data: BodyType<CollectionItemInput>;
}, TContext>;
export declare const getRemoveFromCollectionUrl: (id: number, generationId: number) => string;
/**
 * @summary Remove a generation from a collection
 */
export declare const removeFromCollection: (id: number, generationId: number, options?: RequestInit) => Promise<void>;
export declare const getRemoveFromCollectionMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof removeFromCollection>>, TError, {
        id: number;
        generationId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof removeFromCollection>>, TError, {
    id: number;
    generationId: number;
}, TContext>;
export type RemoveFromCollectionMutationResult = NonNullable<Awaited<ReturnType<typeof removeFromCollection>>>;
export type RemoveFromCollectionMutationError = ErrorType<void>;
/**
* @summary Remove a generation from a collection
*/
export declare const useRemoveFromCollection: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof removeFromCollection>>, TError, {
        id: number;
        generationId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof removeFromCollection>>, TError, {
    id: number;
    generationId: number;
}, TContext>;
export declare const getListGlassRoomUrl: (params?: ListGlassRoomParams) => string;
/**
 * @summary List active Glass Room entries (view-only, 20-day display limit)
 */
export declare const listGlassRoom: (params?: ListGlassRoomParams, options?: RequestInit) => Promise<GlassRoomEntry[]>;
export declare const getListGlassRoomQueryKey: (params?: ListGlassRoomParams) => readonly ["/api/glass-room", ...ListGlassRoomParams[]];
export declare const getListGlassRoomQueryOptions: <TData = Awaited<ReturnType<typeof listGlassRoom>>, TError = ErrorType<unknown>>(params?: ListGlassRoomParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGlassRoom>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listGlassRoom>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListGlassRoomQueryResult = NonNullable<Awaited<ReturnType<typeof listGlassRoom>>>;
export type ListGlassRoomQueryError = ErrorType<unknown>;
/**
 * @summary List active Glass Room entries (view-only, 20-day display limit)
 */
export declare function useListGlassRoom<TData = Awaited<ReturnType<typeof listGlassRoom>>, TError = ErrorType<unknown>>(params?: ListGlassRoomParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGlassRoom>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSubmitToGlassRoomUrl: () => string;
/**
 * @summary Submit a generation to the Glass Room
 */
export declare const submitToGlassRoom: (glassRoomInput: GlassRoomInput, options?: RequestInit) => Promise<GlassRoomEntry>;
export declare const getSubmitToGlassRoomMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitToGlassRoom>>, TError, {
        data: BodyType<GlassRoomInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof submitToGlassRoom>>, TError, {
    data: BodyType<GlassRoomInput>;
}, TContext>;
export type SubmitToGlassRoomMutationResult = NonNullable<Awaited<ReturnType<typeof submitToGlassRoom>>>;
export type SubmitToGlassRoomMutationBody = BodyType<GlassRoomInput>;
export type SubmitToGlassRoomMutationError = ErrorType<void>;
/**
* @summary Submit a generation to the Glass Room
*/
export declare const useSubmitToGlassRoom: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitToGlassRoom>>, TError, {
        data: BodyType<GlassRoomInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof submitToGlassRoom>>, TError, {
    data: BodyType<GlassRoomInput>;
}, TContext>;
export declare const getRemoveFromGlassRoomUrl: (id: number) => string;
/**
 * @summary Remove an entry from the Glass Room
 */
export declare const removeFromGlassRoom: (id: number, options?: RequestInit) => Promise<void>;
export declare const getRemoveFromGlassRoomMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof removeFromGlassRoom>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof removeFromGlassRoom>>, TError, {
    id: number;
}, TContext>;
export type RemoveFromGlassRoomMutationResult = NonNullable<Awaited<ReturnType<typeof removeFromGlassRoom>>>;
export type RemoveFromGlassRoomMutationError = ErrorType<void>;
/**
* @summary Remove an entry from the Glass Room
*/
export declare const useRemoveFromGlassRoom: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof removeFromGlassRoom>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof removeFromGlassRoom>>, TError, {
    id: number;
}, TContext>;
export declare const getGetPublicGalleryUrl: (params?: GetPublicGalleryParams) => string;
/**
 * @summary Get all community creations for the public gallery
 */
export declare const getPublicGallery: (params?: GetPublicGalleryParams, options?: RequestInit) => Promise<Generation[]>;
export declare const getGetPublicGalleryQueryKey: (params?: GetPublicGalleryParams) => readonly ["/api/public-gallery", ...GetPublicGalleryParams[]];
export declare const getGetPublicGalleryQueryOptions: <TData = Awaited<ReturnType<typeof getPublicGallery>>, TError = ErrorType<unknown>>(params?: GetPublicGalleryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPublicGallery>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPublicGallery>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPublicGalleryQueryResult = NonNullable<Awaited<ReturnType<typeof getPublicGallery>>>;
export type GetPublicGalleryQueryError = ErrorType<unknown>;
/**
 * @summary Get all community creations for the public gallery
 */
export declare function useGetPublicGallery<TData = Awaited<ReturnType<typeof getPublicGallery>>, TError = ErrorType<unknown>>(params?: GetPublicGalleryParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPublicGallery>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDashboardStatsUrl: () => string;
/**
 * @summary Get dashboard statistics
 */
export declare const getDashboardStats: (options?: RequestInit) => Promise<DashboardStats>;
export declare const getGetDashboardStatsQueryKey: () => readonly ["/api/dashboard/stats"];
export declare const getGetDashboardStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>;
export type GetDashboardStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get dashboard statistics
 */
export declare function useGetDashboardStats<TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDashboardActivityUrl: (params?: GetDashboardActivityParams) => string;
/**
 * @summary Get recent activity feed
 */
export declare const getDashboardActivity: (params?: GetDashboardActivityParams, options?: RequestInit) => Promise<ActivityItem[]>;
export declare const getGetDashboardActivityQueryKey: (params?: GetDashboardActivityParams) => readonly ["/api/dashboard/activity", ...GetDashboardActivityParams[]];
export declare const getGetDashboardActivityQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardActivity>>, TError = ErrorType<unknown>>(params?: GetDashboardActivityParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardActivity>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardActivityQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardActivity>>>;
export type GetDashboardActivityQueryError = ErrorType<unknown>;
/**
 * @summary Get recent activity feed
 */
export declare function useGetDashboardActivity<TData = Awaited<ReturnType<typeof getDashboardActivity>>, TError = ErrorType<unknown>>(params?: GetDashboardActivityParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map