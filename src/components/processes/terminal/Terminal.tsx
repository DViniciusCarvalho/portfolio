import React, { useContext, useEffect, useRef, useState } from 'react';
import terminalStyles from '@/styles/processes/Terminal.module.sass';
import CommandLine from './lines/CommandLine';
import ResultLine from './lines/ResultLine';
import { Data } from '@/types/data';
import { MainContext } from '@/components/workarea/Main';
import { interpretCommand } from '@/lib/shell/interpreter/interpreter';
import { Shell } from '@/types/shell';
import { deepClone, generateUUID } from '@/lib/utils';
import { ESCAPE_SEQUENCES_SUBSTITUTION } from '@/lib/shell/commands/common/patterns';


export default function Terminal() {

    const terminalRef = useRef<HTMLDivElement | null>(null);


    const { 
        currentShellUser, 
        hostName, 
        currentDirectory,
        systemEnvironmentVariables,
        umask,
        setCurrentShellUser,
        setCurrentDirectory,
        setSystemEnvironmentVariables,
        setUmask,
        terminalFontSizeInPixels,
        terminalBackgroundColor,
        fileSystem,
        setFileSystem,
        opennedProcessesData,
        setOpennedProcessesData,
        sendSIGKILLToProcess
    } = useContext(MainContext);


    const [ 
        environmentVariables, 
        setEnvironmentVariables 
    ] = useState<Shell.EnvironmentVariables>(systemEnvironmentVariables);

    const [
        bashHistory,
        setBashHistory
    ] = useState<string[]>([]);

    const [
        currentBashHistoryPosition,
        setCurrentBashHistoryPosition
    ] = useState(0);

    const [
        lastCommandLineContent,
        setLastCommandLineContent
    ] = useState('');

    const [ terminalLines, setTerminalLines ] = useState<Data.TerminalLine[]>([{
        element: (
            <CommandLine
                user={currentShellUser}
                domain={hostName}
                directory={currentDirectory}
            />
        ),
        key: generateUUID()
    }]);


    useEffect(() => 
        selectLastTerminalLineToType()
    , [terminalLines]);

    useEffect(() => 
        setCurrentBashHistoryPosition(previous => bashHistory.length)
    , [bashHistory]);


    const handleTerminalKeyDown = (
        e: React.KeyboardEvent<HTMLDivElement>
    ): void => {

        if (e.key === 'Enter') {
            handleCommandExecution();
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateInBashHistory(1);
        }
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateInBashHistory(-1);
        }

    }


    const selectLastTerminalLineToType = (): void => {
        const terminalElement = terminalRef.current!;
        const lastTerminalLineContentElement = terminalElement.lastChild!.lastChild!;
        const lastTerminalLineSpan = lastTerminalLineContentElement as HTMLSpanElement;

        lastTerminalLineSpan.focus();
    }


    const selectEndOfElement = (
        element: HTMLElement
    ): void => {
        
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString();

            range.deleteContents();
        
            const textNode = document.createTextNode(selectedText);
        
            element.appendChild(textNode);
        
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
        
            element.focus();   
        }
    }


    const navigateInBashHistory = (
        indexSubtrahend: number
    ): void => {

        const difference = currentBashHistoryPosition - indexSubtrahend;
        const isValidIndex = difference >= 0 && difference <= bashHistory.length;
    
        const terminalElement = terminalRef.current!;
        const lastTerminalLineContentElement = terminalElement.lastChild!.lastChild!;
        const lastTerminalLineSpan = lastTerminalLineContentElement as HTMLSpanElement;
    
        if (isValidIndex) {
            const currentIsTheLastIndex = currentBashHistoryPosition === bashHistory.length;
            const targetIndexIsTheLastIndex = difference === bashHistory.length;

            if (currentIsTheLastIndex) {
                const commandContent = lastTerminalLineSpan.textContent ?? '';
                setLastCommandLineContent(previous => commandContent);
            }

            const newContent = targetIndexIsTheLastIndex
                               ? lastCommandLineContent
                               : bashHistory[difference];

            lastTerminalLineSpan.innerText = newContent;

            setCurrentBashHistoryPosition(previous => difference);
            selectEndOfElement(lastTerminalLineSpan);
        }
    }


    const clearTerminal = (): void => {
        const newCommandLine = (
            <CommandLine
                user={currentShellUser}
                domain={hostName}
                directory={currentDirectory}
            />
        );

        setTerminalLines(previous => [{
            element: newCommandLine,
            key: generateUUID()
        }]);
    }


    const changeEnvironmentVariable = (
        variableName: string,
        value: any
    ): void => {

        setEnvironmentVariables(previous => {
            const previousDeepCopy = deepClone(previous);
            previousDeepCopy[variableName] = value;
            
            return previousDeepCopy;
        });
    }


    const getResultLineToAppend = (
        result: string
    ): Data.TerminalLine => {

        return {
            element: (
                <ResultLine 
                    commandResult={result}
                />
            ),
            key: generateUUID()
        };

    }


    const getCommandLineToAppend = (
        user: string,
        domain: string,
        directory: string
    ): Data.TerminalLine => {

        return {
            element: (
                <CommandLine
                    user={user}
                    domain={domain}
                    directory={directory}
                />
            ),
            key: generateUUID()
        };

    }


    const executeShellCommand = (
        command: string
    ): Shell.ExitFlux & { systemAPI: Shell.SystemAPI } => {

        const systemAPI: Shell.SystemAPI = {
            clearTerminal,
            environmentVariables,
            setEnvironmentVariables,
            setSystemEnvironmentVariables,
            sendSIGKILLToProcess,
            opennedProcessesData,
            setOpennedProcessesData,
            currentShellUser,
            setCurrentShellUser,
            currentDirectory,
            setCurrentDirectory,
            fileSystem,
            setFileSystem,
            umask,
            setUmask
        };
    
        if (command === '') {
            return {
                stdout: '',
                stderr: null,
                exitStatus: environmentVariables['?'],
                systemAPI
            };
        }

        const commandExecutionResult = interpretCommand(command, systemAPI);

        return {
            stdout: commandExecutionResult.stdout,
            stderr: commandExecutionResult.stderr,
            exitStatus: commandExecutionResult.exitStatus,
            systemAPI: commandExecutionResult.systemAPI
        };
    }


    const showCommandResult = (
        user: string,
        domain: string,
        directory: string,
        stdout: string | null, 
        stderr: string | null
    ): void => {
        
        if (stdout !== null || stderr !== null) {
            const breakLine = ESCAPE_SEQUENCES_SUBSTITUTION['\\n'];

            const resultText = stdout !== null
                               ? stderr !== null? stdout + breakLine + stderr : stdout
                               : stderr;

            const linesToAppendToTerminal: Data.TerminalLine[] = [];

            const newCommandLine = getCommandLineToAppend(
                user,
                domain,
                directory
            );

            const newResultLine = getResultLineToAppend(resultText!); 
    
            if (resultText !== '') {
                linesToAppendToTerminal.push(newResultLine);
            }

            linesToAppendToTerminal.push(newCommandLine);

            setTerminalLines(previous => [
                ...previous, 
                ...linesToAppendToTerminal
            ]);
        }
    }


    const handleCommandExecution = (): void => {

        const lastTerminalLine = terminalRef.current!.lastChild;
        const lastTerminalLineContentElement = lastTerminalLine!.lastChild as HTMLSpanElement;
        
        const command = lastTerminalLineContentElement.innerText;
        const trimmedCommand = command.replace(/^\s+/, '');

        setBashHistory(previous => [...previous, trimmedCommand].filter(command => command !== ''));

        const { 
            stdout, 
            stderr,
            exitStatus,
            systemAPI
        } = executeShellCommand(trimmedCommand);

        changeEnvironmentVariable('?', exitStatus);
    
        lastTerminalLineContentElement.contentEditable = 'false';

        showCommandResult(                
            systemAPI.currentShellUser,
            hostName,
            systemAPI.currentDirectory, 
            stdout, 
            stderr
        );
    }


    return (
        <div 
            className={terminalStyles.container}
            style={{
                backgroundColor: terminalBackgroundColor,
                fontSize: terminalFontSizeInPixels
            }}
            ref={terminalRef}
            onClick={selectLastTerminalLineToType}
            onKeyDown={handleTerminalKeyDown}
        >
            {
                terminalLines.map(terminalLine => (
                    <React.Fragment key={terminalLine.key}>
                        {terminalLine.element}
                    </React.Fragment>
                ))
            }
        </div>
    );
}