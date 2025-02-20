export const TWOFA_ISSUER = 'YABinPP';

export enum TwoFA {
    Delivery = 0,
    TOTP = 1,
}

export const TwoFANames: Record<TwoFA, string> = {
    [TwoFA.Delivery]: 'Delivered OTP',
    [TwoFA.TOTP]: 'Time based OTP',
};
