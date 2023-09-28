import { Shell } from '@/types/shell';
import { commandHasInvalidOptions, getCommandInvalidOptionMessage } from './common/options';
import { ExecutionTreeError } from '../exception';
import { Data } from '@/types/data';
import { resolveArguments } from './common/arguments';
import { BREAK_LINE, POSITIVE_INTEGER_PATTERN } from './common/patterns';
import { formatHelpPageOptions, helpPageSectionsAssembler } from './common/formatters';
import { commandDecorator } from './common/decorator';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-l',
        long: '--list',
        description: 'list signal names.'
    },
    {
        short: null,
        long: /-[A-Za-z0-9]+/,
        description: 'specify the signal number to be sent, just integers are accepted.'
    },
    {
        short: '-s',
        long: '--signal',
        description: 'alternative way to specify the signal to be sent, just integers are accepted.'
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

    regexOptionsMapping.set(COMMAND_OPTIONS[1].long, '-[signal]');

    const formattedOptions = formatHelpPageOptions(
        COMMAND_OPTIONS, 
        regexOptionsMapping
    );

    const name = 'kill - send a signal to a process';
    const synopsis = 'kill [OPTION...] [PID...]';
    const description = `Send a signal to every PID listed. The default signal is KILL (9).${BREAK_LINE}${formattedOptions}`;

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


const listSignals = (
    systemAPI: Shell.SystemAPI
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {
    return {
        stdout: '',
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


const getSignalHandler = (
    providedSignal: number | string, 
    signalMapping: Shell.Signal[]
): any => {

    const signalObjectFound = signalMapping.find(signal => 
        signal.number === providedSignal 
        || signal.name.toLowerCase() === (providedSignal as string).toLowerCase()
    );

    return signalObjectFound?.handler;
}


const isExistingPID = (
    providedPID: number,
    runningProcesses: Data.OpennedProcessData[]
): boolean => {

    const processPIDOwnerFound = runningProcesses.find(process => {
        return process.PID === providedPID;
    });

    return !!processPIDOwnerFound;
}


const main = (
    providedOptions: string[],
    providedArguments: string[],
    systemAPI: Shell.SystemAPI
) => {

    const {
        opennedProcessesData,
        finishGraphicalProcess
    } = systemAPI;

    const SIGNAL_HANDLER_AND_NAME_MAPPING: Shell.Signal[] = [
        {
            number: 9,
            name: 'SIGKILL',
            handler: finishGraphicalProcess
        },
    ];

    const DASH_SIGNAL_PATTERN = /^-[A-Za-z0-9]+/;

    const hasOptions = !!providedOptions.length;
    const hasArguments = !!providedArguments.length;

    if (!hasArguments) {
        throw new ExecutionTreeError(
            'kill: usage: \'kill [-<signal> | -s <signal> | --signal <signal>] <PID>\' ',
            2
        );
    }

    if (hasOptions) {
        const firstOptionValue = providedOptions[0];

        const isListOption = firstOptionValue === '-l' || firstOptionValue === '--list';
        const isShortSignalOption = firstOptionValue === '-s';
        const isLongSignalOption = firstOptionValue === '--signal';
        const isDashSignalOption = firstOptionValue.match(DASH_SIGNAL_PATTERN) 
                                   && !isShortSignalOption;

        if (isListOption) {
            return listSignals(systemAPI);
        }

        let signal = '';
        let targetPID = '';

        if (isShortSignalOption || isLongSignalOption) {
            signal = providedArguments.at(0) as string;
            targetPID = providedArguments.at(1) as string;
        }
        else if (isDashSignalOption) {
            signal = firstOptionValue.replace('-', '');
            targetPID = providedArguments.at(0) as string;
        }
        else {
            throw new ExecutionTreeError(
                `kill: usage: \'kill [-<signal> | -s <signal> | --signal <signal>] <PID>\'`,
                2
            );
        }

        
        if (signal === undefined || targetPID === undefined) {
            throw new ExecutionTreeError(
                `kill: a signal number/name and PID integer must be specified: \'kill [-<signal> | -s <signal> | --signal <signal>] <PID>\'`,
                2
            );
        }

        const resolvedSignal = isNaN(Number(signal))? String(signal) : Number(signal);

        const signalHandler = getSignalHandler(
            resolvedSignal, 
            SIGNAL_HANDLER_AND_NAME_MAPPING
        );

        if (!signalHandler) {
            throw new ExecutionTreeError(
                `kill: invalid signal. Try \'kill -l\' or \'kill --list \' to see valid signals.`,
                2
            );
        }

        const PIDisInteger = targetPID.match(POSITIVE_INTEGER_PATTERN);

        if (!PIDisInteger) {
            throw new ExecutionTreeError(
                `kill: the PID must be an integer.`,
                2
            );
        }

        const numberPID = Number(targetPID);

        const PIDexists = isExistingPID(
            numberPID, 
            opennedProcessesData
        );

        if (!PIDexists) {
            throw new ExecutionTreeError(
                `kill: (${numberPID}) - No such process.`,
                2
            );
        } 

        finishGraphicalProcess(numberPID);
    }
    else {
        const targetPID = providedArguments.at(0) as string;

        const PIDisInteger = targetPID.match(POSITIVE_INTEGER_PATTERN);

        if (!PIDisInteger) {
            throw new ExecutionTreeError(
                `kill: the PID must be an integer.`,
                2
            );
        }
        
        const numberPID = Number(targetPID);

        const PIDexists = isExistingPID(
            numberPID, 
            opennedProcessesData
        );

        if (!PIDexists) {
            throw new ExecutionTreeError(
                `kill: (${numberPID}) - No such process.`,
                2
            );
        } 

        finishGraphicalProcess(numberPID);
    }

    return {
        stdout: '',
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}


export const kill = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    return commandDecorator(
        'kill', 
        commandOptions, 
        commandArguments, 
        systemAPI, 
        stdin, 
        COMMAND_OPTIONS, 
        help, 
        main
    );
}