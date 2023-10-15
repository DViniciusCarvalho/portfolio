export const ESCAPE_SEQUENCES_SUBSTITUTION: {[key: string]: string} = {
    '\\n': '!<break_line>!',
    '\\t': '!<tabulation>!',
    '\\\'': '!<single_quote>!',
    '\\\"': '!<double_quote>!'
};

export const BREAK_LINE = ESCAPE_SEQUENCES_SUBSTITUTION['\\n'];
export const TABULATION = ESCAPE_SEQUENCES_SUBSTITUTION['\\t'];
export const SINGLE_QUOTE = ESCAPE_SEQUENCES_SUBSTITUTION['\\\''];
export const DOUBLE_QUOTE = ESCAPE_SEQUENCES_SUBSTITUTION['\\\"'];

export const FULL_COLORED_WORD_PATTERN = /!<span<#[A-Fa-f0-9]+>>!.+!<\\span>!/g;
export const START_COLORED_WORD_PATTERN = /!<span<#[A-Fa-f0-9]+>>!/g;
export const END_COLORED_WORD_PATTERN = /!<\\span>!/g;

export const COLORED_WORD_TEMPLATE = '!<span<[COLOR]>>![CONTENT]!<\\span>!';

export const VARIABLE_PATTERN = /(?<!\\)\$[A-Za-z0-9_\?]+/g;
export const VARIABLE_ASSIGNMENT_PATTERN = /^.*=.*$/;
export const FULL_COMMAND_SUBSTITUTION_PATTERN = /\$\([^)]*\)/g;
export const START_COMMAND_SUBSTITUTION_PATTERN = /^\$\(/g;
export const END_COMMAND_SUBSTITUTION_PATTERN = /\)$/g;
export const SINGLE_QUOTED_STRING_PATTERN = /^[']|[']$/g;
export const DOUBLE_QUOTED_STRING_PATTERN = /^["]|["]$/g;
export const PARENT_DIRECTORY_PATTERN = /^\.\.\/|^\.\.$/;
export const CURRENT_DIRECTORY_PATTERN = /^\.\/|^\.$/;
export const HOME_DIRECTORY_PATTERN = /^~\//;
export const LAST_DIRECTORY_PATTERN = /\/[^\/]+$/;
export const SLASH_AT_END_PATTERN = /\/$/;
export const FILESYSTEM_ROOT_PATTERN = /^\//;
export const SIZE_PREFIX_PATTERN = /[A-Za-z]+$/g;
export const OCTAL_NUMBER_PATTERN = /^[0-7]*$/g;
export const ALL_PERMISSIONS_PATTERN = /^[0-7]{3|4}$/g;
export const ALL_CHARACTERS_PATTERN = /.*/g;
export const POSITIVE_INTEGER_PATTERN = /\d+/;