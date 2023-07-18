import React, { useContext, useEffect, useRef, useState } from 'react';
import terminalStyles from '@/styles/processes/Terminal.module.sass';
import CommandLine from './lines/CommandLine';
import ResultLine from './lines/ResultLine';
import { Data } from '@/types/data';
import { MainContext } from '@/components/workarea/Main';
import { INITIAL_SHELL_ENVIRONMENT_VARIABLES } from '@/lib/constants';
import { lexer } from '@/lib/shell/interpreter';


export default function Terminal() {

    const terminalRef = useRef<HTMLDivElement | null>(null);

    const { currentShellUser, hostName, currentDirectory } = useContext(MainContext);

    const {
        terminalFontSizeInPixels,
        terminalBackgroundColor
    } = useContext(MainContext);

    const [ 
        environmentVariables, 
        setEnvironmentVariables 
    ] = useState(INITIAL_SHELL_ENVIRONMENT_VARIABLES);

    const [ terminalLines, setTerminalLines ] = useState<Data.TerminalLine[]>([{
        element: (
            <CommandLine
                currentShellUser={currentShellUser}
                hostName={hostName}
                currentDirectory={currentDirectory}
            />
        ),
        key: Date.now()
    }]);

    
    useEffect(() => {
        terminalRef.current!.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executeShellCommand();
            }
        });
    }, [terminalRef]);

    useEffect(() => {
        selectLastTerminalLineToType();
    }, [terminalLines]);


    const selectLastTerminalLineToType = (): void => {
        const terminalElement = terminalRef.current!;
        const lastTerminalLineContentElement = terminalElement.lastChild!.lastChild!;
        const lastTerminalLineSpan = lastTerminalLineContentElement as HTMLSpanElement;
        lastTerminalLineSpan.focus();
    }


    const clearTerminal = (): void => {
        const newCommandLine = (
            <CommandLine
                currentShellUser={currentShellUser}
                hostName={hostName}
                currentDirectory={currentDirectory}
            />
        );

        setTerminalLines(previous => [{
            element: newCommandLine,
            key: Date.now()
        }]);
    }


    const getResultLineToAppend = (
        result: string
    ): Data.TerminalLine => {

        return {
            element: <ResultLine commandResult={result}/>,
            key: Date.now()
        };

    }


    const getCommandLineToAppend = (
        currentShellUser: string,
        hostName: string,
        currentDirectory: string
    ): Data.TerminalLine => {

        return {
            element: (
                <CommandLine
                    currentShellUser={currentShellUser}
                    hostName={hostName}
                    currentDirectory={currentDirectory}
                />
            ),
            key: Date.now() + 1
        };

    }


    const executeShellCommand = (): void => {

        const lastTerminalLine = terminalRef.current!.lastChild;
        const lastTerminalLineContentElement = lastTerminalLine!.lastChild as HTMLSpanElement;
        
        const command = lastTerminalLineContentElement.innerText;
        const trimmedCommand = command.replace(/^\s+/, '');
        console.log(trimmedCommand)

        const linesToAppendToTerminal: Data.TerminalLine[] = [];


        if (trimmedCommand === 'clear') {
            clearTerminal();
        } 
        else if (trimmedCommand === '') {
            const newCommandLine = getCommandLineToAppend(
                currentShellUser,
                hostName,
                currentDirectory
            );

            linesToAppendToTerminal.push(newCommandLine);

            lastTerminalLineContentElement.contentEditable = 'false';
        }
        else {
            const result = JSON.stringify(lexer(trimmedCommand));
            const newResultLine = getResultLineToAppend(result);
            const newCommandLine = getCommandLineToAppend(
                currentShellUser,
                hostName,
                currentDirectory
            );

            linesToAppendToTerminal.push(newResultLine);
            linesToAppendToTerminal.push(newCommandLine);

            lastTerminalLineContentElement.contentEditable = 'false';
        }

        setTerminalLines(previous => [
            ...previous, 
            ...linesToAppendToTerminal
        ]);
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


