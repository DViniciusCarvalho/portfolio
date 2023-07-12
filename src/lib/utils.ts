import { isValidElement } from 'react';
import { Data } from '@/types/data';
import { Props } from '@/types/props';
import { INITIAL_PROCESS_WINDOW_HEIGHT_IN_PERCENTAGE, INITIAL_PROCESS_WINDOW_WIDTH_IN_PERCENTAGE_IF_WINDOW_LE_LIMIT, LIMIT_TO_CHANGE_INITIAL_PROCESS_WINDOW_DIMENSION_PERCENTAGE_IN_PIXELS } from './constants';


export const deepClone = <T>(object: T): T => {

    if (typeof object !== 'object' || object === null) return object;

    if (isValidElement(object)) return object as unknown as T;
    
    const newObject: T | [] | {} = Array.isArray(object)? [] : {};

    for (let key in object) {
        const value = object[key];
        (newObject as T)[key] = deepClone(value);
    }

    return newObject as T;
}

export const debounce = <T extends Function>(func: T, wait: number, immediate: boolean) => {
    let timeout: ReturnType<typeof setTimeout> | null;
    return function(this: any, ...args: any) {
        const context = this;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout!);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
};


export const generateUUID = (): string => {
    const replaceFunction = (char: string): string => {
        const randomNumber = (Math.random() * 16) | 0;
        const value = (char === 'x') ? randomNumber : (randomNumber & 0x3) | 0x8;

        return value.toString(16);
    };

    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, replaceFunction);

    return uuid;
}

export const generateJSXKey = (type: string, name: string, index: number): string => {
    const key = `${type}-${name}:${index}`;

    return key;
}


export const getDateString = (): string => {
    const currentDate = new Date();

    const weekDay = currentDate.toLocaleDateString('en-us', { weekday: 'short' }).toLowerCase();
    const month = currentDate.toLocaleDateString('en-us', { month: 'short' }).toLowerCase();
    const monthDay = currentDate.toLocaleDateString('en-us', { day: '2-digit' });

    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');

    return `${weekDay} ${month} ${monthDay} ${hours}:${minutes}`;
}


export const getCorrespondentRunningProcess = (
    opennedProcessesData: Data.OpennedProcessData[],
    PID: number
): Data.OpennedProcessData | undefined => {

    const processFound = opennedProcessesData.find(processData => 
        processData.PID === PID
    );
    
    return processFound;
}


export const getCorrespondentDesktop = (
    desktopActivitiesData: Data.DesktopActivityData[],
    UUID: string
): Data.DesktopActivityData | undefined => {

    const desktopFound = desktopActivitiesData.find(desktopActivityData => 
        desktopActivityData.UUID === UUID
    );
    
    return desktopFound;
}


export const getProcessWindowParentDesktopUUID = (
    currentActiveDesktopUUID: string, 
    currentActiveDesktopDoesNotExists: boolean,
    baseDesktopUUID: string
): string => {

    const currentUUIDEqualsToBaseDesktopUUID = currentActiveDesktopUUID === baseDesktopUUID;
    const invalidUUID = currentActiveDesktopDoesNotExists || currentUUIDEqualsToBaseDesktopUUID;

    return invalidUUID? generateUUID() : currentActiveDesktopUUID;
}


export const getRelativeInitialDimension = (
    axis: string, 
    percentage: number, 
    applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>
): number => {
    
    const applicationsWindowElement = applicationsWindowRef.current as HTMLDivElement;

    const applicationsWindowWidth = applicationsWindowElement.getBoundingClientRect().width;
    const applicationsWindowHeight = applicationsWindowElement.getBoundingClientRect().height;

    return axis === 'x'
            ? applicationsWindowWidth * percentage / 100
            : applicationsWindowHeight * percentage / 100;
}


export const getInitialProcessWindowDimensions = (
    window: Window, 
    applicationsWindowRef: React.MutableRefObject<HTMLDivElement | null>
) => {

    const windowLELimit = window.innerWidth 
                        <= LIMIT_TO_CHANGE_INITIAL_PROCESS_WINDOW_DIMENSION_PERCENTAGE_IN_PIXELS;

    
    const initialWidthPercentage = windowLELimit
                                    ? INITIAL_PROCESS_WINDOW_WIDTH_IN_PERCENTAGE_IF_WINDOW_LE_LIMIT
                                    : INITIAL_PROCESS_WINDOW_HEIGHT_IN_PERCENTAGE;

    return {
        width: getRelativeInitialDimension(
            'x', 
            initialWidthPercentage, 
            applicationsWindowRef
        ),
        height: getRelativeInitialDimension(
            'y', 
            INITIAL_PROCESS_WINDOW_HEIGHT_IN_PERCENTAGE, 
            applicationsWindowRef
        )
    }

}


export const getCurrentDesktopProcessesWindow = (
    opennedProcessesData: Data.OpennedProcessData[],
    UUID: string
): Data.OpennedProcessData[] => {

    const currentDesktopProcessesWindow = opennedProcessesData.filter(opennedProcessData => {
        return opennedProcessData.parentDesktopUUID === UUID;
    });

    return currentDesktopProcessesWindow;
}

export 	const getFilteredApplicationsByNameAndMetadata = (
    applicationIconProps: (Props.ApplicationIconProps & Data.ApplicationMetadata)[],
    filterString: string
): Props.ApplicationIconProps[] => {

    const filterApplicationsFunction = (
        applicationIconProps: Props.ApplicationIconProps & Data.ApplicationMetadata
    ) => {

        const descriptionIncludesFilterString = applicationIconProps.metadata.description
                                                .toLowerCase()
                                                .includes(filterString.toLowerCase());

        const someKeyWordIncludesFilterString = applicationIconProps.metadata.keyWords.some(keyword => {
            return keyword.toLowerCase().includes(filterString.toLowerCase());
        });

        const someCategoryIncludesFilterString = applicationIconProps.metadata.category.some(category => {
            return category.toLowerCase().includes(filterString.toLowerCase());
        });

        const applicationNameIncludesFilterString = applicationIconProps.applicationName
                                                    .toLowerCase()
                                                    .includes(filterString.toLowerCase());

        return descriptionIncludesFilterString 
                || someKeyWordIncludesFilterString 
                || someCategoryIncludesFilterString
                || applicationNameIncludesFilterString;
    };

    const removeMetadataFunction = (
        applicationIconProps: Props.ApplicationIconProps & Data.ApplicationMetadata
    ) => {

        const { metadata, ...applicationIconPropsWithoutMetadata } = applicationIconProps;

        return applicationIconPropsWithoutMetadata;
    };

    const filteredApplicationsIconProps = applicationIconProps
                                            .filter(filterApplicationsFunction);

    const filteredApplicationsIconPropsWithoutMetadata = filteredApplicationsIconProps
                                                            .map(removeMetadataFunction);

    return filteredApplicationsIconPropsWithoutMetadata;
}