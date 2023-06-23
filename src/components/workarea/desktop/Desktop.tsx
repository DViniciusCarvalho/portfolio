import React, { useContext, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import desktopStyles from '@/styles/workarea/Desktop.module.sass';
import ProcessWindow from '../window/ProcessWindow';
import { Data } from '@/types/data';
import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { getCorrespondentDesktop } from '@/lib/utils';


export default function Desktop({ 
    UUID,
    opennedProcessesData, 
    updateProcessCoordinates,
    applicationsWindowRef
}: Props.DesktopProps) {

    const { 
        themeStyleClass, 
        layoutStyleClass, 
        applicationsAreBeingShowed, 
        currentActiveDesktopUUID,
        handleChangeCurrentDesktop
    } = useContext(MainContext);

    const [ , drop ] = useDrop(() => ({
        accept: 'element',
        drop: (item: Data.DraggableProcessWindow, monitor) => {

            const element = item.dragRef.current!;
            const elementPID = item.PID;

            const offset = monitor.getClientOffset()!;

            const elementPressedX = Number(element.id.split(':')[0]);
            const elementPressedY = Number(element.id.split(':')[2]);

            const XAxis = offset.x - elementPressedX;
            const YAxis = offset.y - elementPressedY;

            updateProcessCoordinates(elementPID, XAxis, YAxis);

        },
    }));


    function desktopCanBeShowed(
        applicationsAreBeingShowed: boolean, 
        currentActiveDesktopUUID: string, 
        UUID: string
    ): boolean {
        
        return !(applicationsAreBeingShowed || currentActiveDesktopUUID !== UUID);
    }


    function getCurrentDesktopProcessesWindow(
        opennedProcessesData: Data.OpennedProcessData[]
    ): Data.OpennedProcessData[] {

        const currentDesktopProcessesWindow = opennedProcessesData.filter(opennedProcessData => {
            return opennedProcessData.parentDesktopUUID === UUID;
        });

        return currentDesktopProcessesWindow;
    }

    function getDesktopResultantStyles(
        applicationsAreBeingShowed: boolean, 
        currentActiveDesktopUUID: string, 
        UUID: string,
        applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>
    ): any {

        const applicationsAreHiddenAndIsNotCurrentDesktop = (!applicationsAreBeingShowed 
                                                        && (currentActiveDesktopUUID !== UUID));
 
        const currentDesktopCanBeShowed = desktopCanBeShowed(
            applicationsAreBeingShowed, 
            currentActiveDesktopUUID, 
            UUID
        );

        const applicationsWindowWidth = applicationsWindowRef.current?.getBoundingClientRect().width;
        const applicationsWindowHeight = applicationsWindowRef.current?.getBoundingClientRect().height;

        return {
            display: applicationsAreHiddenAndIsNotCurrentDesktop? 'none' : 'block',
            position: currentDesktopCanBeShowed? 'absolute' : 'relative',
            width: currentDesktopCanBeShowed? applicationsWindowWidth : '220px',
            height: currentDesktopCanBeShowed? applicationsWindowHeight : '90%',
            top: currentDesktopCanBeShowed? 0 : 0,
            left: currentDesktopCanBeShowed? 0 : 0,
            transform: `scale(${currentDesktopCanBeShowed? 1 : 0.9})`
        };

    }


    return (
        <div
            className={`
                ${desktopStyles.container} 
                ${desktopStyles[themeStyleClass]} 
                ${desktopStyles[layoutStyleClass]}
                ${desktopStyles[!applicationsAreBeingShowed? 'showed' : 'not__showed']}
                `
            }
            style={{
                ...getDesktopResultantStyles(
                    applicationsAreBeingShowed, 
                    currentActiveDesktopUUID, 
                    UUID, 
                    applicationsWindowRef
                )
            }}
            id={UUID}
            ref={drop}
            onClick={() => handleChangeCurrentDesktop(UUID)}
        >
            {getCurrentDesktopProcessesWindow(opennedProcessesData).map(opennedProcessData => (
                <ProcessWindow 
                    {...opennedProcessData} 
                    key={`${opennedProcessData.processTitle}-${opennedProcessData.PID}`}
                />
			))}   
        </div>
    );
}
