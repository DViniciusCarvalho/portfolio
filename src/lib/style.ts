import { Data } from '@/types/data';

import { 
    INITIAL_PROCESS_WINDOW_HEIGHT_IN_PERCENTAGE, 
    INITIAL_PROCESS_WINDOW_WIDTH_IN_PERCENTAGE, INITIAL_PROCESS_WINDOW_WIDTH_IN_PERCENTAGE_IF_WINDOW_LE_LIMIT, LIMIT_TO_CHANGE_INITIAL_PROCESS_WINDOW_DIMENSION_PERCENTAGE_IN_PIXELS 
} from './initial/process';

import { COLOR_PALETTE_OPTIONS } from './initial/settings';

import { 
    workspaceCanBeShowed, 
    getCorrespondentWorkspace 
} from './workspace';


export const getProcessWindowDisplayStyle = (
    currentActiveWorkspaceUUID: string,
    parentWorkspaceUUID: string,
    applicationsAreBeingShowed: boolean
): string => {

    const currentActiveWorkspaceIsNotTheParentWorkspace = currentActiveWorkspaceUUID !== parentWorkspaceUUID;

    const processWindowCanNotBeDisplayed = currentActiveWorkspaceIsNotTheParentWorkspace 
                                            && !applicationsAreBeingShowed;

    return processWindowCanNotBeDisplayed ? 'none' : 'block';

}


export const getRelativeDimensionAndCoordinatesStyle = (
    processWindowRef: React.MutableRefObject<HTMLDivElement | null>,
    width: number,
    height: number,
    XAxis: number,
    YAxis: number
) => {

    const processWindowElement = processWindowRef.current! as HTMLDivElement;
    const windowLELimit = window.innerWidth
                        <= LIMIT_TO_CHANGE_INITIAL_PROCESS_WINDOW_DIMENSION_PERCENTAGE_IN_PIXELS;

    if (processWindowElement) {
        const parentWorkspaceElement = processWindowElement.parentElement as HTMLDivElement;
        const parentWorkspaceWrapper = parentWorkspaceElement.parentElement as HTMLDivElement;
        const applicationsWindowElement = parentWorkspaceWrapper.parentElement as HTMLDivElement;

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
        width: windowLELimit
                ? `${INITIAL_PROCESS_WINDOW_WIDTH_IN_PERCENTAGE_IF_WINDOW_LE_LIMIT}%` 
                : `${INITIAL_PROCESS_WINDOW_WIDTH_IN_PERCENTAGE}%`,
        height: `${INITIAL_PROCESS_WINDOW_HEIGHT_IN_PERCENTAGE}%`,
        left: '0%',
        top: '0%'
    }
}


export const getWorkspaceStyles = (
    applicationsAreBeingShowed: boolean, 
    currentActiveWorkspaceUUID: string, 
    UUID: string,
    applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>,
    backgroundColorPalette: string,
    backgroundIsImageBlob: boolean,
    backgroundImageUrl: string
): any => {

    const colorPaletteStyles = COLOR_PALETTE_OPTIONS[backgroundColorPalette];

    const applicationsAreHiddenAndIsNotCurrentWorkspace = !applicationsAreBeingShowed 
                                                        && (currentActiveWorkspaceUUID !== UUID);

    const currentWorkspaceCanBeShowed = workspaceCanBeShowed(
        applicationsAreBeingShowed, 
        currentActiveWorkspaceUUID, 
        UUID
    );

    const applicationsWindowWidth = applicationsWindowRef.current?.getBoundingClientRect().width;
    const applicationsWindowHeight = applicationsWindowRef.current?.getBoundingClientRect().height;

    return {
        display: applicationsAreHiddenAndIsNotCurrentWorkspace? 'none' : 'block',
        position: currentWorkspaceCanBeShowed? 'absolute' : 'relative',
        width: currentWorkspaceCanBeShowed? applicationsWindowWidth : '220px',
        height: currentWorkspaceCanBeShowed? applicationsWindowHeight : '90%',
        top: currentWorkspaceCanBeShowed? 0 : 0,
        left: currentWorkspaceCanBeShowed? 0 : 0,
        transform: `scale(${currentWorkspaceCanBeShowed? 1 : 0.9})`,
        backgroundImage: backgroundIsImageBlob
                        ? `url(${backgroundImageUrl})` 
                        : colorPaletteStyles.workspace.backgroundImage,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
    };

}


export const getBaseWorkspaceStyles = (
    applicationsAreBeingShowed: boolean, 
    currentActiveWorkspaceUUID: string,
    baseWorkspaceUUID: string,
    workspaceActivitiesData: Data.WorkspaceActivityData[],
    applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>,
    backgroundColorPalette: string,
    backgroundIsImageBlob: boolean,
    backgroundImageUrl: string
): any => {

    const colorPaletteStyles = COLOR_PALETTE_OPTIONS[backgroundColorPalette];

    const currentActiveWorkspace = getCorrespondentWorkspace(
        workspaceActivitiesData, 
        currentActiveWorkspaceUUID
    );

    const anInvalidWorkspaceIsBeingShowed = !applicationsAreBeingShowed && !currentActiveWorkspace;

    const baseWorkspaceIsBeingShowed = currentActiveWorkspaceUUID === baseWorkspaceUUID 
                                       && !applicationsAreBeingShowed;

    const baseWorkspaceAndCanBeShowed = anInvalidWorkspaceIsBeingShowed || baseWorkspaceIsBeingShowed;

    const applicationsAreHiddenAndIsNotCurrentWorkspace = !applicationsAreBeingShowed 
                                                        && currentActiveWorkspaceUUID 
                                                        !== baseWorkspaceUUID;

    const applicationsWindowWidth = applicationsWindowRef.current?.getBoundingClientRect().width;
    const applicationsWindowHeight = applicationsWindowRef.current?.getBoundingClientRect().height;

    const stylesWithoutTransform = {
        display: applicationsAreHiddenAndIsNotCurrentWorkspace && !baseWorkspaceAndCanBeShowed? 'none' : 'block',
        position: baseWorkspaceAndCanBeShowed? 'absolute' : 'relative',
        width: baseWorkspaceAndCanBeShowed? applicationsWindowWidth : '220px',
        height: baseWorkspaceAndCanBeShowed? applicationsWindowHeight : '90%',
        top: baseWorkspaceAndCanBeShowed? 0 : 0,
        left: baseWorkspaceAndCanBeShowed? 0 : 0,
        backgroundImage: backgroundIsImageBlob
                        ? `url(${backgroundImageUrl})` 
                        : colorPaletteStyles.workspace.backgroundImage,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
    };


    return {
        ...stylesWithoutTransform,
        transform: `scale(${baseWorkspaceAndCanBeShowed? 1 : 0.9})`
    };

}


export const getTaskBarStyles = (
    backgroundColorPalette: string,
    backgroundIsImageBlob: boolean
) => {

    return {
        backgroundImage: COLOR_PALETTE_OPTIONS[backgroundColorPalette].taskbar.backgroundImage,
        borderColor: COLOR_PALETTE_OPTIONS[backgroundColorPalette].taskbar.borderColor
    };
}