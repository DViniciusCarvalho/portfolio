import React, { useContext } from 'react';
import { useDrop } from 'react-dnd';
import desktopStyles from '@/styles/workarea/Desktop.module.sass';
import ProcessWindow from '../window/ProcessWindow';
import { Data } from '@/types/data';
import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { getDesktopStyles } from '@/lib/style';
import { getCurrentDesktopProcessesWindow } from '@/lib/utils';


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

            const currentXAxis = offset.x - elementPressedX;
            const currentYAxis = offset.y - elementPressedY;

            updateProcessCoordinates(elementPID, currentXAxis, currentYAxis);

        },
    }));


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
                ...getDesktopStyles(
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
            {getCurrentDesktopProcessesWindow(opennedProcessesData, UUID).map(opennedProcessData => (
                <ProcessWindow 
                    {...opennedProcessData} 
                    key={`${opennedProcessData.processTitle}-${opennedProcessData.PID}`}
                />
			))}   
        </div>
    );
}
