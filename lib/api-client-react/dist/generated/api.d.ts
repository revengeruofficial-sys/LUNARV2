import type { QueryKey, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { BotStats, Giveaway, HealthStatus, MessageStat, PunishmentLog, StaffEntry } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
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
/**
 * @summary Get overall bot statistics
 */
export declare const getGetBotStatsUrl: () => string;
export declare const getBotStats: (options?: RequestInit) => Promise<BotStats>;
export declare const getGetBotStatsQueryKey: () => readonly ["/api/bot/stats"];
export declare const getGetBotStatsQueryOptions: <TData = Awaited<ReturnType<typeof getBotStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBotStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBotStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBotStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getBotStats>>>;
export type GetBotStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get overall bot statistics
 */
export declare function useGetBotStats<TData = Awaited<ReturnType<typeof getBotStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBotStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get punishment logs
 */
export declare const getGetPunishmentsUrl: () => string;
export declare const getPunishments: (options?: RequestInit) => Promise<PunishmentLog[]>;
export declare const getGetPunishmentsQueryKey: () => readonly ["/api/bot/punishments"];
export declare const getGetPunishmentsQueryOptions: <TData = Awaited<ReturnType<typeof getPunishments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPunishments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPunishments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPunishmentsQueryResult = NonNullable<Awaited<ReturnType<typeof getPunishments>>>;
export type GetPunishmentsQueryError = ErrorType<unknown>;
/**
 * @summary Get punishment logs
 */
export declare function useGetPunishments<TData = Awaited<ReturnType<typeof getPunishments>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPunishments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get staff points leaderboard
 */
export declare const getGetStaffLeaderboardUrl: () => string;
export declare const getStaffLeaderboard: (options?: RequestInit) => Promise<StaffEntry[]>;
export declare const getGetStaffLeaderboardQueryKey: () => readonly ["/api/bot/staff"];
export declare const getGetStaffLeaderboardQueryOptions: <TData = Awaited<ReturnType<typeof getStaffLeaderboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStaffLeaderboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStaffLeaderboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStaffLeaderboardQueryResult = NonNullable<Awaited<ReturnType<typeof getStaffLeaderboard>>>;
export type GetStaffLeaderboardQueryError = ErrorType<unknown>;
/**
 * @summary Get staff points leaderboard
 */
export declare function useGetStaffLeaderboard<TData = Awaited<ReturnType<typeof getStaffLeaderboard>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStaffLeaderboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get giveaways list
 */
export declare const getGetGiveawaysUrl: () => string;
export declare const getGiveaways: (options?: RequestInit) => Promise<Giveaway[]>;
export declare const getGetGiveawaysQueryKey: () => readonly ["/api/bot/giveaways"];
export declare const getGetGiveawaysQueryOptions: <TData = Awaited<ReturnType<typeof getGiveaways>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGiveaways>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getGiveaways>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetGiveawaysQueryResult = NonNullable<Awaited<ReturnType<typeof getGiveaways>>>;
export type GetGiveawaysQueryError = ErrorType<unknown>;
/**
 * @summary Get giveaways list
 */
export declare function useGetGiveaways<TData = Awaited<ReturnType<typeof getGiveaways>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGiveaways>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get top message senders
 */
export declare const getGetMessageStatsUrl: () => string;
export declare const getMessageStats: (options?: RequestInit) => Promise<MessageStat[]>;
export declare const getGetMessageStatsQueryKey: () => readonly ["/api/bot/messages"];
export declare const getGetMessageStatsQueryOptions: <TData = Awaited<ReturnType<typeof getMessageStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMessageStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMessageStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMessageStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getMessageStats>>>;
export type GetMessageStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get top message senders
 */
export declare function useGetMessageStats<TData = Awaited<ReturnType<typeof getMessageStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMessageStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map