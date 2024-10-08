export function removeLeadingNonAlphanumeric(str: string): string {
    return str.replace(/^[^a-zA-Z0-9]+/, '');
}