import React, { 
    useContext, 
    useState 
} from 'react';

import renameFilePromptStyles from '@/styles/processes/files/prompts/RenameFilePrompt.module.sass';
import { MainContext } from '@/components/workarea/Main';
import { Props } from '@/types/props';

import { 
    checkProvidedPath, 
    getDirectoryData, 
    getDirectoryIndex, 
    getFileIndex, 
    getParentPathAndTargetName, 
    targetIsDirectory
} from '@/lib/shell/commands/common/directoryAndFile';

import { File } from '@/lib/shell/commands/models/File';
import { Directory } from '@/lib/shell/commands/models/Directory';
import { COLOR_PALETTE_OPTIONS } from '@/lib/initial/settings';


export default function RenameFilePrompt({    
    currentPath,
    oldName,
    closePrompts
}: Props.RenameFilePromptProps) {

    const {
        systemTheme,
        systemColorPalette,
        basicCommandSystemAPI
    } = useContext(MainContext);

    const currentWorkingDirectory = basicCommandSystemAPI.environmentVariables['PWD'];
    const currentUser = basicCommandSystemAPI.currentShellUser;
    const fileSystem = basicCommandSystemAPI.fileSystem;

    const [ 
        fileName, 
        setFileName 
    ] = useState(oldName as string);

    const targetType = getTargetType(oldName);

    const currentPathData = getDirectoryData(
        currentPath,
        currentWorkingDirectory,
        currentUser,
        fileSystem
    );

    const currentPathChildren = [
        ...currentPathData.children.directories,
        ...currentPathData.children.files
    ];

    const currentPathNames = currentPathChildren.map(fileOrDir => fileOrDir.name);

    
    function getTargetType(
        oldName: string
    ): string {

        const targetData = getFileOrDirectoryData(oldName);
        const isDirectory = targetIsDirectory(targetData);

        return isDirectory? 'Folder' : 'File';
    }


    function isCurrentNameAvailable(
        name: string
    ): boolean {
        const currentNameIsNotInUse = !currentPathNames.includes(name);
        const currentNameIsNotVoid = name !== '';

        return currentNameIsNotInUse && currentNameIsNotVoid || name === oldName;
    }


    function renameFile(
        oldName: string,
        newName: string
    ): void {
        const data = getFileOrDirectoryData(oldName);

        data.name = newName;

        closePrompts();
    }


    function getFileOrDirectoryData(
        oldName: string
    ): File | Directory {

        const oldPath = `${currentPath}/${oldName}`;

        const checkedOldPath = checkProvidedPath(
            oldPath,
            currentWorkingDirectory,
            currentUser,
            fileSystem
        );

        const {
            parentPath,
            targetName
        } = getParentPathAndTargetName(checkedOldPath.resolvedPath);

        const parentPathData = getDirectoryData(
            parentPath, 
            currentWorkingDirectory,
            currentUser,
            fileSystem
        );

        if (checkedOldPath.validAs === 'file') {
            const fileIndex = getFileIndex(
                targetName, 
                parentPathData.children.files
            );

            const fileData = parentPathData.children.files[fileIndex];

            return fileData;
        }
        else {
            const directoryIndex = getDirectoryIndex(
                targetName,
                parentPathData.children.directories
            );

            const directoryData = parentPathData.children.directories[directoryIndex];

            return directoryData;
        }
    }


    return (
        <div 
            className={`
                ${renameFilePromptStyles.rename__file__prompt}
                ${renameFilePromptStyles[systemTheme]}
                `
            }
        >
            <h3 
                className={renameFilePromptStyles.rename__file__new__name__title}
            >
                Rename {targetType}
            </h3>
            <input 
                type='text' 
                className={renameFilePromptStyles.rename__file__new__name__input} 
                style={{
                    outlineColor: COLOR_PALETTE_OPTIONS[systemColorPalette].settingsColor
                }}
                value={fileName}
                onInput={(e) => setFileName(previous => 
                    (e.target as HTMLInputElement).value
                )}
                aria-label='new file or directory name input'
            />
            <p 
                className={renameFilePromptStyles.hidden__file__description} 
                aria-label='hidden files and directories description'
            >
                {
                    fileName.startsWith('.')
                    ? `${targetType}s with "." at the beginning of their name are hidden.` 
                    : ''
                }
            </p>
            <div className={renameFilePromptStyles.rename__button__wrapper}>
                <button 
                    className={`
                        ${renameFilePromptStyles.rename__button}
                        ${renameFilePromptStyles[
                            isCurrentNameAvailable(fileName)
                            ? 'non--void--name' 
                            : 'void--name'
                        ]}
                        `
                    }
                    disabled={!isCurrentNameAvailable(fileName)}
                    onClick={() => renameFile(oldName, fileName)}
                >
                    Rename
                </button>
            </div>
        </div>
    );
}