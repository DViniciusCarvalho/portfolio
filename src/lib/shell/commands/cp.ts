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
    changeContentUpdateTimestamps, 
    changeMetadataUpdateTimestamps, 
    changeReadingTimestamps 
} from './common/timestamps';

import { 
    formatHelpPageOptions, 
    helpPageSectionsAssembler 
} from './common/formatters';

import { commandDecorator } from './common/decorator';
import { deepClone } from '@/lib/utils';
import { optionIsPresent } from './common/options';
import { File } from './models/File';
import { Directory } from './models/Directory';
import { ExecutionTreeError } from '../exception';
import { BREAK_LINE } from './common/patterns';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-r',
        long: '--recursive',
        description: 'copy directories recursively'    
    },
    {
        short: null,
        long: '--attributes-only',
        description: 'don\'t copy the file data, just the attributes'     
    },
    {
        short: null,
        long: /^--preserve=(.,)*.+$/,
        description: 'preserve the specified attributes (default: all), if possible additional attributes: links, all (mode,ownership,timestamps)'
    },
    {
        short: null,
        long: /^--no-preserve=(.,)*.+$/,
        description: 'don\'t preserve the specified attributes'
    },
    {
        short: '-a',
        long: '--archive',
        description: 'same as -r --preserve=all'    
    },
    {
        short: '-s',
        long: '--symbolic-link',
        description: 'make symbolic links instead of copying'
    },
    {
        short: '-l',
        long: '--link',
        description: 'hard link files instead of copying'
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

    regexOptionsMapping.set(COMMAND_OPTIONS[2].long, '--preserve=ATTR_LIST');
    regexOptionsMapping.set(COMMAND_OPTIONS[3].long, '--no-preserve=ATTR_LIST');

    const formattedOptions = formatHelpPageOptions(
        COMMAND_OPTIONS, 
        regexOptionsMapping
    );
    
    const name = 'cp - copy files and directories';
    const synopsis = `cp [OPTION]... SOURCE... DIRECTORY${BREAK_LINE}cp [-s|-l] SOURCE [SYM|HARD]LINK`;
    const description = `Copy SOURCE to DIRECTORY, or multiple SOURCE(s) to DIRECTORY or make a HARD or SYM link of SOURCE.${BREAK_LINE}${formattedOptions}`;

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

    const DEFAULT_ATTRIBUTES_TO_PRESERVE = ['mode', 'ownership', 'timestamps']

    const copyRecursivelyOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
    const attrOnlyOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);
    const preserveAttrOption = optionIsPresent(providedOptions, 2, COMMAND_OPTIONS);
    const noPreserveAttrOption = optionIsPresent(providedOptions, 3, COMMAND_OPTIONS);
    const archiveOption = optionIsPresent(providedOptions, 4, COMMAND_OPTIONS);
    const symbolicLinkOption = optionIsPresent(providedOptions, 5, COMMAND_OPTIONS);
    const hardLinkOption = optionIsPresent(providedOptions, 6, COMMAND_OPTIONS);


    const canCopyRecursively = copyRecursivelyOption.valid;
    const canCopyOnlyAttributes = attrOnlyOption.valid;

    const canPreserveAttributes = preserveAttrOption.valid;
    const attributesToPreserve = preserveAttrOption.regExpValuePart;

    const canNotPreserveAttributes = noPreserveAttrOption.valid;
    const attributesToNotPreserve = noPreserveAttrOption.regExpValuePart;

    const canPreserveAllAttributes = archiveOption.valid;
    const canDoSymLinkInsteadOfCopy = symbolicLinkOption.valid;
    const canDoHardLinkInsteadOfCopy = hardLinkOption.valid;


    if (!providedArguments.length) {
        throw new ExecutionTreeError(
            `cp: missing file operand${BREAK_LINE}Try 'cp --help' for more information.`,
            1
        );
    }

    if (providedArguments.length < 2) {
        throw new ExecutionTreeError(
            `cp: missing destination file operand after '${providedArguments[0]}'${BREAK_LINE}Try 'cp --help' for more information.`,
            1
        )
    }

    const {
        environmentVariables,
        fileSystem
    } = systemAPI;

    const currentWorkingDirectory = environmentVariables['PWD'];
    const currentShellUser = environmentVariables['USER'];

    const destination = providedArguments.pop()!;
    const pathsToCopy = providedArguments;

    const providedDestinationPath = checkProvidedPath(
        destination,
        currentWorkingDirectory, 
        currentShellUser,
        fileSystem
    );

    const resolvedDestination = providedDestinationPath.resolvedPath;


    for (const pathToCopy of pathsToCopy) {
        const providedOriginPath = checkProvidedPath(
            pathToCopy,
            currentWorkingDirectory, 
            currentShellUser,
            fileSystem
        );

        const resolvedOrigin = providedOriginPath.resolvedPath;

        if (providedOriginPath.validAs === 'directory' && !canCopyRecursively) {
            throw new ExecutionTreeError(
                `cp: -r not specified; omitting directory '${pathToCopy}'`,
                1
            );
        }

        const originPath = getParentPathAndTargetName(resolvedOrigin);

        const originParentDirectoryData = getDirectoryData(
            originPath.parentPath,
            currentWorkingDirectory,
            currentShellUser,
            fileSystem
        );


        const destinationPath = getParentPathAndTargetName(resolvedDestination);

        const destinationParentDirectoryData = getDirectoryData(
            destinationPath.parentPath, 
            currentWorkingDirectory, 
            currentShellUser, 
            fileSystem
        );

        if (canDoSymLinkInsteadOfCopy || canDoHardLinkInsteadOfCopy) {
            if (providedArguments.length > 2) {
                throw new ExecutionTreeError(
                    `cp: too many arguments, just 2 are accepted`,
                    1
                );
            }

            if (providedDestinationPath.valid) {
                throw new ExecutionTreeError(
                    `cp: : cannot create link '${destination}': File exists`,
                    1
                );
            }

            const currentTimestamp = Date.now();

            if (canDoSymLinkInsteadOfCopy) {
                const symLinkName = destination;
                
                const symLinkFile = new File(
                    symLinkName, 
                    {
                        content: '',
                        size: 0
                    }, 
                    { 
                        is: true, 
                        to: pathToCopy,
                        has: 1 
                    }, 
                    { 
                        group: currentShellUser, 
                        owner: currentShellUser, 
                        permissionOctal: '777'
                    },
                    {
                        access: currentTimestamp,
                        birth: currentTimestamp,
                        change: currentTimestamp,
                        modify: currentTimestamp
                    }
                );

                symLinkFile.data.size = getFileOrDirectoryBytesSize(symLinkFile);
                destinationParentDirectoryData.children.files.push(symLinkFile);
            }
            else {
                const hardLinkName = destination;

                const isFile = providedOriginPath.validAs === 'file';

                if (isFile) {
                    const originFileData = getFileData(
                        originParentDirectoryData,
                        originPath.targetName
                    )!;

                    const hardLinkFile = new File(
                        hardLinkName,
                        originFileData.data,
                        originFileData.links,
                        originFileData.management,
                        originFileData.timestamp
                    );

                    destinationParentDirectoryData.children.files.push(hardLinkFile);

                    originFileData.links.has += 1;
                }
                else {
                    const originDirectoryData = getDirectoryData(
                        resolvedOrigin,
                        currentWorkingDirectory,
                        currentShellUser,
                        fileSystem
                    )!;

                    const hardLinkDirectory = new Directory(
                        hardLinkName,
                        originDirectoryData.data,
                        originDirectoryData.children,
                        originDirectoryData.links,
                        originDirectoryData.management,
                        originDirectoryData.timestamp
                    );

                    destinationParentDirectoryData.children.directories.push(hardLinkDirectory);

                    originDirectoryData.links.has += 1;
                }

                changeMetadataUpdateTimestamps(destinationParentDirectoryData, currentTimestamp);

            }

            changeContentUpdateTimestamps(destinationParentDirectoryData, currentTimestamp);
        }
        else {
            const splittedAttributesToPreserve = attributesToPreserve?.split(',') ?? [];
            const spllitAttributesToNotPreserve = attributesToNotPreserve?.split(',') ?? [];

            const needsToFilterAttr = canPreserveAttributes 
                                      || canNotPreserveAttributes 
                                      && !canPreserveAllAttributes;

            const filteredAttributesToPreserve = needsToFilterAttr ? DEFAULT_ATTRIBUTES_TO_PRESERVE.reduce((
                acc,
                current
            ) => {

                const willBePreserved = splittedAttributesToPreserve.indexOf(current) !== -1;
                const willNotBePreserved = spllitAttributesToNotPreserve.indexOf(current) !== -1;

                if (willBePreserved && !willNotBePreserved) {
                    acc.push(current);
                }

                return acc;
            }, [] as string[]) : DEFAULT_ATTRIBUTES_TO_PRESERVE;

            const canPreserveOwnership = filteredAttributesToPreserve.indexOf('ownership') !== -1;
            const canPreserveMode = filteredAttributesToPreserve.indexOf('mode') !== -1;
            const canPreserveTimestamps = filteredAttributesToPreserve.indexOf('timestamps') !== -1;

            const originFileOrDirectoryData = providedOriginPath.validAs === 'file'
                                              ? getFileData(
                                                    originParentDirectoryData,
                                                    originPath.targetName
                                                )!
                                              : getDirectoryData(
                                                    pathToCopy,
                                                    currentWorkingDirectory,
                                                    currentShellUser,
                                                    fileSystem
                                                );

            const fileOrDirectoryOwner = canPreserveOwnership
                                         ? originFileOrDirectoryData.management.owner
                                         : currentShellUser;

            const fileOrDirectoryGroup = canPreserveOwnership
                                         ? originFileOrDirectoryData.management.group
                                         : currentShellUser;

            const fileOrDirectoryPermissions = canPreserveMode
                                               ? originFileOrDirectoryData.management.permissionOctal
                                               : getFilePermissionOctal(systemAPI.umask);

            const currentTimestamp = Date.now();

            const fileOrDirectoryTimestamps = canPreserveTimestamps
                                              ? deepClone(originFileOrDirectoryData.timestamp)
                                              : {
                                                    birth: currentTimestamp,
                                                    access: currentTimestamp,
                                                    change: currentTimestamp,
                                                    modify: currentTimestamp
                                                };

            const links = {
                is: false,
                has: 1
            };

            const management = {
                owner: fileOrDirectoryOwner,
                group: fileOrDirectoryGroup,
                permissionOctal: fileOrDirectoryPermissions
            };

            const timestamp = fileOrDirectoryTimestamps;

            const destinationDirectoryData = getDirectoryData(
                destination,
                currentWorkingDirectory,
                currentShellUser,
                fileSystem
            );

            const checkedFinalPath = checkProvidedPath(
                `${destination}/${originPath.targetName}`,
                currentWorkingDirectory,
                currentShellUser,
                fileSystem
            );

            if (checkedFinalPath.valid) return;


            if (providedOriginPath.validAs === 'file') {
                if (providedDestinationPath.validAs === 'file') {
                    const destinationFileData = getFileData(
                        destinationParentDirectoryData, 
                        destinationPath.targetName
                    )!;

                    if (!canCopyOnlyAttributes) {
                        destinationFileData.data.content = (originFileOrDirectoryData as File).data.content;
                        changeContentUpdateTimestamps(destinationFileData, currentTimestamp);
                    }
                }
                else {

                    const fileData = canCopyOnlyAttributes
                                     ? { size: 0, content: '' }
                                     : deepClone((originFileOrDirectoryData as File).data);

                    const fileToCopy = new File(
                        originPath.targetName,
                        fileData,
                        links,
                        management,
                        timestamp
                    );

                    fileToCopy.data.size = getFileOrDirectoryBytesSize(fileToCopy);

                    destinationDirectoryData.children.files.push(fileToCopy);

                    changeContentUpdateTimestamps(destinationDirectoryData, currentTimestamp);

                }

            }
            else {
                if (providedDestinationPath.validAs === 'file') {
                    throw new ExecutionTreeError(
                        `cp: cannot overwrite non-directory '${destination}' with directory '${pathToCopy}'`,
                        1
                    )
                }

                const directoryChildren = canCopyOnlyAttributes
                                          ? { directories: [], files: [] }
                                          : deepClone((originFileOrDirectoryData as Directory).children);

                const directoryToCopy = new Directory(
                    originPath.targetName,
                    {
                        size: 0
                    },
                    directoryChildren,
                    links,
                    management,
                    timestamp
                );

                destinationDirectoryData.children.directories.push(directoryToCopy);

                changeContentUpdateTimestamps(destinationDirectoryData, currentTimestamp);

            }

            changeReadingTimestamps(originFileOrDirectoryData, currentTimestamp);

        }
        
    }

    return {
        stdout: '',
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


export const cp = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'cp', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}