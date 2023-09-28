import { Shell } from '@/types/shell';
import { commandHasInvalidOptions, getCommandInvalidOptionMessage, optionIsPresent } from './common/options';
import { ExecutionTreeError } from '../exception';
import { resolveArguments } from './common/arguments';
import { BREAK_LINE } from './common/patterns';
import { getDirectoryData, getFileData } from './common/directoryAndFile';
import { alignLineItems, formatHelpPageOptions, helpPageSectionsAssembler } from './common/formatters';
import { changeReadingTimestamps } from './common/timestamps';
import { commandDecorator } from './common/decorator';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-aux',
        long: null,
        description: 'print every running processes from all the users.'
    },
    {
        short: '-u',
        long: null,
        description: 'print every running processes from a specific user.'
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
    const name = 'ps - report a snapshot of the current processes.';
    const synopsis = 'ps [OPTION...]';
    const description = `Displays information about a selection of the active processes.${BREAK_LINE}${formattedOptions}`;

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

    const printAllUsersProcessesOption = optionIsPresent(providedOptions, 0, COMMAND_OPTIONS);
    const printSpecificUserProcessesOption = optionIsPresent(providedOptions, 1, COMMAND_OPTIONS);

    const canPrintAllUsersProcesses = printAllUsersProcessesOption.valid;
    const canPrintSpecificUserProcesses = printSpecificUserProcessesOption.valid;

    const {
        environmentVariables,
        fileSystem
    } = systemAPI;

    const currentWorkingDirectory = environmentVariables['PWD'];
    const currentShellUser = environmentVariables['USER'];

    const userToFilterProcesses = providedArguments.at(0) ?? currentShellUser;

    const procDirectoryData = getDirectoryData(
        '/proc',
        currentWorkingDirectory,
        currentShellUser,
        fileSystem
    );

    const currentTimestamp = Date.now();

    changeReadingTimestamps(procDirectoryData, currentTimestamp);

    const processesDirectories = procDirectoryData.children.directories;

    const labelLine = canPrintAllUsersProcesses
                      ? 'USER PID START NAME'
                      : 'PID START NAME';

    const stdout = processesDirectories.reduce((
        acc, 
        current
    ) => {

        const processUser = current.management.owner;

        const statusFile = getFileData(
            current,
            'status'
        )!;

        changeReadingTimestamps(current, currentTimestamp);
        changeReadingTimestamps(statusFile, currentTimestamp);

        if (canPrintSpecificUserProcesses && processUser !== userToFilterProcesses) return acc;

        const statusFileLines = statusFile!.data.content.split('\n');

        const statusFileNameLine = statusFileLines[0];
        const statusFilePIDLine = statusFileLines[1];
        const statusFileStartLine = statusFileLines[2];

        const processName = statusFileNameLine.split('\t')[1];
        const processPID = statusFilePIDLine.split('\t')[1];
        const processStart = statusFileStartLine.split('\t')[1];

        const lineAccumulator = labelLine;

        const lineWithUser = lineAccumulator.replace('USER', processUser);
        const lineWithPID = lineWithUser.replace('PID', processPID);
        const lineWithStart = lineWithPID.replace('START', processStart);
        const lineWithName = lineWithStart.replace('NAME', processName);

        acc.push(lineWithName);

        return acc;

    }, [labelLine] as string[]);

    const formattedLines = alignLineItems(stdout, ' ', 'right');

    return {
        stdout: formattedLines.join(BREAK_LINE),
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


export const ps = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'ps', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}