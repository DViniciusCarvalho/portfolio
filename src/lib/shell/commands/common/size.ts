export const getSizeNotation = (
    size: number,
    prefix: string | null = null
) => {

    const PREFIX_MAPPING: {[key: string]: number} = {
        'K': 10e3,
        'M': 10e6,
        'G': 10e9,
        'T': 10e12
    };

    const dividend = prefix ?? 'K';

    return `${(size / PREFIX_MAPPING[dividend]).toFixed(2)}${dividend}`

}