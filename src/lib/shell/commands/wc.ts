import { Shell } from '@/types/shell';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getFileIndex, 
    getParentPathAndTargetName 
} from './common/directoryAndFile';

import { 
    alignLineItems, 
    formatHelpPageOptions, 
    helpPageSectionsAssembler 
} from './common/formatters';

import { commandDecorator } from './common/decorator';
import { optionIsPresent } from './common/options';
import { ExecutionTreeError } from '../exception';
import { BREAK_LINE } from './common/patterns';


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

    const formattedOptions = formatHelpPageOptions(COMMAND_OPTIONS);
    const name = 'wc - print newline, word, and byte counts for each file';
    const synopsis = `wc [OPTION]... [FILE]...`;
    const description = `Print newline, word, and byte counts for each FILE.${BREAK_LINE}${formattedOptions}`;

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

    const charsCountOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
    const linesCountOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);
    const wordsCountOption = optionIsPresent(providedOptions, 2, COMMAND_OPTIONS);
    const bytesCountOption = optionIsPresent(providedOptions, 3, COMMAND_OPTIONS);

    const canShowCharsCount = charsCountOption.valid;
    const canShowLinesCount = !providedOptions.length || linesCountOption.valid;
    const canShowWordsCount = !providedOptions.length || wordsCountOption.valid;
    const canShowBytesCount = !providedOptions.length || bytesCountOption.valid;

    const {
        environmentVariables,
        fileSystem
    } = systemAPI;
    
    const currentWorkingDirectory = environmentVariables['PWD'];
    const currentShellUser = environmentVariables['USER'];

    const pathsToRead = providedArguments;

    const stdout = pathsToRead.reduce((
        acc,
        pathToRead
    ) => {

        const checkedPathToRead = checkProvidedPath(
            pathToRead,
            currentWorkingDirectory,
            currentShellUser,
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
        
    }, [] as string[]);

    const formattedLines = alignLineItems(stdout, ' ', 'right');

    return {
        stdout: formattedLines.join(BREAK_LINE),
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

    return commandDecorator(
        'wc', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}