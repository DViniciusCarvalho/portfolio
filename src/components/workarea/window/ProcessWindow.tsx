import React, { useContext, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import processWindowStyles from "@/styles/workarea/window/ProcessWindow.module.sass";
import Image from "next/image";
import WindowCloseIcon from "../../../../public/assets/window-close-symbolic.svg";
import WindowRestoreIcon from "../../../../public/assets/window-restore-symbolic.svg";
import WindowMaximizeIcon from "../../../../public/assets/window-maximize-symbolic.svg";
import WindowMinimizeIcon from "../../../../public/assets/window-minimize-symbolic.svg";
import { Props } from "@/types/props";
import { MainContext } from "../Main";
import { isResizeAction } from "@/lib/validation";


export default function ProcessWindow({ 
	PID, 
	processTitle, 
	processElement, 
	zIndex,
	isMinimized,
	isMaximized,
	coordinates,
	dimensions
}: Props.ProcessWindowProps) {

	const { 
		elevateProcessWindowZIndex, 
		sendSIGKILLToProcess, 
		minimizeProcessWindow, 
		restoreProcessWindowLastDimensions,
		maximizeProcessWindow,
		updateProcessWindowDimensions
	} = useContext(MainContext);

    const dragRef = useRef<HTMLDivElement | null>(null);

	const [ resizeData, setResizeData ] = useState({
		isResizing: false,
		resizeSide: ""
	});

	const [ previousPressedCoordinates, setPreviousPressedCoordinates ] = useState({
		x: 0,
		y: 0
	});

	const [ pressedCoordinates, setPressedCoordinates ] = useState({
		x: 0,
		y: 0
	});

	const [ lastDimensionsCoordBeforeMaximize, setLastDimensionsCoordBeforeMaximize ] = useState({
		dimensions: {
			width: 0,
			height: 0
		},
		coordinates: {
			x: 0,
			y: 0
		}
	});

    const [ { isDragging }, drag ] = useDrag(() => ({
        type: "element",
        item: { dragRef, PID },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

	
	function handleMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
		const sideToResize = isResizeAction(event, dragRef);

		if (sideToResize) {

			setPreviousPressedCoordinates(previous => ({
				x: event.clientX,
				y: event.clientY
			}));

			setResizeData(previous => ({
				isResizing: true,
				resizeSide: sideToResize
			}));

		}

		elevateProcessWindowZIndex(PID);
		updateInitialCoordinates(event);
	}

	function handleMouseUpAndLeave(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
		if (resizeData.isResizing) {
			setResizeData(previous => ({
				isResizing: false,
				resizeSide: ""
			}));
		}
	}

	function handleMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
		if (resizeData.isResizing && isResizeAction(event, dragRef)) {
			updateProcessWindowDimensions(
				PID,
				event, 
				previousPressedCoordinates.x,
				previousPressedCoordinates.y,
				dragRef, 
				resizeData.resizeSide
			);

			setPreviousPressedCoordinates(previous => ({
				x: event.clientX,
				y: event.clientY
			}));
		}
	}

	function updateInitialCoordinates(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
		const mouseXAxis = event.clientX;
		const elementXAxis = dragRef.current!.getBoundingClientRect().x;

		const mouseYAxis = event.clientY;
		const elementYAxis = dragRef.current!.getBoundingClientRect().y;

		setPressedCoordinates(previous => ({
			x: mouseXAxis - elementXAxis,
			y: mouseYAxis - elementYAxis
		}));
	}

	function handleRestoreMaximizeWindow(PID: number, isMaximized: boolean): void {
		const widthMemoization = dimensions.width;
		const heightMemoization = dimensions.height;

		const xAxisMemoization = coordinates.x;
		const yAxisMemoization = coordinates.y;

		if (isMaximized) {
			const memoizedWidth = lastDimensionsCoordBeforeMaximize.dimensions.width;
			const memoizedHeight = lastDimensionsCoordBeforeMaximize.dimensions.height;
			const memoizedXAxis = lastDimensionsCoordBeforeMaximize.coordinates.x;
			const memoizedYAxis = lastDimensionsCoordBeforeMaximize.coordinates.y;

			restoreProcessWindowLastDimensions(
				PID, 
				memoizedWidth,
				memoizedHeight,
				memoizedXAxis,
				memoizedYAxis
			);

			return;
		}
			
		maximizeProcessWindow(PID);

		setLastDimensionsCoordBeforeMaximize(previous => ({
			dimensions: {
				width: widthMemoization,
				height: heightMemoization
			},
			coordinates: {
				x: xAxisMemoization,
				y: yAxisMemoization
			}
		}));
	}

    return (
        <div 
		  className={`
		    ${processWindowStyles.container} 
			${processWindowStyles[isMinimized? "minimized" : "normal"]}
			`
		  }
          ref={(node) => {
            dragRef.current = node;
            resizeData.isResizing? "" : drag(node);
          }}
          style={{
            display: isDragging? "none" : "block",
            left: coordinates.x,
            top: coordinates.y,
			width: dimensions.width,
			height: dimensions.height,
			zIndex: zIndex
          }}
		  onMouseDown={(e) => handleMouseDown(e)}
		  onMouseUp={(e) =>  handleMouseUpAndLeave(e)}
		  onMouseLeave={(e) => handleMouseUpAndLeave(e)}
		  onMouseMove={(e) => handleMouseMove(e)}
		  id={`${pressedCoordinates.x}:${processTitle}-${PID}:${pressedCoordinates.y}`}
        >
            <div className={processWindowStyles.window__title__bar}>
				{processTitle}
				<div className={processWindowStyles.buttons__wrapper}>
					<button onClick={() => minimizeProcessWindow(PID)}>
						<Image 
						  src={WindowMinimizeIcon} 
						  alt="window minimize icon"
						/>
					</button>
					<button onClick={() => handleRestoreMaximizeWindow(PID, isMaximized)}>
						<Image 
						  src={isMaximized? WindowRestoreIcon : WindowMaximizeIcon} 
						  alt="window restore size icon"
						/>
					</button>
					<button onClick={() => sendSIGKILLToProcess(PID)}>
						<Image 
						  src={WindowCloseIcon} 
						  alt="window close icon"
						/>
					</button>
				</div>
            </div>
			<div className={processWindowStyles.process__application__section}>
				{processElement}
			</div>
        </div>
    );
}