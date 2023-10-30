import React, { useContext } from 'react';
import applicationWrapperStyles from '@/styles/processes/applications/common/ApplicationWrapper.module.sass';
import { MainContext } from '@/components/workarea/Main';
import { Props } from '@/types/props';


export default function ApplicationWrapper({
    url
}: Props.ApplicationWrapperProps) {

    const {
        systemTheme
    } = useContext(MainContext);

    return (
        <div 
            className={`
                ${applicationWrapperStyles.container}
                ${applicationWrapperStyles[systemTheme]}
                `
            }
        >
            <div className={applicationWrapperStyles.url__wrapper}>
                <a 
                    href={url} 
                    target='blank'
                    className={applicationWrapperStyles.original__url__button}
                >
                    Original URL
                </a>
            </div>
            <iframe 
                className={applicationWrapperStyles.project__iframe}
                src={url}
            />
        </div>
    )
}