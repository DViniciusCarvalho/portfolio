import { Shell } from "@/types/shell";


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
    invalidOptions: string[],
    helpCommand: string
) => {

    const invalidOptionsMessageLines = invalidOptions.reduce((acc: string, curr) => {
        const message = `${commandName}: invalid option -- '${curr}'\n`;
        acc += message;

        return acc;
    }, '');

    const helpCommandMessageLine = `Try '${helpCommand}' for more information.`;

    return invalidOptionsMessageLines + helpCommandMessageLine;
}


export const optionIsPresent = (
    options: string[],
    index: number,
    availableOptions: Shell.CommandOption[]
) => {
    const initialValue: { valid: boolean, type: string | null } = {
        valid: false,
        type: null
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

    const SHORT_OPTION = availableOptions[index].short;
    const LONG_OPTION_PATTERN = availableOptions[index].long;
    
    const isShortOption = option === SHORT_OPTION;
    const isLongOption = !!option.match(LONG_OPTION_PATTERN as RegExp);
    
    const isValidOption = isShortOption || isLongOption;
    
    return {
        valid: isValidOption,
        type: isValidOption? (isShortOption? 'short' : 'long') : null
    };
}