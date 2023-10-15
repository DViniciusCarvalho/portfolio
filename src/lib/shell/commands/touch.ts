import { Shell } from '@/types/shell';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getFileData, 
    getFileOrDirectoryBytesSize, 
    getFilePermissionOctal,
    getParentPathAndTargetName
} from './common/directoryAndFile';

import { 
    formatHelpPageOptions, 
    helpPageSectionsAssembler 
} from './common/formatters';

import { optionIsPresent } from './common/options';
import { changeContentUpdateTimestamps } from './common/timestamps';
import { commandDecorator } from './common/decorator';
import { File } from './models/File';
import { ExecutionTreeError } from '../exception';
import { BREAK_LINE } from './common/patterns';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-c',
        long: '--no-create',
        description: 'do not create any files'
    },
    {
        short: '-a',
        long: null,
        description: 'change only the access time'
    },
    {
        short: null,
        long: /^--date=.+$/,
        description: 'parse STRING and use it instead of current time'
    },
    {
        short: '-m',
        long: null,
        description: 'change only the modification time'
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

    regexOptionsMapping.set(COMMAND_OPTIONS[2].long, '--date=STRING');

    const formattedOptions = formatHelpPageOptions(
        COMMAND_OPTIONS, 
        regexOptionsMapping
    );

    const name = 'touch - change file timestamps';
    const synopsis = 'touch [OPTION]... FILE...';
    const description = `Update the access and modification times of each FILE to the current time.${BREAK_LINE}A FILE argument that does not exist is created empty, unless -c is supplied.${BREAK_LINE}${formattedOptions}`;

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

    const {
        environmentVariables,
        fileSystem
    } = systemAPI;
    
    const currentWorkingDirectory = environmentVariables['PWD'];
    const currentShellUser = environmentVariables['USER'];

    const noCreateOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
    const onlyAtimeOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);
    const dateOption = optionIsPresent(providedOptions, 2, COMMAND_OPTIONS);
    const onlyMtimeOption = optionIsPresent(providedOptions, 3, COMMAND_OPTIONS);

    const canNotCreateFile = noCreateOption.valid;
    const canModifyJustAtime = onlyAtimeOption.valid;
    const canParseADateInsteadOfCurrent = dateOption.valid;

    const canModifyJustMtime = onlyMtimeOption.valid 
                               || (!canModifyJustAtime && !onlyMtimeOption.valid);

    const dateRegexPart = dateOption.regExpValuePart;

    const filePaths = providedArguments;

    for (const filePath of filePaths) {
        const checkedFilePath = checkProvidedPath(
            filePath, 
            currentWorkingDirectory, 
            currentShellUser, 
            fileSystem
        );

        if (checkedFilePath.insideFileError) {
            throw new ExecutionTreeError(
                `touch: cannot touch '${filePath}': Not a directory`,
                1
            );
        }

        const { 
            parentPath, 
            targetName 
        } = getParentPathAndTargetName(checkedFilePath.resolvedPath);

        const checkedParentDirectoryPath = checkProvidedPath(
            parentPath,
            currentWorkingDirectory,
            currentShellUser,
            fileSystem
        );

        if (!checkedParentDirectoryPath.valid) {
            throw new ExecutionTreeError(
                `touch: cannot touch '${filePath}': No such file or directory`,
                1
            );
        }

        const parentDirectoryPath = checkedParentDirectoryPath.resolvedPath;

        const parentDirectory = getDirectoryData(
            parentDirectoryPath, 
            currentWorkingDirectory, 
            currentShellUser, 
            fileSystem
        );

        const fileExists = checkedFilePath.valid;

        const currentTimestamp = Date.now();

        if (fileExists) {
            const fileData = getFileData(
                parentDirectory,
                targetName
            )!;

            const time = canParseADateInsteadOfCurrent
                         ? new Date(dateRegexPart!.replace(/[^[\"\']|[\"\'$]]/, '')).getTime()
                         : currentTimestamp;

            if (canModifyJustMtime) {
                fileData.timestamp.modify = time;
            }
            else if (canModifyJustAtime) {
                fileData.timestamp.access = time;
            }
        }
        else if (!canNotCreateFile) {
            const filePermission = getFilePermissionOctal(systemAPI.umask);

            const file = new File(
                targetName, 
                {
                    content: '',
                    size: 0
                },
                { 
                    is: false, 
                    has: 1 
                }, 
                { 
                    group: currentShellUser, 
                    owner: currentShellUser, 
                    permissionOctal: filePermission
                },
                {
                    access: currentTimestamp,
                    birth: currentTimestamp,
                    change: currentTimestamp,
                    modify: currentTimestamp
                }
            );

            file.data.size = getFileOrDirectoryBytesSize(file);
            parentDirectory.children.files.push(file);

            changeContentUpdateTimestamps(parentDirectory, currentTimestamp);
        }
    }

    return {
        stdout: '',
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


export const touch = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'touch', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}