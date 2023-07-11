import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
import processWindowStyles from '@/styles/workarea/window/ProcessWindow.module.sass';
import Image, { StaticImageData } from 'next/image';

import WindowCloseIconDark from '../../../../public/assets/dark/window-close-symbolic.svg';
import WindowRestoreIconDark from '../../../../public/assets/dark/window-restore-symbolic.svg';
import WindowMaximizeIconDark from '../../../../public/assets/dark/window-maximize-symbolic.svg';
import WindowMinimizeIconDark from '../../../../public/assets/dark/window-minimize-symbolic.svg';

import WindowCloseIconLight from '../../../../public/assets/light/window-close-symbolic.svg';
import WindowRestoreIconLight from '../../../../public/assets/light/window-restore-symbolic.svg';
import WindowMaximizeIconLight from '../../../../public/assets/light/window-maximize-symbolic.svg';
import WindowMinimizeIconLight from '../../../../public/assets/light/window-minimize-symbolic.svg';

import { Props } from '@/types/props';
import { MainContext } from '../Main';
import { isResizeAction } from '@/lib/validation';

import { 
	getProcessWindowDisplayStyle, 
	getRelativeDimensionAndCoordinatesStyle 
} from '@/lib/style';

import ProcessWindowMinimalContentVersion from './ProcessWindowMinimalContentVersion';


export default function ProcessWindow({ 
	PID, 
	processTitle, 
	processIcon,
	processElement, 
	zIndex,
	isMinimized,
	isMaximized,
	parentDesktopUUID,
	coordinates,
	dimensions
}: Props.ProcessWindowProps) {

	const { 
		systemTheme,
		elevateProcessWindowZIndex, 
		sendSIGKILLToProcess, 
		minimizeProcessWindow, 
		restoreProcessWindowLastDimensions,
		maximizeProcessWindow,
		updateProcessWindowDimensions,
		currentActiveDesktopUUID,
		applicationsAreBeingShowed,
		updateProcessCoordinates
	} = useContext(MainContext);


    const dragRef = useRef<HTMLDivElement | null>(null);

	const [ windowCloseIcon, setWindowCloseIcon ] = useState<StaticImageData>(WindowCloseIconDark);
	const [ windowRestoreIcon, setWindowRestoreIcon ] = useState<StaticImageData>(WindowRestoreIconDark);
	const [ windowMaximizeIcon, setWindowMaximizeIcon ] = useState<StaticImageData>(WindowMaximizeIconDark);
	const [ windowMinimizeIcon, setWindowMinimizeIcon ] = useState<StaticImageData>(WindowMinimizeIconDark);

	const [ windowTitleBarBeingPressed, setWindowTitleBarBeingPressed ] = useState(false);

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

	const processWindowMinimizedVersionProps: Props.ProcessWindowMinimalContentVersionProps = {
		processIcon: processIcon, 
		processName: processTitle
	};

	useEffect(() => {
		const isDarkTheme = systemTheme === 'dark';
		const closeWindowIcon = isDarkTheme? WindowCloseIconDark : WindowCloseIconLight;
		const restoreWindowIcon = isDarkTheme? WindowRestoreIconDark : WindowRestoreIconLight;
		const maximizeWindowIcon = isDarkTheme? WindowMaximizeIconDark : WindowMaximizeIconLight;
		const minimizeWindowIcon = isDarkTheme? WindowMinimizeIconDark : WindowMinimizeIconLight;

		setWindowCloseIcon(previous => closeWindowIcon);
		setWindowRestoreIcon(previous => restoreWindowIcon);
		setWindowMaximizeIcon(previous => maximizeWindowIcon);
		setWindowMinimizeIcon(previous => minimizeWindowIcon);
	});



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

			return;
		}

		if (isDragging && windowTitleBarBeingPressed) {
			const currentXAxis = clientX - pressedCoordinates.x;
			const currentYAxis = clientY - pressedCoordinates.y;
	
			updateProcessCoordinates(PID, currentXAxis, currentYAxis);
	
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
				${processWindowStyles[systemTheme]}
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

				// click-based
				onMouseDown={() => setWindowTitleBarBeingPressed(previous => true)}
				onMouseUp={() => setWindowTitleBarBeingPressed(previous => false)}
				onMouseLeave={() => setWindowTitleBarBeingPressed(previous => false)}

				// touch-based
				onTouchStart={() => setWindowTitleBarBeingPressed(previous => true)}
				onTouchEnd={() => setWindowTitleBarBeingPressed(previous => false)}
			>
				{processTitle}
				<div className={processWindowStyles.buttons__wrapper}>
					<button onClick={() => minimizeProcessWindow(PID)}>
						<Image 
							src={windowMinimizeIcon} 
							alt='window minimize icon'
						/>
					</button>
					<button onClick={() => handleRestoreMaximizeWindow(PID, isMaximized, dragRef)}>
						<Image 
							src={isMaximized? windowRestoreIcon : windowMaximizeIcon} 
							alt='window restore size icon'
						/>
					</button>
					<button onClick={() => sendSIGKILLToProcess(PID)}>
						<Image 
							src={windowCloseIcon} 
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
				{applicationsAreBeingShowed
					? <ProcessWindowMinimalContentVersion {...processWindowMinimizedVersionProps}/> 
					: processElement
				}
			</div>
        </div>
    );
}