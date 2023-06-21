import React, { useContext, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import desktopStyles from '@/styles/workarea/Desktop.module.sass';
import ProcessWindow from '../window/ProcessWindow';
import { Data } from '@/types/data';
import { Props } from '@/types/props';
import { MainContext } from '../Main';


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


    return (
        <div
            className={`
                ${desktopStyles.container} 
                ${desktopStyles[themeStyleClass]} 
                ${desktopStyles[layoutStyleClass]}
                `
            }
            style={{
                display: !applicationsAreBeingShowed && (currentActiveDesktopUUID !== UUID) 
                         ? 'none'
                         : 'block',

                position: desktopCanBeShowed(applicationsAreBeingShowed, currentActiveDesktopUUID, UUID) 
                          ? 'absolute'
                          : 'relative',

                width: desktopCanBeShowed(applicationsAreBeingShowed, currentActiveDesktopUUID, UUID) 
                       ? applicationsWindowRef.current?.getBoundingClientRect().width
                       : '220px',

                height: desktopCanBeShowed(applicationsAreBeingShowed, currentActiveDesktopUUID, UUID) 
                        ? applicationsWindowRef.current?.getBoundingClientRect().height
                        : '90%',

                top: desktopCanBeShowed(applicationsAreBeingShowed, currentActiveDesktopUUID, UUID) 
                     ? 0
                     : 0,

                left: desktopCanBeShowed(applicationsAreBeingShowed, currentActiveDesktopUUID, UUID) 
                      ? 0
                      : 0
            }}
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
