import { Shell } from '@/types/shell';

import { 
    commandHasInvalidOptions, 
    getCommandInvalidOptionMessage, 
    optionIsPresent 
} from './common/options';

import { ExecutionTreeError } from '../exception';
import { resolveArguments } from './common/arguments';

import { 
    BREAK_LINE, 
    COLORED_WORD_TEMPLATE 
} from './common/patterns';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getDirectoryIndex, 
    getFileIndex, 
    getParentPathAndTargetName, 
    targetIsDirectory 
} from './common/directoryAndFile';

import { Directory } from './models/Directory';
import { File } from './models/File';
import { changeReadingTimestamps } from './common/timestamps';
import { formatHelpPageOptions, helpPageSectionsAssembler } from './common/formatters';
import { commandDecorator } from './common/decorator';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-i',
        long: '--ignore-case',
        description: 'Ignore case distinctions in patterns and input data, so that characters that differ only in case match each other.'
    },
    {
        short: '-v',
        long: '--invert-match',
        description: 'Invert the sense of matching, to select non-matching lines.'
    },
    {
        short: '-c',
        long: '--count',
        description: 'Suppress normal output; instead print a count of matching lines for each input file. With the -v, --invert-match option (see below), count non-matching lines.'
    },
    {
        short: '-o',
        long: '--only-matching',
        description: 'Print only the matched (non-empty) parts of a matching line, with each such part on a separate output line.'
    },
    {
        short: '-r',
        long: '--recursive',
        description: 'Read all files under each directory, recursively.'
    },
    {
        short: '-n',
        long: '--line-number',
        description: 'Prefix each line of output with the 1-based line number within its input file.'
    },
    {
        short: null,
        long: '--help',
        description: 'display this help and exit'
    }
];


const findForMatchesRecursively = (
    pathFilesAndDirectories: (File | Directory)[],
    pathAcc: string,
    stdoutAccumulator: string[],
    regexPattern: RegExp,
    canShowLineNumber: boolean, 
    canShowOnlyMatches: boolean,
    canCountMatches: boolean
): void => {

    const currentTimestamp = Date.now();

    for (let index = 0; index < pathFilesAndDirectories.length; index++) {
        const fileOrDirectory = pathFilesAndDirectories[index];
        const isDirectory = targetIsDirectory(fileOrDirectory);

        changeReadingTimestamps(fileOrDirectory, currentTimestamp);

        const fileOrDirName = fileOrDirectory.name;

        const fullPath = `${pathAcc}/${fileOrDirName}`;

        if (isDirectory) {
            const directory = fileOrDirectory as Directory;

            const childrenFiles = directory.children.files;
            const childrenDirectories = directory.children.directories;

            const children = [
                ...childrenFiles,
                ...childrenDirectories
            ];
            
            findForMatchesRecursively(
                children, 
                fullPath, 
                stdoutAccumulator, 
                regexPattern, 
                canShowLineNumber, 
                canShowOnlyMatches,
                canCountMatches
            );
        }
        else {
            const searchResult = searchInFile(
                fileOrDirectory as File, 
                regexPattern, 
                canShowLineNumber, 
                canShowOnlyMatches,
                canCountMatches
            );

            stdoutAccumulator.push(searchResult);
        }
    }

    return;
};


const searchInFile = (
    fileData: File,
    regexPattern: RegExp,
    canShowLineNumber: boolean,
    canShowOnlyMatches: boolean,
    canCountMatches: boolean
): string => {

    const GREP_COLOR = '#c01c28';

    const currentTimestamp = Date.now();

    const fileName = fileData.name;
    const fileContent = fileData.data.content;
    const fileContentLines = fileContent.split('\n');

    changeReadingTimestamps(fileData, currentTimestamp);

    const fileSearchResult = fileContentLines.reduce((
        acc, 
        current,
        index
    ) => {
        
        const lineMatches = current.match(regexPattern);

        if (!lineMatches) return acc;

        for (const match of lineMatches) {
            const lineNumber = index + 1;
            const startOfLine = canShowLineNumber? `${lineNumber}:` : '';

            const colorElement = COLORED_WORD_TEMPLATE
                                 .replace('[COLOR]', GREP_COLOR)
                                 .replace('[CONTENT]', match);

            const lineContent = canShowOnlyMatches
                                ? match
                                : current.replace(regexPattern, colorElement);

            acc.lines.push(`${startOfLine}${lineContent}`);
            
        }

        acc.matchCount ++;

        return acc;

    }, {
        matchCount: 0,
        lines: [] as string[]
    });

    const fileLabel = `${fileName}:${BREAK_LINE}`;

    const fileResult = canCountMatches
                       ? fileSearchResult.matchCount 
                       : fileSearchResult.lines.join(BREAK_LINE);

    const finalFileStdout = `${fileLabel}${fileResult}`;

    return finalFileStdout;
}


export const help = (
    systemAPI: Shell.SystemAPI
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    const formattedOptions = formatHelpPageOptions(COMMAND_OPTIONS);
    const name = 'grep - print lines that match patterns';
    const synopsis = 'grep [OPTION...] PATTERN [FILE...]';
    const description = `Searches for PATTERN in each FILE.${BREAK_LINE}${formattedOptions}`;

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
    const ignoreCaseOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
    const invertMatchOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);
    const countMatchesOption = optionIsPresent(providedOptions, 2, COMMAND_OPTIONS);
    const onlyMatchingOption = optionIsPresent(providedOptions, 3, COMMAND_OPTIONS);
    const recursiveOption = optionIsPresent(providedOptions, 4, COMMAND_OPTIONS);
    const lineNumberOption = optionIsPresent(providedOptions, 5, COMMAND_OPTIONS);

    const canIgnoreCase = ignoreCaseOption.valid;
    const canInvertMatch = invertMatchOption.valid;
    const canCountMatches = countMatchesOption.valid;
    const canShowOnlyMatches = onlyMatchingOption.valid;
    const canSearchRecursively = recursiveOption.valid;
    const canShowLineNumber = lineNumberOption.valid;


    if (providedArguments.length < 2) {
        if (providedArguments.length === 0) {
            throw new ExecutionTreeError(
                `Usage: grep [OPTION]... PATTERNS [FILE]...${BREAK_LINE}Try 'grep --help' for more information.`,
                2
            );
        }

        throw new ExecutionTreeError(
            `grep: missing file operand after '${providedArguments[0]}'`,
            2
        );
    }

    const pattern = providedArguments[0];
    const targetPaths = providedArguments.slice(1);

    const {
        environmentVariables,
        fileSystem
    } = systemAPI;

    const currentWorkingDirectory = environmentVariables['PWD'];
    const currentShellUser = environmentVariables['USER'];

    const regexPattern = new RegExp(
        `${canInvertMatch? '^(?!.*' : ''}${pattern}`,
        `g${canIgnoreCase? 'i' : ''}`
    );

    const stdout = [];

    for (const targetPath of targetPaths) {
        const checkedTargetPath = checkProvidedPath(
            targetPath,
            currentWorkingDirectory,
            currentShellUser,
            fileSystem
        );

        const resolvedTargetPath = checkedTargetPath.resolvedPath;

        if (!checkedTargetPath.valid) {
            throw new ExecutionTreeError(
                `grep: ${targetPath}: No such file or directory`,
                2
            );
        }

        if (checkedTargetPath.validAs === 'directory' && !canSearchRecursively) {
            throw new ExecutionTreeError(
                `grep: ${targetPath}: Is a directory`,
                2
            );
        }

        const {
            parentPath,
            targetName
        } = getParentPathAndTargetName(resolvedTargetPath);

        const parentDirectoryData = getDirectoryData(
            parentPath,
            currentWorkingDirectory,
            currentShellUser,
            fileSystem
        );

        const parentDirectoryChildrenDirectories = parentDirectoryData.children.directories;
        const parentDirectoryChildrenFiles = parentDirectoryData.children.files;

        const currentTimestamp = Date.now();

        changeReadingTimestamps(parentDirectoryData, currentTimestamp);

        if (checkedTargetPath.validAs === 'directory') {
            const targetDirectoryIndex = getDirectoryIndex(
                targetName,
                parentDirectoryChildrenDirectories
            );

            const targetDirectoryData = parentDirectoryChildrenDirectories[targetDirectoryIndex];

            const childrenFiles = targetDirectoryData.children.files;
            const childrenDirectories = targetDirectoryData.children.directories;

            const children = [
                ...childrenFiles,
                ...childrenDirectories
            ];

            changeReadingTimestamps(targetDirectoryData, currentTimestamp);

            findForMatchesRecursively(
                children, 
                resolvedTargetPath, 
                stdout, 
                regexPattern, 
                canShowLineNumber, 
                canShowOnlyMatches, 
                canCountMatches
            );
        }
        else {
            const targetFileIndex = getFileIndex(
                targetName,
                parentDirectoryChildrenFiles
            );

            const targetFileData = parentDirectoryChildrenFiles[targetFileIndex];

            const searchResult = searchInFile(
                targetFileData, 
                regexPattern, 
                canShowLineNumber, 
                canShowOnlyMatches,
                canCountMatches
            );

            stdout.push(searchResult);
        }

    }

    return {
        stdout: stdout.join(BREAK_LINE),
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}
export const grep = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'grep', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}