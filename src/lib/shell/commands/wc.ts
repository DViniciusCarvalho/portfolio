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
import { BREAK_LINE } from './common/patterns';
import { alignLineItems } from './common/formatters';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-m',
        long: '--chars',
        description: 'print the character counts'
    },
    {
        short: '-l',
        long: '--lines',
        description: 'print the newline counts'
    },
    {
        short: '-w',
        long: '--words',
        description: 'print the word counts'
    },
    {
        short: '-c',
        long: '--bytes',
        description: 'print the byte counts'
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


export const wc = (    
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
            stderr: getCommandInvalidOptionMessage('wc', invalidOptions),
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

        const charsCountOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
        const linesCountOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);
        const wordsCountOption = optionIsPresent(providedOptions, 2, COMMAND_OPTIONS);
        const bytesCountOption = optionIsPresent(providedOptions, 3, COMMAND_OPTIONS);

        const canShowCharsCount = charsCountOption.valid;
        const canShowLinesCount = !providedOptions.length || linesCountOption.valid;
        const canShowWordsCount = !providedOptions.length || wordsCountOption.valid;
        const canShowBytesCount = !providedOptions.length || bytesCountOption.valid;

        const cwd = systemAPI.environmentVariables['PWD'];
        const currentUser = systemAPI.currentShellUser;
        const fileSystem = systemAPI.fileSystem;

        const pathsToRead = argumentsValue;

        const stdout = pathsToRead.reduce((
            acc,
            pathToRead
        ) => {

            const checkedPathToRead = checkProvidedPath(
                pathToRead,
                cwd,
                currentUser,
                fileSystem
            );

            if (!checkedPathToRead.valid) {
                throw new ExecutionTreeError(
                    `wc: ${pathToRead}: No such file or directory`,
                    1
                );
            }

            if (checkedPathToRead.validAs === 'directory') {
                throw new ExecutionTreeError(
                    `wc: ${pathToRead}: Is a directory`,
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

            const infoToShow = [
                targetName
            ];


            if (canShowCharsCount){
                const fileContentLength = fileContent.length;

                infoToShow.unshift(fileContentLength.toString());
            }

            if (canShowLinesCount){
                const fileContentLines = fileContent.split('\n');
                const fileContentLinesLength = fileContentLines.length;

                infoToShow.unshift(fileContentLinesLength.toString());
            }

            if (canShowWordsCount){
                const noEscapedFileContent = fileContent.replace(/\\[tn]/g, ' ');
                const fileContentWords = noEscapedFileContent.split(' ');
                const fileContentWordsLength = fileContentWords.length;

                infoToShow.unshift(fileContentWordsLength.toString());
            }

            if (canShowBytesCount) {
                const encoder = new TextEncoder();
                const bytesArray = encoder.encode(fileContent);
                const bytesSize = bytesArray.length;

                infoToShow.unshift(bytesSize.toString());
            }

            acc.push(infoToShow.join(' '));

            return acc;
        }, []);

        const formattedLines = alignLineItems(stdout, ' ', 'right');

        return {
            stdout: formattedLines.join(BREAK_LINE),
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