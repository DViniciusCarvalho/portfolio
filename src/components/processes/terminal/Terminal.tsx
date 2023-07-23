import React, { useContext, useEffect, useRef, useState } from 'react';
import terminalStyles from '@/styles/processes/Terminal.module.sass';
import CommandLine from './lines/CommandLine';
import ResultLine from './lines/ResultLine';
import { Data } from '@/types/data';
import { MainContext } from '@/components/workarea/Main';
import { INITIAL_SHELL_ENVIRONMENT_VARIABLES } from '@/lib/constants';
import { interpretCommand } from '@/lib/shell/interpreter/interpreter';
import { Shell } from '@/types/shell';
import { deepClone, generateUUID } from '@/lib/utils';


export default function Terminal() {

    const terminalRef = useRef<HTMLDivElement | null>(null);


    const { 
        currentShellUser, 
        hostName, 
        currentDirectory,
        setCurrentShellUser,
        setCurrentDirectory,
        terminalFontSizeInPixels,
        terminalBackgroundColor,
        setFileSystem,
        setOpennedProcessesData,
        sendSIGKILLToProcess
    } = useContext(MainContext);


    const [ 
        environmentVariables, 
        setEnvironmentVariables 
    ] = useState(INITIAL_SHELL_ENVIRONMENT_VARIABLES);

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
        })
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
    ): Shell.ExitFlux => {

        const exitFlux: Shell.ExitFlux = {
            stdout: null,
            stderr: null,
            exitStatus: 0
        };

        const systemAPI: Shell.SystemAPI = {
            clearTerminal,
            setEnvironmentVariables,
            sendSIGKILLToProcess,
            setOpennedProcessesData,
            setCurrentShellUser,
            setCurrentDirectory,
            setFileSystem
        };

        if (command === 'clear') {
            clearTerminal(); 
        }
        else if (command === '') {
            exitFlux.stdout = '';
            exitFlux.exitStatus = environmentVariables['?'];
        }
        else {
            const { 
                stdout, 
                stderr,
                exitStatus
            } = interpretCommand(command, systemAPI);

            exitFlux.stdout = stdout;
            exitFlux.stderr = stderr;
            exitFlux.exitStatus = exitStatus;
        }

        return exitFlux;
    }


    const showCommandResult = (
        user: string,
        domain: string,
        directory: string,
        stdout: string | null, 
        stderr: string | null
    ): void => {

        if (stdout !== null || stderr !== null) {
            const resultText = stdout !== null? stdout : stderr;

            const linesToAppendToTerminal: Data.TerminalLine[] = [];
    
            const newCommandLine = getCommandLineToAppend(
                user,
                domain,
                directory
            );
    
            const newResultLine = getResultLineToAppend(resultText as string); 
    
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
            exitStatus
        } = executeShellCommand(trimmedCommand);

        changeEnvironmentVariable('?', exitStatus);
    
        lastTerminalLineContentElement.contentEditable = 'false';

        showCommandResult(                
            currentShellUser,
            hostName,
            currentDirectory, 
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


