import React, { useContext, useRef, useState } from 'react';
import processWindowStyles from '@/styles/workarea/window/ProcessWindow.module.sass';
import Image from 'next/image';

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
import { getResizeSide } from '@/lib/validation';

import { 
	getProcessWindowDisplayStyle, 
	getRelativeDimensionAndCoordinatesStyle 
} from '@/lib/style';

import ProcessWindowMinimalContentVersion from './ProcessWindowMinimalContentVersion';
import { delay } from '@/lib/utils';


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
		updateProcessWindowCoordinates
	} = useContext(MainContext);


    const processWindowRef = useRef<HTMLDivElement | null>(null);
	const processWindowTitleBarRef = useRef<HTMLDivElement | null>(null);

	const [ isDragging, setIsDragging ] = useState(false);
	const [ alreadyRestoredDimension, setAlreadyRestoredDimension ] = useState(true);

	const [ processWindowResizeData, setProcessWindowResizeData ] = useState({
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

	const processWindowMinimizedVersionProps: Props.ProcessWindowMinimalContentVersionProps = {
		processIcon: processIcon, 
		processName: processTitle
	};


	const memoizeProcessWindowPressedCoordinates = (
		clientX: number,
		clientY: number
	): void => {

		const elementXAxis = processWindowRef.current!.getBoundingClientRect().x;
		const elementYAxis = processWindowRef.current!.getBoundingClientRect().y;

		setPressedCoordinates(previous => ({
			x: clientX - elementXAxis,
			y: clientY - elementYAxis
		}));

	}


	const handleProcessWindowStartPressing = (
		clientX: number,
		clientY: number,
		pressedTarget: EventTarget
	): void => {

		const isProcessWindowTitleBarBeingPressed = pressedTarget === processWindowTitleBarRef.current!;

		const sideToResize = getResizeSide(clientX, clientY, processWindowRef);
		const isDragAction = isProcessWindowTitleBarBeingPressed && !sideToResize;

		if (sideToResize) {

			setPreviousPressedCoordinates(previous => ({
				x: clientX,
				y: clientY
			}));

			setProcessWindowResizeData(previous => ({
				isResizing: true,
				resizeSide: sideToResize
			}));

		}
		else if (isDragAction) {

			setIsDragging(previous => true);
			memoizeProcessWindowPressedCoordinates(clientX, clientY);

		}
		
		elevateProcessWindowZIndex(PID);
		
	}


	const handleProcessWindowMovement = (
		clientX: number,
		clientY: number
	): void => {

		if (
			processWindowResizeData.isResizing 
			&& getResizeSide(clientX, clientY, processWindowRef) 
			&& !isMaximized
		) {

			updateProcessWindowDimensions(
				PID,
				clientX, 
				clientY,
				previousPressedCoordinates.x,
				previousPressedCoordinates.y,
				processWindowRef, 
				processWindowResizeData.resizeSide
			);

			setPreviousPressedCoordinates(previous => ({
				x: clientX,
				y: clientY
			}));

		}
		else if (isDragging) {

			if (isMaximized) {
				handleRestoreMaximizeWindow(
					PID,
					isMaximized,
					processWindowRef
				);
			}

			const currentXAxis = clientX - pressedCoordinates.x;
			const currentYAxis = clientY - pressedCoordinates.y;
	
			updateProcessWindowCoordinates(
				PID, 
				currentXAxis, 
				currentYAxis
			);

		}

	}


	const handleProcessWindowEndPressing = (): void => {
		
		if (processWindowResizeData.isResizing) {
			setProcessWindowResizeData(previous => ({
				isResizing: false,
				resizeSide: ''
			}));
		}
		else if (isDragging) {
			setIsDragging(previous => false);
		}

	}


	const handleRestoreMaximizeWindow = async (
		PID: number, 
		isMaximized: boolean, 
		processWindowRef: React.MutableRefObject<HTMLDivElement | null>
	): Promise<void> => {

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
			
			await delay(2);
			
			setAlreadyRestoredDimension(previous => true);

			return;
		}
			
		maximizeProcessWindow(PID, processWindowParentDesktop);
		setAlreadyRestoredDimension(previous => false);

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
				${processWindowStyles[isMinimized? 'minimized' : 'non-minimized']}
				${processWindowStyles[systemTheme]}
				`
			}
			style={{
				zIndex: zIndex,
				display: getProcessWindowDisplayStyle(
					currentActiveDesktopUUID,
					parentDesktopUUID,
					applicationsAreBeingShowed
				),
				...getRelativeDimensionAndCoordinatesStyle(
					processWindowRef,
					dimensions.width,
					dimensions.height,
					coordinates.x,
					coordinates.y
				),
				transition: isDragging && !isMaximized && alreadyRestoredDimension
							? 'transform 0s, width 0s, height 0s, left 0s, top 0s' 
							: 'transform 0.3s, width 0.3s, height 0.3s, left 0.3s, top 0.3s'
			}}
			id={`${pressedCoordinates.x}:${processTitle}-${PID}:${pressedCoordinates.y}`}
			ref={processWindowRef}
			
			// click-based
			onMouseDown={(e) => handleProcessWindowStartPressing(
				e.clientX, 
				e.clientY,
				e.target
			)}
			onMouseMove={(e) => handleProcessWindowMovement(
				e.clientX,
				e.clientY
			)}
			onMouseUp={handleProcessWindowEndPressing}
			onMouseLeave={handleProcessWindowEndPressing}

			// touch-based
			onTouchStart={(e) => handleProcessWindowStartPressing(
				e.touches[0].clientX, 
				e.touches[0].clientY,
				e.target
			)}
			onTouchMove={(e) => handleProcessWindowMovement(
				e.touches[0].clientX,
				e.touches[0].clientY
			)}
			onTouchEnd={handleProcessWindowEndPressing}
        >
            <div 
				className={`
					${processWindowStyles.window__title__bar}
					${processWindowStyles[
						applicationsAreBeingShowed? 'app-showed' : 'app-not-showed'
					]}
					`
				}
				ref={processWindowTitleBarRef}
			>
				{processTitle}
				<div className={processWindowStyles.buttons__wrapper}>
					<button onClick={() => minimizeProcessWindow(PID)}>
						<Image 
							src={systemTheme === 'dark'? WindowMinimizeIconDark : WindowMinimizeIconLight} 
							alt='window minimize icon'
						/>
					</button>
					<button onClick={() => handleRestoreMaximizeWindow(PID, isMaximized, processWindowRef)}>
						<Image 
							src={isMaximized
								? systemTheme === 'dark'? WindowRestoreIconDark : WindowRestoreIconLight 
								: systemTheme === 'dark'? WindowMaximizeIconDark : WindowMaximizeIconLight
							} 
							alt='window restore size icon'
						/>
					</button>
					<button onClick={() => sendSIGKILLToProcess(PID)}>
						<Image 
							src={systemTheme === 'dark'? WindowCloseIconDark : WindowCloseIconLight} 
							alt='window close icon'
						/>
					</button>
				</div>
            </div>
			<div 
				className={`
					${processWindowStyles.process__application__section} 
					${processWindowStyles[
						applicationsAreBeingShowed? 'app-showed' : 'app-not-showed'
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