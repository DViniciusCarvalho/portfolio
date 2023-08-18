import { Shell } from "@/types/shell";
import { 
    checkOption,
    commandHasInvalidOptions, 
    getCommandInvalidOptionMessage,
    optionIsPresent
} from "./common/options";
import { 
    getCommandArguments 
} from "./common/arguments";
import { ExecutionTreeError } from "../exception";
import { checkProvidedPath, getDirectoryData, getFileData, resolveOctalPermissionInDrx } from "./common/directoryAndFile";
import { Data } from "@/types/data";
import { getSizeNotation } from "./common/size";
import { Directory } from "./models/Directory";

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


const getAllDirectoryLines = (
    directoryData: Data.SystemDirectory,
    LS_COLORS: string[],
    canShowDetailedInfo: boolean,
    canShowInAHumanReadableWay: boolean
) => {

    const childDirectories = directoryData.children.directories;
    const childFiles = directoryData.children.files;

    const directoryChildren = [ ...childDirectories, ...childFiles ];

    console.log(directoryChildren)

    const stdout = directoryChildren.reduce((
        acc, 
        current,
        idx, 
        arr
    ) => {

        console.log('passei 1x')
        const isLastIndex = idx === arr.length - 1;

        const type = current instanceof Directory? 'directory' : 'file';

        const line = getLsStdoutLine(
            type, 
            current, 
            LS_COLORS, 
            canShowDetailedInfo, 
            canShowInAHumanReadableWay
        );

        const lineFormatted = isLastIndex? line : `${line}!<break_line>!`;

        acc += lineFormatted;

        return acc;

    }, ''); 

    return stdout;
}


const getLsStdoutLine = (
    type: string,
    data: Data.SystemDirectory | Data.SystemFile,
    colors: string[],
    canShowDetailedInfo: boolean,
    canShowInAHumanReadableWay: boolean
) => {

    const color = '#cccccc';
    const coloredFileOrDirectoryName = `!<span<${color}>>!${data.name}!<\\span>!`;

    if (canShowDetailedInfo) {
        const isDirectory = data instanceof Directory;
        const isSymLink = data.links.is;

        const permissionsFirstLetter = isDirectory? 'd' : (isSymLink? 'l' : '-');

        const resolvedPermissions = resolveOctalPermissionInDrx(data.management.permissionOctal);

        const permissions = `${permissionsFirstLetter}${resolvedPermissions}`;
        const links = data.links.has;
        const owner = data.management.owner;
        const group = data.management.group;
        const size = canShowInAHumanReadableWay? getSizeNotation(data.size) : data.size;

        const modifDate = new Date(data.timestamp.modify);

        const month = modifDate.toLocaleDateString('en-us', { month: 'short' }).toLowerCase();
        const monthDay = modifDate.toLocaleDateString('en-us', { day: '2-digit' });
    
        const hours = modifDate.getHours().toString().padStart(2, '0');
        const minutes = modifDate.getMinutes().toString().padStart(2, '0');

        return `${permissions}  ${links}  ${owner}  ${group}  ${size}  ${month}  ${monthDay}  ${hours}:${minutes}  ${coloredFileOrDirectoryName}`;

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
            stderr: getCommandInvalidOptionMessage('echo', invalidOptions, 'echo --help'),
            exitStatus: 2,
            modifiedSystemAPI: systemAPI
        };
    }

    const providedOptions = commandOptions.map(opt => opt.value);
    const hasHelpOption = !!providedOptions.find(opt => opt === '--help');

    if (hasHelpOption) {
        return help(systemAPI);
    }

    const argumentsValue = getCommandArguments(commandArguments, stdin);

    try {
        const LS_COLORS = ['#00000', '#ffffff'];

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
            argumentsValue.push('.')
        }

        const stdout = argumentsValue.reduce((
            acc,
            current,
            idx,
            arr
        ) => {

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

            const directoryData = getDirectoryData(
                current, 
                cwd,
                currentUser,
                fileSystem
            );


            if (providedPath.validAs === 'file') {
                acc += '';
            }
            else {
                const directoryData = getDirectoryData(
                    current,
                    cwd,
                    currentUser,
                    fileSystem
                );

                console.log(directoryData)

                const stdout = getAllDirectoryLines(
                    directoryData,
                    LS_COLORS, 
                    canShowDetailedInfo, 
                    canShowInAHumanReadableWay
                );
                
                const startOfListing = hasMoreThanOneArgument
                                        ? `${directoryData.name}:!<break_line>!`
                                        : '';

                acc += `${startOfListing}${stdout}${idx !== arr.length - 1? '!<break_line>!!<break_line>!' : ''}`;
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