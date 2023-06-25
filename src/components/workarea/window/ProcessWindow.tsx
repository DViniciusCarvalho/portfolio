import React, { useContext, useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
import processWindowStyles from '@/styles/workarea/window/ProcessWindow.module.sass';
import Image from 'next/image';
import WindowCloseIcon from '../../../../public/assets/window-close-symbolic.svg';
import WindowRestoreIcon from '../../../../public/assets/window-restore-symbolic.svg';
import WindowMaximizeIcon from '../../../../public/assets/window-maximize-symbolic.svg';
import WindowMinimizeIcon from '../../../../public/assets/window-minimize-symbolic.svg';
import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { isResizeAction } from '@/lib/validation';

import { 
	getProcessWindowDisplayStyle, 
	getRelativeDimensionAndCoordinatesStyle 
} from '@/lib/style';


export default function ProcessWindow({ 
	PID, 
	processTitle, 
	processElement, 
	zIndex,
	isMinimized,
	isMaximized,
	parentDesktopUUID,
	coordinates,
	dimensions
}: Props.ProcessWindowProps) {

	const { 
		elevateProcessWindowZIndex, 
		sendSIGKILLToProcess, 
		minimizeProcessWindow, 
		restoreProcessWindowLastDimensions,
		maximizeProcessWindow,
		updateProcessWindowDimensions,
		currentActiveDesktopUUID,
		applicationsAreBeingShowed
	} = useContext(MainContext);


    const dragRef = useRef<HTMLDivElement | null>(null);


	const [ resizeData, setResizeData ] = useState({
		isResizing: false,
		resizeSide: ''
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
        type: 'element',
        item: { dragRef, PID },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));



	const handleMouseDownAndTouchStart = (
		clientX: number,
		clientY: number
	): void => {

		const sideToResize = isResizeAction(clientX, clientY, dragRef);

		if (sideToResize) {
			setPreviousPressedCoordinates(previous => ({
				x: clientX,
				y: clientY
			}));

			setResizeData(previous => ({
				isResizing: true,
				resizeSide: sideToResize
			}));
		}

		elevateProcessWindowZIndex(PID);
		updateInitialCoordinates(clientX, clientY);

		console.log("aq")

	}


	const handleMouseUpLeaveAndTouchEnd = (): void => {

		if (resizeData.isResizing) {
			setResizeData(previous => ({
				isResizing: false,
				resizeSide: ''
			}));
		}

	}


	const handleMouseMoveAndTouchMove = (
		clientX: number,
		clientY: number
	): void => {

		if (resizeData.isResizing && isResizeAction(clientX, clientY, dragRef)) {
			updateProcessWindowDimensions(
				PID,
				clientX, 
				clientY,
				previousPressedCoordinates.x,
				previousPressedCoordinates.y,
				dragRef, 
				resizeData.resizeSide
			);

			setPreviousPressedCoordinates(previous => ({
				x: clientX,
				y: clientY
			}));
		}

	}


	const updateInitialCoordinates = (
		clientX: number,
		clientY: number
	): void => {

		const elementXAxis = dragRef.current!.getBoundingClientRect().x;
		const elementYAxis = dragRef.current!.getBoundingClientRect().y;

		setPressedCoordinates(previous => ({
			x: clientX - elementXAxis,
			y: clientY - elementYAxis
		}));

	}


	const handleRestoreMaximizeWindow = (
		PID: number, 
		isMaximized: boolean, 
		processWindowRef: React.MutableRefObject<HTMLDivElement | null>
	): void => {

		const widthMemoization = dimensions.width;
		const heightMemoization = dimensions.height;

		const xAxisMemoization = coordinates.x;
		const yAxisMemoization = coordinates.y;

		const processWindowElement = processWindowRef.current! as HTMLDivElement;
		const processWindowParentDesktop = processWindowElement.parentElement! as HTMLDivElement;

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
			
		maximizeProcessWindow(PID, processWindowParentDesktop);

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
				${processWindowStyles[isMinimized? 'minimized' : 'normal']}
				`
			}

			ref={(node) => {
				dragRef.current = node;
				resizeData.isResizing? '' : drag(node);
			}}

			style={{
				zIndex: zIndex,
				display: getProcessWindowDisplayStyle(
					isDragging,
					currentActiveDesktopUUID,
					parentDesktopUUID,
					applicationsAreBeingShowed
				),
				...getRelativeDimensionAndCoordinatesStyle(
					dragRef,
					dimensions.width,
					dimensions.height,
					coordinates.x,
					coordinates.y
				)
			}}
			
			// click-based
			onMouseDown={(e) => handleMouseDownAndTouchStart(
				e.clientX, 
				e.clientY
			)}

			onMouseUp={handleMouseUpLeaveAndTouchEnd}
			onMouseLeave={handleMouseUpLeaveAndTouchEnd}

			onMouseMove={(e) => handleMouseMoveAndTouchMove(
				e.clientX,
				e.clientY
			)}

			// touch-based
			onTouchStart={(e) => handleMouseDownAndTouchStart(
				e.touches[0].clientX, 
				e.touches[0].clientY
			)}

			onTouchMove={(e) => handleMouseMoveAndTouchMove(
				e.touches[0].clientX,
				e.touches[0].clientY
			)}

			onTouchEnd={handleMouseUpLeaveAndTouchEnd}


			id={`${pressedCoordinates.x}:${processTitle}-${PID}:${pressedCoordinates.y}`}
        >
            <div 
				className={`
					${processWindowStyles.window__title__bar}
					${processWindowStyles[
						applicationsAreBeingShowed? 'applications__showed' : ''
					]}
					`
				}
			>
				{processTitle}
				<div className={processWindowStyles.buttons__wrapper}>
					<button onClick={() => minimizeProcessWindow(PID)}>
						<Image 
							src={WindowMinimizeIcon} 
							alt='window minimize icon'
						/>
					</button>
					<button onClick={() => handleRestoreMaximizeWindow(PID, isMaximized, dragRef)}>
						<Image 
							src={isMaximized? WindowRestoreIcon : WindowMaximizeIcon} 
							alt='window restore size icon'
						/>
					</button>
					<button onClick={() => sendSIGKILLToProcess(PID)}>
						<Image 
							src={WindowCloseIcon} 
							alt='window close icon'
						/>
					</button>
				</div>
            </div>
			<div 
				className={`
					${processWindowStyles.process__application__section} 
					${processWindowStyles[
						applicationsAreBeingShowed? 'applications__showed' : ''
					]}
					`
				}
			>
				{processElement}
			</div>
        </div>
    );
}