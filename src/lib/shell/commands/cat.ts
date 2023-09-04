import { Shell } from '@/types/shell';

import { 
    commandHasInvalidOptions, 
    getCommandInvalidOptionMessage 
} from './common/options';

import { resolveArguments } from './common/arguments';
import { ExecutionTreeError } from '../exception';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getFileData, 
    getParentPathAndTargetName 
} from './common/directoryAndFile';
import { BREAK_LINE } from './common/patterns';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
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


export const cat = (    
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
            stderr: getCommandInvalidOptionMessage('cat', invalidOptions),
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

        if (!argumentsValue.length) {
            throw new ExecutionTreeError(
                `cat: no input provided, you need to provide an input`,
                1
            );
        }

        const cwd = systemAPI.environmentVariables['PWD'];
        const currentUser = systemAPI.currentShellUser;
        const fileSystem = systemAPI.fileSystem;

        const stdout = argumentsValue.reduce((
            acc,
            current,
            index,
            array
        ) => {

            const isLastInput = index === array.length - 1;

            const providedPath = checkProvidedPath(
                current,
                cwd,
                currentUser,
                fileSystem
            );

            if (!providedPath.valid) {
                throw new ExecutionTreeError(
                    `cat: ${current}: No such file or directory`,
                    1
                );
            }


            if (providedPath.validAs === 'directory') {
                throw new ExecutionTreeError(
                    `cat: ${current}: Is a directory`,
                    1
                );
            }
            else if (providedPath.validAs === 'file') {
    
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
    
                const fileData = getFileData(
                    parentDirectoryData,
                    targetName
                )!;
    
                const fileContent = fileData.data.content;
    
                acc += `${fileContent}${isLastInput? '' : fileContent === '' ? '' : BREAK_LINE}`;
    
                return acc;
            }


        }, '');

        return {
            stdout: stdout,
            stderr: null,
            exitStatus: 0,
            modifiedSystemAPI: systemAPI
        };
    }
    catch(err: unknown) {
        const errorObject = err as ExecutionTreeError;

        return {
            stdout: null,
            stderr: errorObject.errorMessage,
            exitStatus: errorObject.errorStatus,
            modifiedSystemAPI: systemAPI
        };
    }

}