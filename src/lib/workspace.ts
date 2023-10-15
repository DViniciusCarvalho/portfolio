import { Data } from '@/types/data';


export const parentWorkspaceIsNowVoid = (
    opennedProcessesData: Data.OpennedProcessData[], 
    desktopUUID: string
): boolean => {

    const parentDesktopChildren = opennedProcessesData.filter(opennedProcessData => {
        return opennedProcessData.parentWorkspaceUUID === desktopUUID;
    });

    return parentDesktopChildren.length <= 1;
}


export const workspaceCanBeShowed = (
    applicationsAreBeingShowed: boolean, 
    currentActiveDesktopUUID: string, 
    UUID: string
): boolean => {
    
    return !(applicationsAreBeingShowed || currentActiveDesktopUUID !== UUID);
}


export const getCurrentWorkspaceProcessesWindow = (
    opennedProcessesData: Data.OpennedProcessData[],
    desktopUUID: string
): Data.OpennedProcessData[] => {

    const currentDesktopProcessesWindow = opennedProcessesData.filter(opennedProcessData => {
        return opennedProcessData.parentWorkspaceUUID === desktopUUID;
    });

    return currentDesktopProcessesWindow;
}


export const getCorrespondentWorkspace = (
    desktopActivitiesData: Data.WorkspaceActivityData[],
    UUID: string
): Data.WorkspaceActivityData | undefined => {

    const desktopFound = desktopActivitiesData.find(desktopActivityData => 
        desktopActivityData.UUID === UUID
    );
    
    return desktopFound;
}
