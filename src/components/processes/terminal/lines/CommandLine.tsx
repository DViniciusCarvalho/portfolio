import React, { useContext, useRef } from 'react';
import terminalStyles from '@/styles/processes/Terminal.module.sass';
import { Props } from '@/types/props';
import { MainContext } from '@/components/workarea/Main';
import { NORMAL_USER_PROMPT, ROOT_PROMPT } from '@/lib/constants';


export default function CommandLine({
    currentShellUser,
    hostName,
    currentDirectory,
}: Props.CommandLineProps) {
    
    const contentEditableRef = useRef<HTMLSpanElement | null>(null);

    const {
        terminalUserHostColor,
        terminalRootHostColor,
        terminalCurrentDirectoryColor,
        terminalDefaultColor
    } = useContext(MainContext);


    const handlePaste = (
        event: React.ClipboardEvent<HTMLSpanElement>
    ) => {

        event.preventDefault();
        const text = event.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };
    

    const handleInput = () => {
        const element = contentEditableRef.current!;
        const text = element.textContent || '';
        const filteredText = text.replace(/<[^>]+>/g, '');
        element.textContent = filteredText;
      
        const isWhiteSpaceOrNewLine = /^\s*$/.test(filteredText);

        if (isWhiteSpaceOrNewLine) return;
      
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
        element.focus();
    }
 

    return (
        <p className={terminalStyles.command__line}>
            <span 
                className={terminalStyles.terminal__prompt}
                style={{
                    color: terminalDefaultColor
                }}
            >
                <span 
                    className={terminalStyles.user__host}
                    style={{
                        color: currentShellUser === 'root'? terminalRootHostColor : terminalUserHostColor
                    }}
                >
                    {`${currentShellUser}@${hostName}`}
                </span>
                :
                <span 
                    className={terminalStyles.current__dir}
                    style={{
                        color: terminalCurrentDirectoryColor
                    }}
                >
                    {currentDirectory === `/home/${currentShellUser}`? '~' : currentDirectory}
                </span>
                {currentShellUser === 'root'? ROOT_PROMPT : NORMAL_USER_PROMPT}
            </span>
            <span 
                className={terminalStyles.command__section} 
                style={{
                    color: terminalDefaultColor
                }}
                onPaste={handlePaste}
                onInput={handleInput}
                ref={contentEditableRef}
                contentEditable={true}
            />
        </p>
    );

}
