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

	function handleMouseUpAndLeave(event: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent): void {
		if (resizeData.isResizing) {
			setResizeData(previous => ({
				isResizing: false,
				resizeSide: ''
			}));
		}
	}

	function handleMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent): void {
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

	function handleRestoreMaximizeWindow(
		PID: number, 
		isMaximized: boolean, 
		processWindowRef: React.MutableRefObject<HTMLDivElement | null>
	): void {

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

	
	function getProcessWindowDisplay(
		isDragging: boolean,
		currentActiveDesktopUUID: string,
		parentDesktopUUID: string,
		applicationsAreBeingShowed: boolean
	): string {

		const currentActiveDesktopIsNotTheParentDesktop = currentActiveDesktopUUID !== parentDesktopUUID;

		const processWindowCanNotBeDisplayed = currentActiveDesktopIsNotTheParentDesktop 
												&& !applicationsAreBeingShowed;

		return isDragging || processWindowCanNotBeDisplayed ? 'none' : 'block';

	}


	function calculateRelativeDimensionAndCoordinates(
		width: number,
		height: number,
		XAxis: number,
		YAxis: number
	) {

		const processWindowElement = dragRef.current! as HTMLDivElement;

		if (processWindowElement) {
			const parentDesktopElement = processWindowElement.parentElement as HTMLDivElement;
			const parentDesktopWrapper = parentDesktopElement.parentElement as HTMLDivElement;
			const applicationsWindowElement = parentDesktopWrapper.parentElement as HTMLDivElement;

			const applicationsWindowWidth = applicationsWindowElement.getBoundingClientRect().width;
			const applicationsWindowHeight = applicationsWindowElement.getBoundingClientRect().height;

			const relativeWidth = width / applicationsWindowWidth * 100;
			const relativeHeight = height / applicationsWindowHeight * 100;
			const relativeXAxis = XAxis / applicationsWindowWidth * 100;
			const relativeYAxis = YAxis / applicationsWindowHeight * 100;

			return {
				width: `${relativeWidth}%`,
				height: `${relativeHeight}%`,
				left: `${relativeXAxis}%`,
				top: `${relativeYAxis}%`
			};
		}

		return {
			width: '60%',
			height: '60%',
			left: '0%',
			top: '0%'
		}
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
				display: getProcessWindowDisplay(
					isDragging,
					currentActiveDesktopUUID,
					parentDesktopUUID,
					applicationsAreBeingShowed
				),
				...calculateRelativeDimensionAndCoordinates(
					dimensions.width,
					dimensions.height,
					coordinates.x,
					coordinates.y
				)
			}}
			onMouseDown={(e) => handleMouseDown(e)}
			onMouseUp={(e) =>  handleMouseUpAndLeave(e)}
			onMouseLeave={(e) => handleMouseUpAndLeave(e)}
			onMouseMove={(e) => handleMouseMove(e)}
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