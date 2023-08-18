export const ESCAPE_SEQUENCES_SUBSTITUTION: {[key: string]: string} = {
    '\\n': '!<break_line>!',
    '\\t': '!<tabulation>!',
    '\\\'': '!<single_quote>!',
    '\\\"': '!<double_quote>!'
};