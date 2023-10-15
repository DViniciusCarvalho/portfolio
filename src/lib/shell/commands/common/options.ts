import { Shell } from '@/types/shell';


export const getOption = (
    shortOption: string | null,
    longOption: string | RegExp | null,
    options: any[]
) => {

    const foundOptions = options.filter(opt => {
        const longOptionIsRegExp = longOption instanceof RegExp;

        const shortOptionMatched = shortOption && opt === shortOption;

        const longOptionMatched = longOption && longOptionIsRegExp
                                  ? opt.match(longOption) 
                                  : opt === longOption;

        return shortOptionMatched || longOptionMatched;
    });

    return {
        has: !!foundOptions.length,
        match: foundOptions.at(0)
    };
}


export const commandHasInvalidOptions = (
    clientProvidedOptions: Shell.Token[],
    availableCommandOptions: Shell.CommandOption[]
) => {

    const availableOptionsStringArray = availableCommandOptions.reduce((
        acc: (string | RegExp)[], 
        curr
    ) => {

        if (curr.short) acc.push(curr.short);
        if (curr.long) acc.push(curr.long);

        return acc;
    }, []);

    
    const invalidOptionsStringArray = clientProvidedOptions.filter(option => 
        !availableOptionsStringArray.some(opt => 
            opt instanceof RegExp? !!option.value.match(opt) : option.value === opt
        )
    ).map(option => option.value) as string[];


    return {
        hasInvalidOption: !!invalidOptionsStringArray.length,
        invalidOptions: invalidOptionsStringArray
    };
}


export const getCommandInvalidOptionMessage = (
    commandName: string,
    invalidOptions: string[]
): string => {

    const invalidOptionsMessageLines = invalidOptions.reduce((acc: string, curr) => {
        const message = `${commandName}: invalid option -- '${curr}'\n`;
        acc += message;

        return acc;
    }, '');

    const helpCommand = `${commandName} --help`

    const helpCommandMessageLine = `Try '${helpCommand}' for more information.`;

    return invalidOptionsMessageLines + helpCommandMessageLine;
}


export const optionIsPresent = (
    options: string[],
    index: number,
    availableOptions: Shell.CommandOption[]
) => {

    const initialValue: { 
        valid: boolean, 
        type: string | null, 
        regExpValuePart: string | null 
    } = {
        valid: false,
        type: null,
        regExpValuePart: null
    };

    const option = options.reduce((
        acc, 
        curr
    ) => {

        const optionResult = checkOption(curr, index, availableOptions);

        if (optionResult.valid) {
            acc = optionResult;
        }

        return acc;

    }, initialValue);

    return option;
}


export const checkOption = (
    option: string,
    index: number,
    availableOptions: Shell.CommandOption[]
) => {

    const shortOption = availableOptions[index].short;
    const longOption = availableOptions[index].long;

    const longOptionIsRegExp = longOption instanceof RegExp
    
    const isShortOption = option === shortOption;

    const isLongOption = longOptionIsRegExp
                         ? !!option.match(longOption)
                         : option === longOption;

    const regExpValuePart = isLongOption && longOptionIsRegExp
                            ? option.slice(option.indexOf('=') + 1)
                            : null;
    
    const isValidOption = isShortOption || isLongOption;
    
    return {
        valid: isValidOption,
        type: isValidOption? (isShortOption? 'short' : 'long') : null,
        regExpValuePart: regExpValuePart
    };
}