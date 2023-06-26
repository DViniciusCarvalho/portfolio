import { Data } from "@/types/data";
import { getCorrespondentDesktop } from "./utils";
import { desktopCanBeShowed } from "./validation";
import { backgroundDefaultOptions } from "./defaultStyle";

export const getProcessWindowDisplayStyle = (
    isDragging: boolean,
    currentActiveDesktopUUID: string,
    parentDesktopUUID: string,
    applicationsAreBeingShowed: boolean
): string => {

    const currentActiveDesktopIsNotTheParentDesktop = currentActiveDesktopUUID !== parentDesktopUUID;

    const processWindowCanNotBeDisplayed = currentActiveDesktopIsNotTheParentDesktop 
                                            && !applicationsAreBeingShowed;

    return isDragging || processWindowCanNotBeDisplayed ? 'none' : 'block';

}


export const getRelativeDimensionAndCoordinatesStyle = (
    processWindowRef: React.MutableRefObject<HTMLDivElement | null>,
    width: number,
    height: number,
    XAxis: number,
    YAxis: number
) => {

    const processWindowElement = processWindowRef.current! as HTMLDivElement;

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


export const getDesktopStyles = (
    applicationsAreBeingShowed: boolean, 
    currentActiveDesktopUUID: string, 
    UUID: string,
    applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>,
    backgroundColorPalette: string,
    backgroundIsImageBlob: boolean,
    backgroundImageUrl: string
): any => {

    const backgroundColorPaletteStyles = backgroundDefaultOptions[backgroundColorPalette];

    const applicationsAreHiddenAndIsNotCurrentDesktop = !applicationsAreBeingShowed 
                                                        && (currentActiveDesktopUUID !== UUID);

    const currentDesktopCanBeShowed = desktopCanBeShowed(
        applicationsAreBeingShowed, 
        currentActiveDesktopUUID, 
        UUID
    );

    const applicationsWindowWidth = applicationsWindowRef.current?.getBoundingClientRect().width;
    const applicationsWindowHeight = applicationsWindowRef.current?.getBoundingClientRect().height;

    return {
        display: applicationsAreHiddenAndIsNotCurrentDesktop? 'none' : 'block',
        position: currentDesktopCanBeShowed? 'absolute' : 'relative',
        width: currentDesktopCanBeShowed? applicationsWindowWidth : '220px',
        height: currentDesktopCanBeShowed? applicationsWindowHeight : '90%',
        top: currentDesktopCanBeShowed? 0 : 0,
        left: currentDesktopCanBeShowed? 0 : 0,
        transform: `scale(${currentDesktopCanBeShowed? 1 : 0.9})`,
        backgroundImage: backgroundIsImageBlob
                        ? `url(${backgroundImageUrl})` 
                        : backgroundColorPaletteStyles.desktop.backgroundImage,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
    };

}


export const getBaseDesktopStyles = (
    applicationsAreBeingShowed: boolean, 
    currentActiveDesktopUUID: string,
    baseDesktopUUID: string,
    desktopActivitiesData: Data.DesktopActivityData[],
    applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>,
    backgroundColorPalette: string,
    backgroundIsImageBlob: boolean,
    backgroundImageUrl: string
): any => {

    const backgroundColorPaletteStyles = backgroundDefaultOptions[backgroundColorPalette];

    const anInvalidDesktopIsBeingShowed = !applicationsAreBeingShowed && !getCorrespondentDesktop(
                                                                            desktopActivitiesData, 
                                                                            currentActiveDesktopUUID
                                                                         );

    const baseDesktopIsBeingShowed = currentActiveDesktopUUID === baseDesktopUUID 
                                     && !applicationsAreBeingShowed;

    const baseDesktopAndCanBeShowed = anInvalidDesktopIsBeingShowed || baseDesktopIsBeingShowed;

    const applicationsAreHiddenAndIsNotCurrentDesktop = !applicationsAreBeingShowed 
                                                        && currentActiveDesktopUUID 
                                                        !== baseDesktopUUID;

    const applicationsWindowWidth = applicationsWindowRef.current?.getBoundingClientRect().width;
    const applicationsWindowHeight = applicationsWindowRef.current?.getBoundingClientRect().height;
    backgroundColorPalette
    const stylesWithoutTransform = {
        display: applicationsAreHiddenAndIsNotCurrentDesktop && !baseDesktopAndCanBeShowed? 'none' : 'block',
        position: baseDesktopAndCanBeShowed? 'absolute' : 'relative',
        width: baseDesktopAndCanBeShowed? applicationsWindowWidth : '220px',
        height: baseDesktopAndCanBeShowed? applicationsWindowHeight : '90%',
        top: baseDesktopAndCanBeShowed? 0 : 0,
        left: baseDesktopAndCanBeShowed? 0 : 0,
        backgroundImage: backgroundIsImageBlob
                        ? `url(${backgroundImageUrl})` 
                        : backgroundColorPaletteStyles.desktop.backgroundImage,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
    };


    return {
        ...stylesWithoutTransform,
        transform: `scale(${baseDesktopAndCanBeShowed? 1 : 0.9})`
    };

}

export const getTaskBarStyles = (
    backgroundColorPalette: string,
    backgroundIsImageBlob: boolean
) => {

    return {
        backgroundImage: backgroundDefaultOptions[backgroundColorPalette].taskbar.backgroundImage,
        borderColor: backgroundDefaultOptions[backgroundColorPalette].taskbar.borderColor
    }
}