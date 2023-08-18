import { Data } from "@/types/data";
import { File } from "../models/File";
import { Directory } from "../models/Directory";
import { ExecutionTreeError } from "../../exception";


const getResolvedPath = (
    path: string,
    cwd: string,
    currentUser: string
): string => {

    const PARENT_DIRECTORY_PATTERN = /^\.\.\/|\.\.$/;
    const CURRENT_DIRECTORY_PATTERN = /^\.\/|\./;
    const HOME_DIRECTORY_PATTERN = /^~\//;
    const LAST_DIRECTORY_PATTERN = /\/[^\/]+$/;

    const SLASH_AT_END_PATTERN = /\/$/;

    const isRelativePath = !path.startsWith('/');

    if (isRelativePath) {
        const isParentDirectory = path.match(PARENT_DIRECTORY_PATTERN);
        const isCurrentDirectory = path.match(CURRENT_DIRECTORY_PATTERN);
        const isCurrentUserHomeDirectory = path.match(HOME_DIRECTORY_PATTERN);

        if (isParentDirectory) {
            const cwdWithoutLastDir = cwd.replace(LAST_DIRECTORY_PATTERN, '');
            path = path.replace(PARENT_DIRECTORY_PATTERN, `${cwdWithoutLastDir}/`);
        }
        else if (isCurrentDirectory) {
            path = path.replace(CURRENT_DIRECTORY_PATTERN, cwd);
        }
        else if (isCurrentUserHomeDirectory) {
            const resolvedHomeDir = currentUser === 'root'? '/root' : `/home/${currentUser}`;
            path = path.replace(HOME_DIRECTORY_PATTERN, resolvedHomeDir);
        }
        else {
            path = cwd === '/'? `${cwd}${path}` : `${cwd}/${path}`;
        }
    }

    return path.length > 1? path.replace(SLASH_AT_END_PATTERN, '') : path;

}


const getSplittedPathParts = (resolvedPath: string) => {
    const FILESYSTEM_ROOT_PATTERN = /^\//;

    resolvedPath = resolvedPath.replace(FILESYSTEM_ROOT_PATTERN, '');

    const directories = resolvedPath.split('/').filter(dir => dir !== '');

    return directories;
}


export const checkProvidedPath = (
    path: string,
    cwd: string, 
    currentUser: string,
    fileSystem: Data.SystemDirectory
) => {

    const resolvedPath = getResolvedPath(path, cwd, currentUser);

    if (resolvedPath === '/') {
        return {
            valid: true,
            resolvedPath: '/',
            validAs: 'directory'
        };
    }

    const pathParts = getSplittedPathParts(resolvedPath);

    let currentDirAcc = fileSystem;
    let isValidDirectory = false;
    let isValidFile = false;
    let insideFileError = false;

    for (let i = 0; i < pathParts.length; i++) {
        const pathPart = pathParts[i];
        const isLastPart = i === pathParts.length - 1;

        const directory = currentDirAcc.children.directories.find(dir => dir.name === pathPart);
        const file = currentDirAcc.children.files.find(file => file.name === pathPart);

        if (directory) {
            const dirIndex = getDirectoryIndex(pathPart, currentDirAcc.children.directories);

            isValidDirectory = true;
            isValidFile = false;

            currentDirAcc = currentDirAcc.children.directories[dirIndex];
        }
        else if (file) {
            if (isLastPart) {
                isValidFile = true;
                isValidDirectory = false;
    
                break;
            }

            insideFileError = true;
        }
        else {
            isValidDirectory = false;
            isValidFile = false;
        }
    }

    const pathIsValid = isValidDirectory || isValidFile;

    return {
        valid: pathIsValid,
        resolvedPath: resolvedPath,
        validAs: pathIsValid? (isValidDirectory? 'directory' : 'file') : null,
        insideFileError: insideFileError
    };
}


const getDirectoryIndex = (
    name: string,
    directoryArray: Data.SystemDirectory[]
): number => {

    let index = -1;

    for (let i = 0; i < directoryArray.length; i++) {
        index = directoryArray[i].name === name? i : index;
    }

    return index;
}


export const getDirectoryData = (
    dirPath: string, 
    cwd: string,
    currentUser: string,
    filesystem: Data.SystemDirectory
): Data.SystemDirectory => {

    const resolvedPath = getResolvedPath(dirPath, cwd, currentUser);
    const directories = getSplittedPathParts(resolvedPath);

    const directoryData = directories.length? directories.reduce((
        acc: Data.SystemDirectory, 
        current: string
    ) => {

        const accumulatorDirectories = acc.children.directories;
        const directoryIndex = getDirectoryIndex(current, accumulatorDirectories);

        acc = acc.children.directories[directoryIndex];

        return acc;

    }, filesystem) : [];

    return directoryData as Data.SystemDirectory;
}


const getFileIndex = (
    name: string,
    fileArray: Data.SystemFile[]
) => {

    let index = -1;

    for (let i = 0; i < fileArray.length; i++) {
        index = fileArray[i].name === name? i : index;
    }

    return index;
}


export const getFileData = (
    directory: Data.SystemDirectory,
    fileName: string
) => {
    const directoryFiles = directory.children.files;

    const fileIndex = getFileIndex(fileName, directoryFiles);

    return directory.children.files.at(fileIndex);
}


export const getFileOrDirectoryBytesSize = (
    object: File | Directory
): number => {

    const jsonString = JSON.stringify(object);
    const bytes = new TextEncoder().encode(jsonString).length;

    return bytes;
}


const logicalNOT = (
    binary: string
) => {

    let result = '';

    for (let i = 0; i < binary.length; i++) {
        result += binary[i] === '0' ? '1' : '0';
    }

    return result;
}


const logicalAND = (
    binary1: string,
    binary2: string
) => {

    let result = '';

    for (let i = 0; i < binary1.length; i++) {
        result += binary1[i] === '1' && binary2[i] === '1' ? '1' : '0';
    }

    return result;
}


export const getFilePermissionOctal = (
    umask: string
) => {
    const DEFAULT_FILE_PERMISSION_IN_BASE_2 = ['110', '110', '110'];

    const umaskPermissionsInBase8 = umask.split('');
    const umaskPermissionsInBase2 = umaskPermissionsInBase8.map(perm => {
        return parseInt(perm, 8).toString(2).padStart(3, '0');
    });
    
    const reversedPermissions = umaskPermissionsInBase2.map(perm => logicalNOT(perm));

    const binaryAcc: string[] = [];

    for (let i = 0; i < reversedPermissions.length; i++) {
        binaryAcc.push(logicalAND(
            reversedPermissions[i], 
            DEFAULT_FILE_PERMISSION_IN_BASE_2[i]
        ));
    }

    const octalNumbers = binaryAcc.map(num => parseInt(num, 2).toString(8));

    return octalNumbers.join('');
}


export const getDirectoryPermissionOctal = (
    umask: string
) => {
    const DEFAULT_DIRECTORY_PERMISSION_IN_BASE_2 = ['111', '111', '111'];

    const umaskPermissionsInBase8 = umask.split('');
    const umaskPermissionsInBase2 = umaskPermissionsInBase8.map(perm => {
        return parseInt(perm, 8).toString(2).padStart(3, '0');
    });
    
    const reversedPermissions = umaskPermissionsInBase2.map(perm => logicalNOT(perm));

    const binaryAcc: string[] = [];

    for (let i = 0; i < reversedPermissions.length; i++) {
        binaryAcc.push(logicalAND(
            reversedPermissions[i], 
            DEFAULT_DIRECTORY_PERMISSION_IN_BASE_2[i]
        ));
    }

    const octalNumbers = binaryAcc.map(num => parseInt(num, 2).toString(8));

    return octalNumbers.join('');
}


export const resolveOctalPermissionInDrx = (
    octal: string
) => {

    const permissions = [
        '---', 
        '--x', 
        '-w-', 
        '-wx', 
        'r--', 
        'r-x', 
        'rw-', 
        'rwx'
    ];

    const splittedOctalValues = octal.split('');

    const resolvedPermissions = splittedOctalValues.reduce((
        acc,
        current,
        index
    ) => {

        acc += permissions[Number(current)];
        return acc;

    }, '');

    return resolvedPermissions;
}