import React, { useContext, useState } from "react";
import { useDrop } from "react-dnd";
import desktopStyles from "@/styles/workarea/Desktop.module.sass";
import { MainContext } from "../Main";
import ProcessWindow from "../window/ProcessWindow";
import { Data } from "@/types/data";
import { Props } from "@/types/props";


export default function Desktop({ 
    desktopRef, 
    opennedProcessesData, 
    updateProcessCoordinates 
}: Props.DesktopProps) {

    const { themeStyleClass, layoutStyleClass } = useContext(MainContext);

    const [ , drop ] = useDrop(() => ({
        accept: "element",
        drop: (item: Data.DraggableProcessWindow, monitor) => {

            const element = item.dragRef.current!;
            const elementPID = item.PID;

            const offset = monitor.getClientOffset()!;

            const elementPressedX = Number(element.id.split(":")[0]);
            const elementPressedY = Number(element.id.split(":")[2]);

            const XAxis = offset.x - elementPressedX;
            const YAxis = offset.y - elementPressedY;

            updateProcessCoordinates(elementPID, XAxis, YAxis);

        },
    }));

    return (
        <div
          className={`
            ${desktopStyles.container} 
            ${desktopStyles[themeStyleClass]} 
            ${desktopStyles[layoutStyleClass]}
            `
          }

          ref={(node) => {
            desktopRef.current = node
            drop(node);
          }}
        >

            {opennedProcessesData.map((opennedProcessData, index) => (
                <ProcessWindow {...opennedProcessData} key={index}/>)    
            )}
            
        </div>
    );
}
