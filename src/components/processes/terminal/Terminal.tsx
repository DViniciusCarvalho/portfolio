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
        hostName, 
        systemEnvironmentVariables,
        umask,
        setSystemEnvironmentVariables,
        setUmask,
        terminalFontSizeInPixels,
        terminalBackgroundColor,
        fileSystem,
        setFileSystem,
        openForegroundProcess,
        finishForegroundProcess,
        finishGraphicalProcess,
        opennedProcessesData,
        setOpennedProcessesData
    } = useContext(MainContext);


    const [ 
        environmentVariables, 
        setEnvironmentVariables 
    ] = useState<Shell.EnvironmentVariables>(deepClone(systemEnvironmentVariables));

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

    const [ 
        terminalLines, 
        setTerminalLines 
    ] = useState<Data.TerminalLine[]>([{
        element: (
            <CommandLine
                user={environmentVariables['USER']}
                domain={hostName}
                directory={environmentVariables['PWD']}
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


    function handleTerminalKeyDown(
        e: React.KeyboardEvent<HTMLDivElement>
    ): void {

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


    function selectLastTerminalLineToType(): void {

        const terminalElement = terminalRef.current!;
        const lastTerminalLineContentElement = terminalElement.lastChild!.lastChild!;
        const lastTerminalLineSpan = lastTerminalLineContentElement as HTMLSpanElement;

        lastTerminalLineSpan.focus();
    }


    function selectEndOfElement(
        element: HTMLElement
    ): void {
        
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


    function navigateInBashHistory(
        indexSubtrahend: number
    ): void {

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


    function clearTerminal(): void {

        const currentShellUser = environmentVariables['USER'];
        const currentWorkingDirectory = environmentVariables['PWD'];

        const newCommandLine = (
            <CommandLine
                user={currentShellUser}
                domain={hostName}
                directory={currentWorkingDirectory}
            />
        );

        setTerminalLines(previous => [{
            element: newCommandLine,
            key: generateUUID()
        }]);
    }


    function getResultLineToAppend(
        result: string
    ): Data.TerminalLine {

        return {
            element: (
                <ResultLine 
                    commandResult={result}
                />
            ),
            key: generateUUID()
        };
    }


    function getCommandLineToAppend(
        user: string,
        domain: string,
        directory: string
    ): Data.TerminalLine {

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


    function handleCommandExecution(): void {

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

        const currentShellUser = environmentVariables['USER'];
        const currentWorkingDirectory = environmentVariables['PWD'];

        showCommandResult(                
            currentShellUser,
            hostName,
            currentWorkingDirectory, 
            stdout, 
            stderr
        );
    }


    function executeShellCommand(
        command: string
    ): Shell.ExitFlux & { systemAPI: Shell.SystemAPI } {

        const systemAPI: Shell.SystemAPI = {
            clearTerminal,
            environmentVariables,
            setEnvironmentVariables,
            setSystemEnvironmentVariables,
            openForegroundProcess,
            finishForegroundProcess,
            finishGraphicalProcess,
            opennedProcessesData,
            setOpennedProcessesData,
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


    function changeEnvironmentVariable(
        variableName: string,
        value: any
    ): void {

        setEnvironmentVariables(previous => {
            const previousDeepCopy = deepClone(previous);
            previousDeepCopy[variableName] = value;
            
            return previousDeepCopy;
        });
    }

    
    function showCommandResult(
        user: string,
        domain: string,
        directory: string,
        stdout: string | null, 
        stderr: string | null
    ): void {
        
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