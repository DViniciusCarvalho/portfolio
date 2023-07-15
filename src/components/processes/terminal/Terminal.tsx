import React, { useEffect, useRef, useState } from 'react';
import terminalStyles from '@/styles/processes/Terminal.module.sass';

export default function Terminal() {

    const terminalRef = useRef<HTMLDivElement | null>(null);

    const [ currentShellUser, setCurrentShellUser ] = useState('douglas');
    const [ hostName, setHostName ] = useState('yakshamessorem');
    const [ currentDirectory, setCurrentDirectory ] = useState('~');

    const [ terminalLines, setTerminalLines ] = useState<JSX.Element[]>([BaseLine()]);

    const [ environmentVariables, setEnvironmentVariables ] = useState([]);
 

    useEffect(() => terminalRef.current!.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            executeShellCommand();
        }
    }), [terminalRef]);


    function BaseLine() {
        const ref = useRef<HTMLDivElement | null>(null);

        const ROOT_PROMPT = '#';
        const NORMAL_USER_PROMPT = '$';

        const userAndHost = `${currentShellUser}@${hostName}`;
        const commandPrompt = currentShellUser === 'root'? ROOT_PROMPT : NORMAL_USER_PROMPT;

        return (
            <p className={terminalStyles.base__line}>
                <span className={terminalStyles.terminal__prompt} contentEditable={false}>
                    {userAndHost}:{currentDirectory}{commandPrompt}
                </span>
                <span className={terminalStyles.command__section} contentEditable={true} ref={ref}/>
            </p>
        );
    }

    const executeShellCommand = (): void => {
        const lastTerminalLine = terminalLines[terminalLines.length - 1];
        const lastTerminalLineChildren = lastTerminalLine.props.children;
        const lastTerminalLineCommandElementRef = lastTerminalLineChildren[1].ref;
        const commandContentElement = lastTerminalLineCommandElementRef.current! as HTMLSpanElement;

        const command = commandContentElement.innerText;
        
    }



    

    return (
        <div 
            className={terminalStyles.container}
            ref={terminalRef}
        >
            {
                terminalLines.map((terminalLine, index) => (
                    <React.Fragment key={index}>
                        {terminalLine}
                    </React.Fragment>
                ))
            }
        </div>
    );
}
