import React, { 
	useContext, 
	useRef, 
	useState 
} from 'react';

import Image from 'next/image';
import processWindowStyles from '@/styles/workarea/window/ProcessWindow.module.sass';
import { MainContext } from '../Main';
import { Props } from '@/types/props';

import { 
	getProcessWindowDisplayStyle, 
	getRelativeDimensionAndCoordinatesStyle 
} from '@/lib/style';

import { delay } from '@/lib/utils';
import { getResizeSide } from '@/lib/resize';
import ProcessWindowMinimalContentVersion from './ProcessWindowMinimalContentVersion';


export default function ProcessWindow({ 
	PID, 
	processTitle, 
	processIcon,
	processIconAlt,
	processElement, 
	zIndex,
	isMinimized,
	isMaximized,
	parentWorkspaceUUID,
	coordinates,
	dimensions
}: Props.ProcessWindowProps) {

	const processWindowRef = useRef<HTMLDivElement | null>(null);
	const processWindowTitleBarRef = useRef<HTMLDivElement | null>(null);


	const { 
		systemTheme,
		elevateProcessWindowZIndex, 
		finishGraphicalProcess, 
		minimizeProcessWindow, 
		restoreProcessWindowLastDimensions,
		maximizeProcessWindow,
		updateProcessWindowDimensions,
		currentActiveWorkspaceUUID,
		applicationsAreBeingShowed,
		updateProcessWindowCoordinates
	} = useContext(MainContext);


	const [ 
		isDragging, 
		setIsDragging 
	] = useState(false);

	const [ 
		alreadyRestoredDimension, 
		setAlreadyRestoredDimension 
	] = useState(true);

	const [ 
		processWindowResizeData, 
		setProcessWindowResizeData 
	] = useState({
		isResizing: false,
		resizeSide: ''
	});

	const [ 
		previousPressedCoordinates, 
		setPreviousPressedCoordinates 
	] = useState({
		x: 0,
		y: 0
	});

	const [ 
		pressedCoordinates, 
		setPressedCoordinates 
	] = useState({
		x: 0,
		y: 0
	});

	const [ 
		lastDimensionsCoordBeforeMaximize, 
		setLastDimensionsCoordBeforeMaximize 
	] = useState({
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
		processIconAlt: processIconAlt,
		processName: processTitle
	};


	function memoizeProcessWindowPressedCoordinates(
		clientX: number,
		clientY: number
	): void {

		const elementXAxis = processWindowRef.current!.getBoundingClientRect().x;
		const elementYAxis = processWindowRef.current!.getBoundingClientRect().y;

		setPressedCoordinates(previous => ({
			x: clientX - elementXAxis,
			y: clientY - elementYAxis
		}));
	}


	function handleProcessWindowStartPressing(
		clientX: number,
		clientY: number,
		pressedTarget: EventTarget
	): void {

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


	function handleProcessWindowMovement(
		clientX: number,
		clientY: number
	): void {

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


	function handleProcessWindowEndPressing(): void {
		
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


	async function handleRestoreMaximizeWindow(
		PID: number, 
		isMaximized: boolean, 
		processWindowRef: React.MutableRefObject<HTMLDivElement | null>
	): Promise<void> {

		const widthMemoization = dimensions.width;
		const heightMemoization = dimensions.height;

		const xAxisMemoization = coordinates.x;
		const yAxisMemoization = coordinates.y;

		const processWindowElement = processWindowRef.current! as HTMLDivElement;
		const processWindowParentWorkspace = processWindowElement.parentElement! as HTMLDivElement;

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
			
		maximizeProcessWindow(PID, processWindowParentWorkspace);
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
				${processWindowStyles[isMinimized? 'minimized' : 'non--minimized']}
				${processWindowStyles[systemTheme]}
				`
			}
			style={{
				zIndex: zIndex,
				display: getProcessWindowDisplayStyle(
					currentActiveWorkspaceUUID,
					parentWorkspaceUUID,
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
						applicationsAreBeingShowed? 'app--showed' : 'app--not--showed'
					]}
					`
				}
				ref={processWindowTitleBarRef}
			>
				{processTitle}
				<div className={processWindowStyles.buttons__wrapper}>
					<button onClick={() => minimizeProcessWindow(PID)}>
						<Image 
							src={require(
								`../../../../public/assets/${systemTheme}/window-minimize-symbolic.svg`
							)} 
							alt={'Window minimize icon: it\'s a simple horizontal straight line, a minus symbol'}
						/>
					</button>
					<button 
						onClick={() => handleRestoreMaximizeWindow(
							PID, 
							isMaximized, 
							processWindowRef
						)}
					>
						<Image 
							src={require(
								`../../../../public/assets/${systemTheme}/${
									isMaximized
									? 'window-restore-symbolic.svg' 
									: 'window-maximize-symbolic.svg'
								}`
							)} 
							alt={'Window restore icon: it\'s a simple rectangle'}
						/>
					</button>
					<button onClick={() => finishGraphicalProcess(PID)}>
						<Image 
							src={require(
								`../../../../public/assets/${systemTheme}/window-close-symbolic.svg`
							)} 
							alt={'Window close icon: it\'s a x symbol, two lines crossed'}
						/>
					</button>
				</div>
            </div>
			<div 
				className={`
					${processWindowStyles.process__application__section} 
					${processWindowStyles[
						applicationsAreBeingShowed? 'app--showed' : 'app--not--showed'
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