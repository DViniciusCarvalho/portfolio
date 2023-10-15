import { SIZE_PREFIX_PATTERN } from './patterns';


const PREFIX_MAPPING: {[key: string]: number} = {
    'K': 10e3,
    'M': 10e6,
    'G': 10e9,
    'T': 10e12,
    'P': 10e15
};


export const getSizeNotation = (
    size: number,
    prefix: string | null = null
): string => {

    prefix = prefix ?? 'K';

    const dividend = PREFIX_MAPPING[prefix];

    return `${(size / dividend).toFixed(2)}${prefix}`
}


export const resolveSizeNotationInNumber = (
    sizeInString: string
): number => {

    const prefixPart = sizeInString.match(SIZE_PREFIX_PATTERN);

    const numberPart = sizeInString.replace(SIZE_PREFIX_PATTERN, '');

    return Number(
        prefixPart
        ? eval(`${numberPart} * ${PREFIX_MAPPING[prefixPart[0]]}`) 
        : sizeInString
    );
}


export const isExactlySizeValue = (
    fileSize: number,
    sizeToCompare: string
): boolean => {
    
    const resolvedSizeToCompare = resolveSizeNotationInNumber(sizeToCompare);

    return fileSize === resolvedSizeToCompare;
}


export const isGreaterThanSizeValue = (
    fileSize: number,
    sizeIntervalToCompare: string
): boolean => {

    const resolvedSizeToCompre = resolveSizeNotationInNumber(sizeIntervalToCompare);

    return fileSize > resolvedSizeToCompre;
}


export const isLessThanSizeValue = (
    fileSize: number,
    sizeIntervalToCompare: string
): boolean => {

    const resolvedSizeToCompre = resolveSizeNotationInNumber(sizeIntervalToCompare);
    
    return fileSize < resolvedSizeToCompre;
}