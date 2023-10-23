import React, { useContext, useRef } from 'react';
import Image from 'next/image';
import tutorialWrapperStyles from '@/styles/processes/applications/common/TutorialWrapper.module.sass';
import { MainContext } from '@/components/workarea/Main';
import { Props } from '@/types/props';


export default function TutorialWrapper({
    name,
    description,
    screenshots,
    repoUrl,
    setURL,
    setCanDisplayAppWrapper
}: Props.TutorialWrapper) {

    const urlFieldRef = useRef<HTMLInputElement | null>(null);

    const {
        systemTheme
    } = useContext(MainContext);


    function urlIsUp(url: string): boolean {
        if (!url.length) return false;

        try {
            fetch(url);

            return true;
        }
        catch(err: unknown) {
            return false;
        }
    }


    function displayApplicationWrapper(url: string) {
        if (urlIsUp(url)) {
            setURL(() => url);
            setCanDisplayAppWrapper(() => true);
        }
    }


    return (
        <div 
            className={`
                ${tutorialWrapperStyles.container}
                ${tutorialWrapperStyles[systemTheme]}
                `
            }
        >
            <h1 className={tutorialWrapperStyles.app__name}>
                {name}
            </h1>
            <br/>
            <p className={tutorialWrapperStyles.app__description}>
                {description}
            </p>
            <br/>
            <br/>
            <div className={tutorialWrapperStyles.app__screenshots__wrapper}>
                {screenshots.map(screenshot => (
                    <Image
                        src={screenshot}
                        alt={`${name} application screenshot`}
                        className={tutorialWrapperStyles.app__screenshot}
                    />  
                ))}
            </div>
            <br/>
            <br/>
            <p className={tutorialWrapperStyles.app__description}>
                To start the application, follow the steps from the README of <a>{repoUrl}</a>. After starting the application, if you want to see the application running within the current window, fill in the URL field and click in the button:
            </p>
            <br/>
            <br/>
            <div className={tutorialWrapperStyles.url__input__wrapper}>
                <label 
                    htmlFor='url__input' 
                    className={tutorialWrapperStyles.url__input__label}
                >
                    URL:
                </label>
                &nbsp;
                <input 
                    type='text' 
                    ref={urlFieldRef} 
                    id='url__input'
                    className={tutorialWrapperStyles.url__input}
                />
            </div>
            <br/>
            <br/>
            <button 
                onClick={() => displayApplicationWrapper(
                    urlFieldRef!.current!.value
                )}
                className={tutorialWrapperStyles.display__button}
            >
                Display
            </button>
        </div>
    );
}