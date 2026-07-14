// Single source of truth for the current Terms version. Bump BOTH values together
// when the legal docs change: TERMS_VERSION is what gets recorded on profiles
// (tos_version) and compared by the re-acceptance gate; the label is what
// LegalScreen displays. Keeping them in one file means the recorded version can
// never drift from the date users actually see.
export const TERMS_VERSION = '2026-06-23';
export const TERMS_EFFECTIVE_LABEL = 'June 23, 2026';
