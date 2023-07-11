import React, { useState, useContext } from 'react';
import applicationIconStyles from '@/styles/workarea/applications/ApplicationIcon.module.sass';
import Image from 'next/image';
import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { processIsRunning } from '@/lib/validation';
import { getCorrespondentRunningProcess, getCorrespondentDesktop } from '@/lib/utils';
import { COLOR_PALETTE_OPTIONS } from '@/lib/constants';

export default function ApplicationIcon({ 
    applicationIconStaticImage, 
    applicationName, 
    applicationElement 
}: Props.ApplicationIconProps) {

    const { 
        systemColorPalette,
        opennedProcessesData, 
        desktopActivitiesData,
        currentActiveDesktopUUID,
        applicationsAreBeingShowed, 
        openProcess,
        elevateProcessWindowZIndex,
        restorePreviousDimensions,
        handleChangeCurrentDesktop,
        changeApplicationsAreBeingShowed,
        transferApplicationIconToTaskbarOtherProcessesIcons
    } = useContext(MainContext);

    const [ processPID, setProcessPID ] = useState(0);

    const startProcessMiddleware = () => {

		const processFound = getCorrespondentRunningProcess(
            opennedProcessesData, 
            processPID
        );

        const processIsAlreadyRunning = processIsRunning(
            opennedProcessesData, 
            processPID
        );

        const processIsNotRunning = !processIsAlreadyRunning;

        const currentDesktopDoesNotExists = !getCorrespondentDesktop(
            desktopActivitiesData, 
            currentActiveDesktopUUID
        );

        const processIsMinimized = processFound?.isMinimized;

        const processIsRunningAndNotInTheCurrentDesktop = processIsRunning(opennedProcessesData, processPID) 
                                                        && processFound?.parentDesktopUUID 
                                                        !== currentActiveDesktopUUID;

        if (processIsNotRunning) {
            const startedProcessPID = openProcess(
                applicationName, 
                applicationIconStaticImage,
                applicationElement,
                currentDesktopDoesNotExists,
            );
                
            transferApplicationIconToTaskbarOtherProcessesIcons(
                applicationIconStaticImage,
                applicationName,
                applicationElement,
                startedProcessPID
            );

            setProcessPID(previous => startedProcessPID);

        }

        if (processIsAlreadyRunning) {
            elevateProcessWindowZIndex(processPID);
        }

        if (processIsMinimized) {
            restorePreviousDimensions(processPID);
        }

        if (processIsRunningAndNotInTheCurrentDesktop) {
            handleChangeCurrentDesktop(processFound!.parentDesktopUUID);
        }

        if (processIsAlreadyRunning && applicationsAreBeingShowed) {
            changeApplicationsAreBeingShowed(false);
        }

        
    }

    return (
        <abbr 
            className={applicationIconStyles.container}
            style={{
                display: applicationsAreBeingShowed? 'inline-block' : 'none'
            }}
            onClick={startProcessMiddleware}
            title={applicationName}
        >
            <div className={applicationIconStyles.icon__wrapper}>
                <Image 
                    src={applicationIconStaticImage} 
                    alt={`${applicationName} icon`} 
                    className={applicationIconStyles.icon}
                />
                { applicationName }
                <div 
                    className={applicationIconStyles.openned__indicator}
                    style={{
                        backgroundColor: COLOR_PALETTE_OPTIONS[systemColorPalette].opennedIndicatorColor,
                        display: processIsRunning(opennedProcessesData, processPID) ? 'block' : 'none'
                    }}
                />
            </div>
        </abbr>
    );
}
