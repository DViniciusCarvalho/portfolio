import { Shell } from '@/types/shell';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    targetIsDirectory
} from './common/directoryAndFile';

import { 
    isExactlySizeValue, 
    isGreaterThanSizeValue, 
    isLessThanSizeValue
} from './common/size';

import { 
    changeReadingTimestamps,
    isExactlyDaysValue, 
    isGreaterThanDaysValue, 
    isLessThanDaysValue 
} from './common/timestamps';

import { 
    formatHelpPageOptions, 
    helpPageSectionsAssembler 
} from './common/formatters';

import { commandDecorator } from './common/decorator';
import { Directory } from './models/Directory';
import { File } from './models/File';
import { ExecutionTreeError } from '../exception';

import { 
    ALL_CHARACTERS_PATTERN, 
    ALL_PERMISSIONS_PATTERN, 
    BREAK_LINE 
} from './common/patterns';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-type',
        long: null,
        description: 'find the file or directory by its type: f (file), d (directory) or l (symlink)'
    },
    {
        short:'-perm',
        long: null,
        description: 'find the file or directory by its permissions in octal. e.g. \'-perm 644\''
    },
    {
        short: '-user',
        long: null,
        description: 'find the file or directory by its owner'
    },
    {
        short: '-group',
        long: null,
        description: 'find the file or directory by its group'
    },
    {
        short: '-size',
        long: null,
        description: 'find the file or directory by its size. e.g. \'-size 11G\' for exactly 11GB,\'-size +10M\' for sizes greater than 10MB or \'-size -10K\' for sizes less than 10KB'
    },
    {
        short:'-mtime',
        long: null,
        description: 'find the file or directory based on the days elapsed since its last modification. e.g. \'-mtime 8\' for exactly 8 days, \'-mtime -15\' for less than 15 days or \'-mtime +9\' for grater than 9 days'
    },
    {
        short: '-name',
        long:  null,
        description: 'find the file or directory by its name'
    },
    {
        short: '-maxdepth',
        long: null,
        description: 'find the file or directory at most at n levels, n is a natural number {0, 1, 2, ..., +∞}. e.g. \'-maxdepth 4\' to find at a depth of 4 directories'
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
    const name = 'find - search for files in a directory hierarchy';
    const synopsis = 'find [STARTING-POINT] [SEARCH-RULE]...';
    const description = `Searches for files and directories according to the SEARCH-RULES and starts the search from the STARTING-POINT.${BREAK_LINE}${formattedOptions}`;

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


const getValidatedTypePattern = (
    criteria: {[key: string]: string}
): RegExp => {
    const ALL_TYPES_PATTERN = /^[FfDdLl].*$/;

    const hasTypeOption = '-type' in criteria;

    const type = criteria['-type'] ?? null;

    if (hasTypeOption && !type.match(ALL_TYPES_PATTERN)) {
        throw new ExecutionTreeError(
            `find: invalid type '${type}', just [FfDdLl] are accepted`,
            1
        );
    }

    return hasTypeOption
           ? new RegExp(`^[${type.toUpperCase()}${type.toLowerCase()}].*$`)
           : ALL_TYPES_PATTERN;
}


const getValidatedPermissionPattern = (
    criteria: {[key: string]: string}
): RegExp => {

    const hasPermissionOption = '-perm' in criteria;

    const permission = criteria['-perm'] ?? null;

    if (hasPermissionOption && !permission.match(ALL_PERMISSIONS_PATTERN)) {
        throw new ExecutionTreeError(
            `find: invalid permission '${permission}', just octals are accepted `,
            1
        );
    }

    return hasPermissionOption? new RegExp(`^${permission}$`) : ALL_PERMISSIONS_PATTERN;
}


const getPatternRegEx = (
    stringSentence: string
): RegExp => {
    const ASTERISK_SUBSTITUTION = '.*';

    stringSentence.replace('*', ASTERISK_SUBSTITUTION);

    const regEx = new RegExp(`^${stringSentence}$`);

    return regEx;
}


const returnAlwaysTrue = (...args: any[]): true => true;


const getSizeTestingFunction = (
    size: string
) => {

    const isGreaterThanTesting = size.startsWith('+');
    const isLessThanTesting = size.startsWith('-');

    const isIntervalTesting = isGreaterThanTesting || isLessThanTesting;

    const functionAddressToCurry = isIntervalTesting
                                   ? isGreaterThanTesting? isGreaterThanSizeValue : isLessThanSizeValue
                                   : isExactlySizeValue;

    const sizeToCompareInString = isIntervalTesting
                                  ? size.replace(isGreaterThanTesting? /^\+/ : /^\-/, '')
                                  : size;

    const isInvalidNumber = isNaN(Number(sizeToCompareInString));

    if (isInvalidNumber) {
        throw new ExecutionTreeError(
            `find: invalid size '${size}', must be in number format with just the prefix like 'K, M, G, T, P' as string. e.g. '10M', '3G'`,
            1
        );
    }

    return (size: number) => functionAddressToCurry(size, sizeToCompareInString);

}


const getMtimeTestingFunction = (
    modificationTime: string
) => {

    const isGreaterThanTesting = modificationTime.startsWith('+');
    const isLessThanTesting = modificationTime.startsWith('-');

    const isIntervalTesting = isGreaterThanTesting || isLessThanTesting;

    const functionAddressToCurry = isIntervalTesting
                                   ? isGreaterThanTesting? isGreaterThanDaysValue : isLessThanDaysValue
                                   : isExactlyDaysValue;

    const daysToCompareInString = isIntervalTesting
                                 ? modificationTime.replace(isGreaterThanTesting? /^\+/ : /^\-/, '')
                                 : modificationTime;

    const isInvalidNumber = isNaN(Number(daysToCompareInString));

    if (isInvalidNumber) {
        throw new ExecutionTreeError(
            `find: invalid days interval '${modificationTime}', must be a natural number {0, 1, 2, ..., +∞}`,
            1
        );
    }

    return (currentTimestamp: number, targetTimestamp: number) => functionAddressToCurry(
        currentTimestamp, 
        targetTimestamp,
        Number(daysToCompareInString)
    );
}


const getIsInTheDepthRangeCheckerFunction = (
    maxDepth: string
) => {

    const numberMaxDepth = parseInt(maxDepth, 10);

    return (depthAcc: number) => depthAcc <= numberMaxDepth;

}


const main = (
    providedOptions: string[],
    providedArguments: string[],
    systemAPI: Shell.SystemAPI
) => {

    const DEFAULT_START_PATH = '.';

    const startPathWasProvided = providedOptions.length
                                 ? providedArguments.length === providedOptions.length + 1
                                 : !!providedArguments.length;

    const {
        environmentVariables,
        fileSystem
    } = systemAPI;

    const currentWorkingDirectory = environmentVariables['PWD'];
    const currentShellUser = environmentVariables['USER'];

    const startPath = startPathWasProvided? providedArguments[0] : DEFAULT_START_PATH;

    const checkedStartPath = checkProvidedPath(
        startPath,
        currentWorkingDirectory,
        currentShellUser,
        fileSystem
    );

    if (startPathWasProvided && !checkedStartPath.valid) {
        throw new ExecutionTreeError(
            `find: '${startPath}': No such file or directory`,
            1
        );
    }

    const startOptionValueIndex = startPathWasProvided? 1 : 0;

    const criteria = providedOptions.reduce((
        acc,
        current,
        index
    ) => {
        acc[current] = providedArguments[index + startOptionValueIndex];

        return acc;
    }, {} as any);

    const startPathData = getDirectoryData(
        startPath,
        currentWorkingDirectory,
        currentShellUser,
        fileSystem
    );

    const currentTimestamp = Date.now();

    changeReadingTimestamps(startPathData, currentTimestamp);

    const typePatternToTest = getValidatedTypePattern(criteria);
    const permissionPatternToTest = getValidatedPermissionPattern(criteria);

    const userPatternToTest = '-user' in criteria
                              ? getPatternRegEx(criteria['-user'])  
                              : ALL_CHARACTERS_PATTERN;

    const groupPatternToTest = '-group' in criteria
                               ? getPatternRegEx(criteria['-group'])
                               : ALL_CHARACTERS_PATTERN;

    const sizeFunctionToTest = '-size' in criteria
                               ? getSizeTestingFunction(criteria['-size'])
                               : returnAlwaysTrue;
    
    const mtimeFunctionToTest = '-mtime' in criteria
                                ? getMtimeTestingFunction(criteria['-mtime']) 
                                : returnAlwaysTrue;
                                                    
    const namePatternToTest = '-name' in criteria
                              ? getPatternRegEx(criteria['-name']) 
                              : ALL_CHARACTERS_PATTERN;

    const maxDepthFunctionToTest = '-maxdepth' in criteria
                                   ? getIsInTheDepthRangeCheckerFunction(criteria['-maxdepth'])
                                   : returnAlwaysTrue;

    const stdoutLines: string[] = [];

    const startPathFilesAndDirectories = [
        ...startPathData.children.files,
        ...startPathData.children.directories
    ];
    
    const INITIAL_DEPTH = 1;

    const findRecursively = (
        pathFilesAndDirectories: (Directory | File)[],
        pathAcc: string,
        depthAcc: number
    ) => {

        for (let index = 0; index < pathFilesAndDirectories.length; index++) {
            const fileOrDirectory = pathFilesAndDirectories[index];

            const type = targetIsDirectory(fileOrDirectory)? 'd' : 'f';
            const isSymLink = fileOrDirectory.links.is;

            const permission = fileOrDirectory.management.permissionOctal;
            const owner = fileOrDirectory.management.owner;
            const group = fileOrDirectory.management.group;
            const size = fileOrDirectory.data.size;
            const mtime = fileOrDirectory.timestamp.modify;
            const name = fileOrDirectory.name;

            const currentTimestamp = Date.now();

            const typeOptionIsPresent = '-type' in criteria;

            const typeDoesNotMatch = typeOptionIsPresent
                                     && ((typePatternToTest.test('l') && !isSymLink)
                                     || (typePatternToTest.test('f') && type !== 'f')
                                     || (typePatternToTest.test('d') && type !== 'd'));

            const permissionDoesNotMatch = !permission.match(permissionPatternToTest);
            const ownerDoesNotMatch = !owner.match(userPatternToTest);
            const groupDoesNotMatch = !group.match(groupPatternToTest);
            const sizeDoesNotMatch = !sizeFunctionToTest(size);
            const mtimeDoesNotMatch = !mtimeFunctionToTest(currentTimestamp, mtime);
            const nameDoesNotMatch = !name.match(namePatternToTest);

            if (!maxDepthFunctionToTest(depthAcc)) break;

            if (typeDoesNotMatch) continue;
            if (permissionDoesNotMatch) continue;
            if (ownerDoesNotMatch) continue;
            if (groupDoesNotMatch) continue;
            if (sizeDoesNotMatch) continue;
            if (mtimeDoesNotMatch) continue;
            if (nameDoesNotMatch) continue;

            const fullPath = `${pathAcc === '/'? '' : pathAcc}/${name}`;

            stdoutLines.push(fullPath);

            changeReadingTimestamps(fileOrDirectory, currentTimestamp);

            if (type === 'd') {
                const pathFilesAndDirectories = [
                    ...(fileOrDirectory as Directory).children.files,
                    ...(fileOrDirectory as Directory).children.directories
                ];

                findRecursively(pathFilesAndDirectories, fullPath, depthAcc + 1);
            }

        }

        return;
    }

    findRecursively(startPathFilesAndDirectories, startPath, INITIAL_DEPTH);

    return {
        stdout: stdoutLines.join(BREAK_LINE),
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


export const find = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'find', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}