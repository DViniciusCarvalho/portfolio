import React, { 
    useContext, 
    useRef 
} from 'react';

import terminalStyles from '@/styles/processes/Terminal.module.sass';
import { MainContext } from '@/components/workarea/Main';
import { Props } from '@/types/props';

import { 
    NORMAL_USER_PROMPT, 
    ROOT_PROMPT 
} from '@/lib/initial/shell';


export default function CommandLine({
    user,
    domain,
    directory,
}: Props.CommandLineProps) {
    
    const contentEditableRef = useRef<HTMLSpanElement | null>(null);


    const {
        terminalUserHostColor,
        terminalRootHostColor,
        terminalCurrentDirectoryColor,
        terminalDefaultColor
    } = useContext(MainContext);


    function handlePaste(
        event: React.ClipboardEvent<HTMLSpanElement>
    ): void {

        event.preventDefault();
        const text = event.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };
    

    function handleInput(): void {
        
        const element = contentEditableRef.current!;
        const text = element.textContent || '';

        const selection = window.getSelection();
        const startOffset = selection?.anchorOffset || 0;

        const filteredText = text.replace(/^(<br\s*\/?>)*/g, '');
        
        element.innerHTML = filteredText;

        if (selection) {
            const range = document.createRange();

            range.setStart(
                element.firstChild || element, 
                Math.min(startOffset, element.textContent!.length)
            );

            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            element.focus();
        }
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
                        color: user === 'root'? terminalRootHostColor : terminalUserHostColor
                    }}
                >
                    {`${user}@${domain}`}
                </span>
                :
                <span 
                    className={terminalStyles.current__dir}
                    style={{
                        color: terminalCurrentDirectoryColor
                    }}
                >
                    {directory.includes(`/home/${user}`)
                    ? directory.replace(`/home/${user}`, '~') 
                    : directory
                    }
                </span>
                {user === 'root'? ROOT_PROMPT : NORMAL_USER_PROMPT}
            </span>
            <span 
                className={terminalStyles.command__section} 
                style={{
                    color: terminalDefaultColor
                }}
                onPaste={handlePaste}
                onInput={handleInput}
                onFocus={() => document.body.classList.remove('field--focused')}
                onBlur={() => document.body.classList.add('field--focused')}
                ref={contentEditableRef}
                contentEditable={true}
            />
        </p>
    );

}
