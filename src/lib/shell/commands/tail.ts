import { Shell } from '@/types/shell';

import { 
    commandHasInvalidOptions, 
    getCommandInvalidOptionMessage, 
    optionIsPresent 
} from './common/options';

import { ExecutionTreeError } from '../exception';
import { resolveArguments } from './common/arguments';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getFileIndex, 
    getParentPathAndTargetName 
} from './common/directoryAndFile';
import { resolveSizeNotationInNumber } from './common/size';
import { BREAK_LINE } from './common/patterns';
import { formatHelpPageOptions, helpPageSectionsAssembler } from './common/formatters';
import { commandDecorator } from './common/decorator';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: null,
        long: /^--bytes=\+?[0-9]+[A-Za-z]*$/,
        description: 'output the last NUM bytes; or use -c +NUM to output starting with byte NUM of each file'
    },
    {
        short: null,
        long: /^--lines=\+?[0-9]+$/,
        description: 'output the last NUM lines, instead of the last 10; or use -n +NUM to output starting with line NUM'
    },
    {
        short: null,
        long: '--help',
        description: 'display this help and exit'
    }
];


export const help = (
    systemAPI: Shell.SystemAPI
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    const regexOptionsMapping = new Map();

    regexOptionsMapping.set(COMMAND_OPTIONS[0].long, '--bytes=[+]NUM');
    regexOptionsMapping.set(COMMAND_OPTIONS[1].long, '--lines=[+]NUM');

    const formattedOptions = formatHelpPageOptions(
        COMMAND_OPTIONS, 
        regexOptionsMapping
    );

    const name = 'tail - output the last part of files';
    const synopsis = 'tail [OPTION]... [FILE]...';
    const description = `Print the last 10 lines of each FILE to standard output.${BREAK_LINE}${formattedOptions}`;

    const formattedHelp = helpPageSectionsAssembler(
        name,
        synopsis,
        description
    );

    return {
        stdout: formattedHelp,
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


const main = (
    providedOptions: string[],
    providedArguments: string[],
    systemAPI: Shell.SystemAPI
) => {

    const bytesPrintingOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
    const linesPrintingOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);

    const bytesToPrint = bytesPrintingOption.regExpValuePart;
    const linesToPrint = linesPrintingOption.regExpValuePart ?? 10;

    const {
        environmentVariables,
        fileSystem
    } = systemAPI;
    
    const currentWorkingDirectory = environmentVariables['PWD'];
    const currentShellUser = environmentVariables['USER'];

    const pathsToRead = providedArguments;

    const stdout = pathsToRead.reduce((
        acc: string[],
        pathToRead,
        index,
        array
    ) => {

        const checkedPathToRead = checkProvidedPath(
            pathToRead,
            currentWorkingDirectory,
            currentShellUser,
            fileSystem
        );

        if (!checkedPathToRead.valid) {
            throw new ExecutionTreeError(
                `tail: ${pathToRead}: No such file or directory`,
                1
            );
        }

        if (checkedPathToRead.validAs === 'directory') {
            throw new ExecutionTreeError(
                `tail: ${pathToRead}: Is a directory`,
                1
            );
        }

        const {
            parentPath,
            targetName
        } = getParentPathAndTargetName(checkedPathToRead.resolvedPath);

        const parentDirectoryData = getDirectoryData(
            parentPath,
            currentWorkingDirectory,
            currentShellUser,
            fileSystem
        );

        const parentDirectoryChildrenFiles = parentDirectoryData.children.files;

        const fileIndex = getFileIndex(
            targetName,
            parentDirectoryChildrenFiles
        );

        const fileData = parentDirectoryChildrenFiles[fileIndex];

        const fileContent = fileData.data.content;

        if (bytesPrintingOption.valid) {
            const hasStartFromByteSymbol = bytesToPrint?.startsWith('+');

            const encoder = new TextEncoder();
            const bytesArray = encoder.encode(fileContent);

            const bytesPart = bytesToPrint!.replace(/^\+/, '');
            const resolvedBytes = resolveSizeNotationInNumber(bytesPart);

            if (isNaN(resolvedBytes)) {
                throw new ExecutionTreeError(
                    `tail: invalid bytes '${bytesToPrint}', just numbers and valid bytes notation are accepted`,
                    1
                );
            }

            const startIndexToSlice = hasStartFromByteSymbol
                                      ? resolvedBytes - 1
                                      : bytesArray.length - resolvedBytes;

            const endIndexToSlice = bytesArray.length;

            const slicedBytesArray = bytesArray.slice(startIndexToSlice, endIndexToSlice);

            const decoder = new TextDecoder('utf-8');

            const content = decoder.decode(slicedBytesArray);

            const label = `${array.length > 1? `${targetName}:${BREAK_LINE}` : ''}`
            const fileContentOutput = `${label}${content}`;

            acc.push(fileContentOutput);
            
        }
        else {
            const hasStartFromLineSymbol = linesToPrint?.toString().startsWith('+');

            const linesPart = linesToPrint.toString().replace(/^\+/, '');
            const linesNumber = Math.abs(parseInt(linesPart));

            const fileContentLines = fileContent.split('\n');

            if (isNaN(linesNumber)) {
                throw new ExecutionTreeError(
                    `tail: invalid lines number '${bytesToPrint}', just positive integers are accepted`,
                    1
                );
            }

            const startIndexToSlice = hasStartFromLineSymbol
                                      ? linesNumber - 1
                                      : fileContentLines.length - linesNumber < 0
                                        ? 0 
                                        : fileContentLines.length - linesNumber;

            const content = fileContentLines.slice(startIndexToSlice).join(BREAK_LINE);

            const label = `${array.length > 1? `${targetName}:${BREAK_LINE}` : ''}`
            const fileContentOutput = `${label}${content}`;

            acc.push(fileContentOutput);
        }


        return acc;
    }, []);


    return {
        stdout: stdout.join(BREAK_LINE),
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


export const tail = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'tail', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}