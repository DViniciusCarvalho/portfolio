import { Directory } from '../models/Directory';
import { File } from '../models/File';


const ONE_DAY_IN_MILLISECONDS = 60 * 60 * 24 * 1000;

export const changeContentUpdateTimestamps = (
    fileOrDirectory: File | Directory,
    currentTimestamp: number
): void => {

    const fileOrDirectoryTimestamps = fileOrDirectory.timestamp;

    fileOrDirectoryTimestamps.access = currentTimestamp;
    fileOrDirectoryTimestamps.modify = currentTimestamp;
    fileOrDirectoryTimestamps.change = currentTimestamp;
}


export const changeMetadataUpdateTimestamps = (
    fileOrDirectory: File | Directory,
    currentTimestamp: number
): void => {

    const fileOrDirectoryTimestamps = fileOrDirectory.timestamp;

    fileOrDirectoryTimestamps.change = currentTimestamp;
}


export const changeReadingTimestamps = (
    fileOrDirectory: File | Directory,
    currentTimestamp: number
): void => {

    const fileOrDirectoryTimestamps = fileOrDirectory.timestamp;

    fileOrDirectoryTimestamps.access = currentTimestamp;
}


export const getDaysDifference = (
    timestamp1: number,
    timestamp2: number
): number => {

    const diffInMilliseconds = Math.abs(timestamp2 - timestamp1)
    const diffInDays = Math.floor(diffInMilliseconds / ONE_DAY_IN_MILLISECONDS);

    return diffInDays;
}


export const isExactlyDaysValue = (
    currentTimestamp: number,
    targetTimestamp: number,
    targetDifference: number
): boolean => {

    const differenceInDays = getDaysDifference(targetTimestamp, currentTimestamp);

    return differenceInDays === targetDifference;
}


export const isGreaterThanDaysValue = (
    currentTimestamp: number,
    targetTimestamp: number,
    targetDifference: number
): boolean => {

    const differenceInDays = getDaysDifference(targetTimestamp, currentTimestamp);

    return differenceInDays > targetDifference;
}


export const isLessThanDaysValue = (
    currentTimestamp: number,
    targetTimestamp: number,
    targetDifference: number
): boolean => {

    const differenceInDays = getDaysDifference(targetTimestamp, currentTimestamp);
    
    return differenceInDays < targetDifference;
}