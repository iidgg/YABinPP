import type { TokenScopes } from './constants/scopes';

export type Dict<T = string> = { [k: string]: T };
export type StrictDict<K extends string, T = string> = {
    [P in K]: T;
};

export interface SuccessResponse {
    success: true;
}

export interface PasteConfig {
    language?: string;
    hidden?: boolean;
    encrypted?: boolean;
    expiresAfter?: number;
    burnAfterRead?: boolean;
    customPath?: string;
}

export interface Paste {
    title?: string;
    content: string;
    passwordProtected?: boolean;
    initVector?: string;
    config?: PasteConfig;
}

export interface PastePatch {
    key: string;
    content: string;
    encrypted?: boolean;
    initVector?: string;
}

export interface PasteCreateResponse {
    success: boolean;
    data?: {
        key: string;
    };
    error?: string;
}

export interface PastePatchResponse {
    success: boolean;
    data?: {
        key: string;
    };
    error?: string;
}

export interface TokenInfo {
    id: string;
    name: string;
}

export interface TokenCreate {
    name?: string;
    scopes?: Array<TokenScopes>;
    expiresAt?: Date;
}

export interface TokenUpdate {
    name?: string;
    scopes?: Array<TokenScopes>;
    expiresAt?: Date;
}

export interface TokenPostResponse {
    success: boolean;
    data?: TokenInfo & { token: string };
    error?: string;
}

export interface TokenUpdateResponse {
    success: boolean;
    data?: TokenInfo;
    error?: string;
}

export interface TokenResetResponse {
    success: boolean;
    data?: {
        token: string;
    };
    error?: string;
}

export interface UserSettings {
    defaults?: {
        hidden?: boolean;
        encrypted?: boolean;
        burnAfterRead?: boolean;
        expiresAfterSeconds?: number;
    };
}
