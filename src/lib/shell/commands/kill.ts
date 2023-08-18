import { Shell } from '@/types/shell';
import { commandHasInvalidOptions, getCommandInvalidOptionMessage } from './common/options';
import { ExecutionTreeError } from '../exception';
import { Data } from '@/types/data';
import { getCommandArguments, resolveArguments } from './common/arguments';


const COMMAND_OPTIONS: Shell.CommandOption[] = [
    {
        short: '-l',
        long: '--list',
        description: 'use PWD from environment, even if it contains symlinks'
    },
    {
        short: null,
        long: /-[A-Za-z0-9]+/,
        description: 'specify the signal number to send, just integers are accepted.'
    },
    {
        short: '-s',
        long: '--signal',
        description: ''
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

    const signalObjectFound = signalMapping.find(signal => {
        return signal.number === providedSignal 
               || signal.name.toLowerCase() === (providedSignal as string).toLowerCase();
    });

    return signalObjectFound?.handler;
}


const isExistingPID = (
    providedPID: number,
    runningProcesses: Data.OpennedProcessData[]
) => {
    const processPIDOwnerFound = runningProcesses.find(process => {
        return process.PID === providedPID;
    });

    return !!processPIDOwnerFound;
}


export const kill = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    const SIGNAL_HANDLER_AND_NAME_MAPPING: Shell.Signal[] = [
        {
            number: 9,
            name: 'SIGKILL',
            handler: systemAPI.sendSIGKILLToProcess
        },
    ];

    const INTEGER_PATTERN = /\d+/;
    const DASH_SIGNAL_PATTERN = /^-[A-Za-z0-9]+/;

    const { 
        hasInvalidOption, 
        invalidOptions 
    } = commandHasInvalidOptions(commandOptions, COMMAND_OPTIONS);

    if (hasInvalidOption) {
        return {
            stdout: null,
            stderr: getCommandInvalidOptionMessage('kill', invalidOptions, 'kill --help'),
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
    const resolvedArgumentsValue = resolveArguments(argumentsValue, systemAPI, false);

    const hasOptions = !!commandOptions.length;
    const hasArguments = !!resolvedArgumentsValue.length;

    try {
        if (!hasArguments) {
            throw new ExecutionTreeError(
                'kill: usage: \'kill [-<signal> | -s <signal> | --signal <signal>] <PID>\' ',
                2
            );
        }

        if (hasOptions) {
            const firstOptionValue = commandOptions[0].value;

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
                signal = resolvedArgumentsValue.at(0) as string;
                targetPID = resolvedArgumentsValue.at(1) as string;
            }
            else if (isDashSignalOption) {
                signal = firstOptionValue.replace('-', '');
                targetPID = resolvedArgumentsValue.at(0) as string;
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

            const PIDisInteger = targetPID.match(INTEGER_PATTERN);

            if (!PIDisInteger) {
                throw new ExecutionTreeError(
                    `kill: the PID must be an integer.`,
                    2
                );
            }

            const numberPID = Number(targetPID);

            const PIDexists = isExistingPID(
                numberPID, 
                systemAPI.opennedProcessesData
            );

            if (!PIDexists) {
                throw new ExecutionTreeError(
                    `kill: (${numberPID}) - No such process.`,
                    2
                );
            } 

            systemAPI.sendSIGKILLToProcess(numberPID);
        }
        else {
            const targetPID = resolvedArgumentsValue.at(0) as string;

            const PIDisInteger = targetPID.match(INTEGER_PATTERN);

            if (!PIDisInteger) {
                throw new ExecutionTreeError(
                    `kill: the PID must be an integer.`,
                    2
                );
            }
            
            const numberPID = Number(targetPID);

            const PIDexists = isExistingPID(
                numberPID, 
                systemAPI.opennedProcessesData
            );

            if (!PIDexists) {
                throw new ExecutionTreeError(
                    `kill: (${numberPID}) - No such process.`,
                    2
                );
            } 

            systemAPI.sendSIGKILLToProcess(numberPID);
        }

        return {
            stdout: '',
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