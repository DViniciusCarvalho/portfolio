import { Shell } from '@/types/shell';

import { 
    commandHasInvalidOptions, 
    getCommandInvalidOptionMessage,
    optionIsPresent
} from './common/options';

import { 
    resolveArguments 
} from './common/arguments';

import { ExecutionTreeError } from '../exception';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getFileData, 
    getParentPathAndTargetName, 
    resolveOctalPermissionInSymbolicFormat, 
    targetIsDirectory
} from './common/directoryAndFile';

import { getSizeNotation } from './common/size';
import { Directory } from './models/Directory';
import { File } from './models/File';
import { changeReadingTimestamps } from './common/timestamps';
import { BREAK_LINE, COLORED_WORD_TEMPLATE } from './common/patterns';
import { alignLineItems } from './common/formatters';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-a',
        long: '--all',
        description: 'do not ignore entries starting with .'
    },
    {
        short: '-l',
        long: null,
        description: 'use a long listing format'
    },
    {
        short: '-S',
        long: null,
        description: 'sort by file size, largest first'
    },
    {
        short: '-h',
        long: '--human-readable',
        description: 'with -l and -s, print sizes like 1K 234M 2G etc.'
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


const getSortedFilesAndDirectories = (
    filesAndDirectories: (Directory | File)[], 
    canSortBySize: boolean
) => {
    return filesAndDirectories.sort((a, b) => 
        canSortBySize
        ? b.data.size - a.data.size 
        : a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
}


const getAllDirectoryLines = (
    directoryData: Directory,
    LS_COLORS: {[key: string]: string},
    canShowDetailedInfo: boolean,
    canShowInAHumanReadableWay: boolean,
    canShowDotFiles: boolean,
    canSortBySize: boolean
) => {

    const childDirectories = directoryData.children.directories;
    const childFiles = directoryData.children.files;

    const directoryChildren = [ ...childDirectories, ...childFiles ];

    const filteredData = canShowDotFiles
                         ? directoryChildren 
                         : directoryChildren.filter(dirOrFile => !dirOrFile.name.startsWith('.'));

    const sortedFilesAndDirectories = getSortedFilesAndDirectories(
        filteredData, 
        canSortBySize
    );

    const stdout = sortedFilesAndDirectories.reduce((
        acc: string[], 
        current,
        idx, 
        arr
    ) => {

        const isLastLine = idx === arr.length - 1;

        const isDirectory = targetIsDirectory(current);

        const line = getLsStdoutLine(
            isDirectory, 
            current, 
            LS_COLORS, 
            canShowDetailedInfo, 
            canShowInAHumanReadableWay
        );

        acc.push(line);

        return acc;

    }, []); 

    const formattedLines = alignLineItems(stdout, '  ', 'right');

    return formattedLines.join(BREAK_LINE);
}


const getLsColorsObject = (
    env: Shell.EnvironmentVariables
) => {

    const colorsString = env['LS_COLORS'];

    const splittedColorsString = colorsString.split(':') as string[];

    const colorsObject = splittedColorsString.reduce((
        acc: {[key: string]: string},
        current
    ) => {

        const equalIndex = current.indexOf('=');

        const key = current.slice(0, equalIndex);
        const value = current.slice(equalIndex + 1);

        acc[key] = value;

        return acc;
    }, {});

    return colorsObject;
}


const getDirectoryFileColorKey = (
    isDirectory: boolean,
    fileOrDirectory: Directory | File
): string => {

    const isSymLink = fileOrDirectory.links.is;
    const hasSpecialBit = fileOrDirectory.management.permissionOctal[0] !== '0';

    if (isSymLink) return 'sl';
    if (hasSpecialBit) return 'sb';

    return isDirectory? 'di' : getFileTypeColorKey(fileOrDirectory.name);
}


const getFileTypeColorKey = (
    fileName: string
): string => {

    const FILE_EXTENSION_PATTERN = /.+\..+$/g;

    if (fileName.match(FILE_EXTENSION_PATTERN)) {
        const dotIndex = fileName.lastIndexOf('.');
        const fileExtension = fileName.slice(dotIndex);

        return `*${fileExtension}`;
    }

    return 'rf';
}


const fillWithSpacesToAlign = (
    target: string | number, 
    maxLength: number
): string => {
    return String(target).padStart(maxLength, ' ');
}


const getLsStdoutLine = (
    isDirectory: boolean,
    fileOrDirectory: Directory | File,
    colors: {[key: string]: string},
    canShowDetailedInfo: boolean,
    canShowInAHumanReadableWay: boolean
) => {

    const LS_LINE_MODEL = 'perm  links  owner  group  size  month  monthDay  hours:minutes  name';

    const isSymLink = fileOrDirectory.links.is;

    const colorKey = getDirectoryFileColorKey(isDirectory, fileOrDirectory);

    const color = colors[colorKey];
    const coloredFileOrDirectoryName = COLORED_WORD_TEMPLATE
                                       .replace('[COLOR]', color)
                                       .replace('[CONTENT]', fileOrDirectory.name);


    if (canShowDetailedInfo) {
        const permissionsFirstLetter = isDirectory? 'd' : (isSymLink? 'l' : '-');

        const resolvedPermissions = resolveOctalPermissionInSymbolicFormat(
            fileOrDirectory.management.permissionOctal
        );

        const permissions = `${permissionsFirstLetter}${resolvedPermissions}`;

        const links = fileOrDirectory.links.has;
        const isSymLinkTo = fileOrDirectory.links.to;
        const owner = fileOrDirectory.management.owner;
        const group = fileOrDirectory.management.group;

        const size = canShowInAHumanReadableWay
                     ? getSizeNotation(fileOrDirectory.data.size) 
                     : fileOrDirectory.data.size;

        const modifyDate = new Date(fileOrDirectory.timestamp.modify);

        const month = modifyDate.toLocaleDateString('en-us', { month: 'short' }).toLowerCase();
        const monthDay = modifyDate.toLocaleDateString('en-us', { day: '2-digit' });
    
        const hours = modifyDate.getHours().toString().padStart(2, '0');
        const minutes = modifyDate.getMinutes().toString().padStart(2, '0');

        const nameSuffix = isSymLink? ` -> ${isSymLinkTo}` : '';
        const name = `${coloredFileOrDirectoryName}${nameSuffix}`;

        const lineWithPerm = LS_LINE_MODEL.replace('perm', permissions);
        const lineWithLinks = lineWithPerm.replace('links', links.toString());
        const lineWithOwner = lineWithLinks.replace('owner', owner);
        const lineWithGroup = lineWithOwner.replace('group', group);
        const lineWithSize = lineWithGroup.replace('size', size.toString());
        const lineWithMonth = lineWithSize.replace('month', month);
        const lineWithMonthDay = lineWithMonth.replace('monthDay', monthDay);
        const lineWithHours = lineWithMonthDay.replace('hours', hours);
        const lineWithMinutes = lineWithHours.replace('minutes', minutes);
        const lineWithName = lineWithMinutes.replace('name', name);

        return lineWithName;

    }


    return `${coloredFileOrDirectoryName}`;
}


export const ls = (    
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
            stderr: getCommandInvalidOptionMessage('ls', invalidOptions),
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

        const LS_COLORS = getLsColorsObject(systemAPI.environmentVariables);

        const allEntriesOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
        const longListingOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);
        const sizeSortingOption = optionIsPresent(providedOptions, 2, COMMAND_OPTIONS);
        const humanReadableOption = optionIsPresent(providedOptions, 3, COMMAND_OPTIONS);

        const canShowDotFiles = allEntriesOption.valid;
        const canShowDetailedInfo = longListingOption.valid;
        const canSortBySize = sizeSortingOption.valid;
        const canShowInAHumanReadableWay = humanReadableOption.valid;

        const hasMoreThanOneArgument = argumentsValue.length > 1;

        const cwd = systemAPI.environmentVariables['PWD'];
        const currentUser = systemAPI.currentShellUser;
        const fileSystem = systemAPI.fileSystem;

        if (!argumentsValue.length) {
            argumentsValue.push('.');
        }

        const stdout = argumentsValue.reduce((
            acc,
            current,
            index,
            array
        ) => {

            const isLastLine = index !== array.length - 1;

            const providedPath = checkProvidedPath(
                current,
                cwd,
                currentUser,
                fileSystem
            );

            if (!providedPath.valid) {
                throw new ExecutionTreeError(
                    `ls: cannot access '${current}': No such file or directory`,
                    2
                );
            }

            const currentTimestamp = Date.now();

            if (providedPath.validAs === 'file') {
                const {
                    parentPath,
                    targetName
                } = getParentPathAndTargetName(providedPath.resolvedPath);

                const parentDirectoryData = getDirectoryData(
                    parentPath, 
                    cwd,
                    currentUser,
                    fileSystem
                );

                const fileData = getFileData(parentDirectoryData, targetName)!;

                const line = getLsStdoutLine(
                    false, 
                    fileData, 
                    LS_COLORS, 
                    canShowDetailedInfo, 
                    canShowInAHumanReadableWay
                );

                acc += `${line}${isLastLine? `${BREAK_LINE}${BREAK_LINE}` : ''}`;

                changeReadingTimestamps(parentDirectoryData, currentTimestamp);
            }
            else {
                const directoryData = getDirectoryData(
                    current,
                    cwd,
                    currentUser,
                    fileSystem
                );

                const stdout = getAllDirectoryLines(
                    directoryData,
                    LS_COLORS, 
                    canShowDetailedInfo, 
                    canShowInAHumanReadableWay,
                    canShowDotFiles,
                    canSortBySize
                );
                
                const startOfListing = hasMoreThanOneArgument
                                        ? `${directoryData.name}:${BREAK_LINE}`
                                        : '';

                acc += `${startOfListing}${stdout}${isLastLine? `${BREAK_LINE}${BREAK_LINE}` : ''}`;

                changeReadingTimestamps(directoryData, currentTimestamp);
            }

            return acc;
            
        }, '');

        return {
            stdout: stdout,
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