import type { StrictDict } from '../types';

export const API_TOKEN_SCOPES_MAP = {
    'paste.read': 0,
    'paste.write': 1,
    'paste.edit': 2,
} as const;

export type TokenScopes = keyof typeof API_TOKEN_SCOPES_MAP;
export const API_TOKEN_SCOPES_DESCRIPTION = {
    'paste.read': 'Access private pastes',
    'paste.write': 'Write new pastes',
    'paste.edit': 'Edit existing pastes',
} as const satisfies StrictDict<TokenScopes>;
