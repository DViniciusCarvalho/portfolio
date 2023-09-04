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


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-c',
        long: /--bytes=\-?[0-9]+/,
        description: 'print the first NUM bytes of each file; with the leading \'-\', print all but the last NUM bytes of each file'
    },
    {
        short: '-n',
        long: /--lines=\-?[0-9]+/,
        description: 'print the first NUM lines instead of the first 10; with the leading \'-\', print all but the last NUM lines of each file'
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
    return {
        stdout: '',
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


export const head = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    const { 
        hasInvalidOption, 
        invalidOptions 
    } = commandHasInvalidOptions(commandOptions, COMMAND_OPTIONS);

    if (hasInvalidOption) {
        return {
            stdout: null,
            stderr: getCommandInvalidOptionMessage('head', invalidOptions),
            exitStatus: 2,
            modifiedSystemAPI: systemAPI
        };
    }

    const providedOptions = commandOptions.map(opt => opt.value);
    const hasHelpOption = !!providedOptions.find(opt => opt === '--help');

    if (hasHelpOption) {
        return help(systemAPI);
    }

    const argumentsValue = resolveArguments(
        commandArguments,
        stdin, 
        systemAPI, 
        false
    );

    try {

        const bytesPrintingOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
        const linesPrintingOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);
    
        const bytesToPrint = bytesPrintingOption.regExpValuePart;
        const linesToPrint = linesPrintingOption.regExpValuePart ?? 10;

        const cwd = systemAPI.environmentVariables['PWD'];
        const currentUser = systemAPI.currentShellUser;
        const fileSystem = systemAPI.fileSystem;
    
        const pathsToRead = argumentsValue;
    
        const stdout = pathsToRead.reduce((
            acc,
            pathToRead,
            index,
            array
        ) => {
    
            const checkedPathToRead = checkProvidedPath(
                pathToRead,
                cwd,
                currentUser,
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
                cwd,
                currentUser,
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
                const hasEndInByteSymbol = bytesToPrint?.startsWith('-');

                const encoder = new TextEncoder();
                const bytesArray = encoder.encode(fileContent);

                const bytesPart = bytesToPrint!.replace(/^\-/, '');
                const resolvedBytes = resolveSizeNotationInNumber(bytesPart);

                if (isNaN(resolvedBytes)) {
                    throw new ExecutionTreeError(
                        `tail: invalid bytes '${bytesToPrint}', just numbers and valid bytes notation are accepted`,
                        1
                    );
                }

                const endIndexToSlice = hasEndInByteSymbol
                                        ? bytesArray.length - resolvedBytes < 0
                                          ? 0
                                          : bytesArray.length - resolvedBytes
                                        : resolvedBytes;

                const slicedBytesArray = bytesArray.slice(0, endIndexToSlice);

                const decoder = new TextDecoder('utf-8');

                const content = decoder.decode(slicedBytesArray);

                const label = `${array.length > 1? `${targetName}:${BREAK_LINE}` : ''}`
                const fileContentOutput = `${label}${content}`;

                acc.push(fileContentOutput);
                
            }
            else {
                const hasStartFromLineSymbol = linesToPrint?.toString().startsWith('-');

                const linesPart = linesToPrint.toString().replace(/^\-/, '');
                const linesNumber = Math.abs(parseInt(linesPart));

                const fileContentLines = fileContent.split('\n');

                if (isNaN(linesNumber)) {
                    throw new ExecutionTreeError(
                        `tail: invalid lines number '${bytesToPrint}', just positive integers are accepted`,
                        1
                    );
                }

                const endIndexToSlice = hasStartFromLineSymbol
                                        ? fileContentLines.length - linesNumber < 0
                                          ? 0 
                                          : fileContentLines.length - linesNumber
                                        : linesNumber;

                const content = fileContentLines.slice(0, endIndexToSlice).join(BREAK_LINE);

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
    catch (err: unknown) {
        const errorObject = err as ExecutionTreeError;

        return {
            stdout: null,
            stderr: errorObject.errorMessage,
            exitStatus: errorObject.errorStatus,
            modifiedSystemAPI: systemAPI
        };
    }

}