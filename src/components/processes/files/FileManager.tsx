import React, { 
    createContext, 
    useContext, 
    useRef, 
    useState 
} from 'react';

import fileManagerStyles from '@/styles/processes/files/FileManager.module.sass';
import { MainContext } from '../../workarea/Main';
import { Props } from '@/types/props';

import { 
    checkProvidedPath,
    getDirectoryData, 
    getParentPathAndTargetName, 
    targetIsDirectory 
} from '@/lib/shell/commands/common/directoryAndFile';

import { interpretCommand } from '@/lib/shell/interpreter/interpreter';
import { getCorrespondentWorkspace } from '@/lib/workspace';
import { Directory } from '@/lib/shell/commands/models/Directory';
import { File } from '@/lib/shell/commands/models/File';
import { BREAK_LINE } from '@/lib/shell/commands/common/patterns';
import FileIconButton from './buttons/FileIconButton';
import FileManagerMenu from './menus/FileManagerMenu';
import ContextMenu from './menus/ContextMenu';
import RenameFilePrompt from './prompts/RenameFilePrompt';
import NewFolderPrompt from './prompts/NewFolderPrompt';

import Terminal, { 
    terminalProcessData 
} from '../terminal/Terminal';


export const FileManagerContext = createContext<any>(null);

export default function FileManager({
    initiator,
    initialPath
}: Props.FileManagerProps) {

    const filesAndDirsSectionRef = useRef<HTMLDivElement | null>(null);
    const contextMenuRef = useRef<HTMLUListElement | null>(null);

    const {
        fileSystem,
        systemEnvironmentVariables,
        systemTheme,
        basicCommandSystemAPI,
        startGraphicalProcess,
        workspaceActivitiesData, 
        currentActiveWorkspaceUUID
    } = useContext(MainContext);


    const initiatorIsNautilus = initiator === 'Nautilus';

    const currentUser = systemEnvironmentVariables['USER'];
    const currentUserHomeDir = `/home/${currentUser}`;


    const [ 
        currentPath, 
        setCurrentPath 
    ] = useState(initialPath ?? currentUserHomeDir);

    const [ 
        pathsHistory, 
        setPathsHistory 
    ] = useState([
        initialPath ?? currentUserHomeDir
    ]);

    const [ 
        contextMenuAndPromptsOrigin, 
        setContextMenuAndPromptsOrigin 
    ] = useState({
        x: 0,
        y: 0
    });

    const [ 
        contextMenuTargetPath, 
        setContextMenuTargetPath 
    ] = useState(currentUserHomeDir);

    const [ 
        contextMenusAreVisible, 
        setContextMenusAreVisible 
    ] = useState<{[key: string]: boolean}>({
        singleFile: false,
        singleDir: false,
        filesSection: false
    });

    const [ 
        promptsAreVisible, 
        setPromptsAreVisible 
    ] = useState<{[key: string]: boolean}>({
        renameFile: false,
        createFolder: false
    });

    const [
        oldPathNameToRename,
        setOldPathNameToRename
    ] = useState('');

    const [
        canShowHiddenFiles,
        setCanShowHiddenFiles
    ] = useState(false);

    const [
        menuIsBeingShowed,
        setMenuIsBeingShowed
    ] = useState(false);


    const fileManagerContextValues = {
        initiator,
        currentUser,
        currentUserHomeDir,
        currentPath,
        contextMenuRef,
        clickContextMenuOptionDecorator,
        openDirectory,
        openContextMenu,
        copyFileAction,
        cutFileAction,
        menuIsBeingShowed,
        setMenuIsBeingShowed,
        canShowHiddenFiles,
        setCanShowHiddenFiles
    };


    const nautilusContextMenus = {
        file: [
            {
                text: 'Cut',
                handler: cutFileAction
            },
            {
                text: 'Copy',
                handler: copyFileAction
            },
            {
                text: 'Move to Trash',
                handler: moveFileToTrashAction
            },
            {
                text: 'Rename',
                handler: renameFileAction
            }
        ],
        directory: [
            {
                text: 'Open',
                handler: openDirectory
            },
            {
                text: 'Cut',
                handler: cutFileAction
            },
            {
                text: 'Copy',
                handler: copyFileAction
            },
            {
                text: 'Move to Trash',
                handler: moveFileToTrashAction
            },
            {
                text: 'Rename',
                handler: renameFileAction
            },
            {
                text: 'Open in Terminal',
                handler: openInTerminal
            }
        ],
        section: [
            {
                text: 'New Folder',
                handler: createFolderAction
            },
            {
                text: 'Paste',
                handler: pasteInFolderAction
            },
            {
                text: 'Open in Terminal',
                handler: openInTerminal
            }
        ]
    }

    const trashContextMenus = {
        file: [
            {
                text: 'Cut',
                handler: cutFileAction
            },
            {
                text: 'Copy',
                handler: copyFileAction
            },
            {
                text: 'Delete from Trash',
                handler: deleteFromTrash
            },
            {
                text: 'Restore from Trash',
                handler: restoreFromTrash
            }
        ],
        directory: [
            {
                text: 'Open',
                handler: openDirectory
            },
            {
                text: 'Cut',
                handler: cutFileAction
            },
            {
                text: 'Copy',
                handler: copyFileAction
            },
            {
                text: 'Delete from Trash',
                handler: deleteFromTrash
            },
            {
                text: 'Restore from Trash',
                handler: restoreFromTrash
            }
        ],
        section: []
    };


    function handleKeyDown(
        event: React.KeyboardEvent<HTMLDivElement>
    ): void {

        const ctrlKey = event.ctrlKey;
        const eventKey = event.key;

        if (ctrlKey && eventKey === 'v') pasteInFolderAction();
    }


    function openContextMenu(
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        contextMenuType: string,
        targetPath: string
    ): void {

        event.preventDefault();
        event.stopPropagation();

        const XAxisClick = event.clientX;
        const YAxisClick = event.clientY;

        const parentSectionElement = filesAndDirsSectionRef.current as HTMLDivElement;
        const parentSectionInfo = parentSectionElement.getBoundingClientRect();

        const parentSectionXAxis = parentSectionInfo.x;
        const parentSectionYAxis = parentSectionInfo.y;

        setContextMenuAndPromptsOrigin(previous => {
            return {
                x: XAxisClick - parentSectionXAxis,
                y: YAxisClick - parentSectionYAxis
            };
        });

        setContextMenuTargetPath(previous => targetPath);

        setContextMenusAreVisible(previous => {
            const initialValue: {[key: string]: boolean} = {
                singleFile: false,
                singleDir: false,
                filesSection: false
            };

            initialValue[contextMenuType] = true;

            return initialValue;
        });

        window.document.addEventListener('click', verifyClickToClose);
        window.document.addEventListener('mousedown', verifyClickToClose);
    }


    function closeContextMenu(
        event: MouseEvent
    ): void {

        setContextMenusAreVisible(previous => {
            return {
                singleFile: false,
                singleDir: false,
                filesSection: false
            };
        });

        window.document.removeEventListener('click', verifyClickToClose);
        window.document.removeEventListener('mousedown', verifyClickToClose);
    }


    function closePrompts(): void {

        setPromptsAreVisible(previous => {
            return {
                createFolder: false,
                renameFile: false
            };
        });
    }


    function verifyClickToClose(
        event: MouseEvent
    ): void {

        const targetElement = event.target as HTMLElement;
        const targetParentElement = targetElement.parentElement;
        const contextMenuElement = contextMenuRef.current as HTMLUListElement;

        if (targetParentElement === contextMenuElement) return;

        closeContextMenu(event);
    }


    function clickContextMenuOptionDecorator(
        event: MouseEvent,
        func: any,
        ...args: any
    ): void {

        func(...args);
        closeContextMenu(event);
    }


    function cutFileAction(
        path: string
    ): void {

        const clipboardJson = {
            action: 'cut',
            path: path
        };

        const clipboardText = JSON.stringify(clipboardJson);

        navigator.clipboard.writeText(clipboardText);
    }


    function copyFileAction(
        path: string
    ): void {

        const clipboardJson = {
            action: 'copy',
            path: path
        };

        const clipboardText = JSON.stringify(clipboardJson);

        navigator.clipboard.writeText(clipboardText);
    }


    function moveFileToTrashAction(
        path: string
    ): void {

        const {
            targetName
        } = getParentPathAndTargetName(path);

        const trashDirectoryPath = `${currentUserHomeDir}/.local/share/Trash`;
        const moveCommand = `mv ${path} ${trashDirectoryPath}`;

        const echoText = `${targetName}:${path}${BREAK_LINE}`;
        const echoCommand = `echo ${echoText} >> ~/.local/share/trashmap`;

        interpretCommand(
            `${moveCommand} && ${echoCommand}`, 
            basicCommandSystemAPI
        );
    }


    function renameFileAction(
        path: string
    ): void {

        const {
            targetName
        } = getParentPathAndTargetName(path);

        setOldPathNameToRename(previous => targetName);

        setPromptsAreVisible(previous => {
            return {
                renameFile: true,
                createFolder: false
            };
        });
    }


    function createFolderAction(): void {

        setPromptsAreVisible(previous => {
            return {
                renameFile: false,
                createFolder: true
            };
        });
    }


    function openInTerminal(
        path: string
    ): void {

        const terminalData = terminalProcessData;

        const currentWorkspaceDoesNotExists = !getCorrespondentWorkspace(
            workspaceActivitiesData, 
            currentActiveWorkspaceUUID
        );

        const terminalElement = <Terminal initialPath={path}/>

        const PID = startGraphicalProcess(
            terminalData.processName, 
            terminalData.processIconStaticImage,
            terminalData.processIconAlt,
            terminalElement,
            currentWorkspaceDoesNotExists
        );
    }


    function deleteFromTrash(
        path: string
    ): void {
        const deleteCommand = `rm -r ${path}`;

        interpretCommand(deleteCommand, basicCommandSystemAPI);
    }


    function restoreFromTrash(
        path: string
    ): void {

        console.log(window.getSelection());

        const {
            targetName
        } = getParentPathAndTargetName(path);

        const grepCommand = `grep ${targetName}: ${currentUserHomeDir}/.local/share/trashmap`;

        const { 
            stdout
        } = interpretCommand(
            grepCommand, 
            basicCommandSystemAPI
        );

        const stdoutLines = stdout!.split(BREAK_LINE);
        const stdoutLastLine = stdoutLines.at(-2)!;

        const lastLineStartSlashIndex = stdoutLastLine.indexOf('/');
        const previousPath = stdoutLastLine.slice(lastLineStartSlashIndex);

        const {
            parentPath
        } = getParentPathAndTargetName(previousPath);

        const moveCommand = `mv ${path} ${parentPath}`;

        interpretCommand(moveCommand, basicCommandSystemAPI);
    }


    function emptyTrash(): void {
        const emptyCommand = `rm -r ${initialPath} && mkdir ${initialPath}`;

        interpretCommand(emptyCommand, basicCommandSystemAPI);
    }


    async function pasteInFolderAction(): Promise<void> {

        try {
            const clipboardText = await navigator.clipboard.readText();

            const jsonifiedContent = JSON.parse(clipboardText);

            const hasActionProperty = jsonifiedContent.hasOwnProperty('action');
            const hasPathProperty = jsonifiedContent.hasOwnProperty('path');

            const isInternalAction = hasActionProperty && hasPathProperty;

            if (!isInternalAction) return;

            const action = jsonifiedContent['action'];
            const path = jsonifiedContent['path'];
            
            if (action === 'copy') {
                const copyCommand = `cp -r ${path} ${currentPath}`;
                interpretCommand(copyCommand, basicCommandSystemAPI);
            }
            else if (action === 'cut') {
                const cutCommand = `mv ${path} ${currentPath}`;
                interpretCommand(cutCommand, basicCommandSystemAPI);
            }
        }
        catch (err: unknown) {}
    }


    function getDirectoryChildren(
        path: string,
        canShowHiddenFiles: boolean
    ): (Directory | File)[] {

        const directoryData = getDirectoryData(
            path, 
            currentPath, 
            currentUser, 
            fileSystem
        );

        const children = [
            ...directoryData.children.directories,
            ...directoryData.children.files
        ];

        return canShowHiddenFiles
               ? children 
               : children.filter(child => !child.name.startsWith('.'));
    }


    function openDirectory(
        path: string
    ): void {

        setMenuIsBeingShowed(previous => false);

        const { 
            valid, 
            resolvedPath 
        } = checkProvidedPath(
            path,
            currentPath,
            currentUser,
            fileSystem
        );

        if (!valid) return;

        setCurrentPath(previous => resolvedPath);
        setPathsHistory(previous => [...previous, path]);
    }


    function backInTheHistory(
        path: string
    ): void {

        const lastSlashIndex = path.lastIndexOf('/');
        const pathWithoutLastDir = path.slice(0, lastSlashIndex);
        const formattedPathWithoutLastDir = pathWithoutLastDir === '' ? '/' : pathWithoutLastDir;
        const hasPreviousDirInHistory = pathsHistory.includes(formattedPathWithoutLastDir);

        if (hasPreviousDirInHistory) setCurrentPath(previous => formattedPathWithoutLastDir);
    }


    function forwardInTheHistory(
        path: string
    ): void {

        const nextDirAfterCurrentDirPattern = new RegExp(`${path === '/'? '' : path}\/.+`);
        const matches = pathsHistory.filter(path => path.match(nextDirAfterCurrentDirPattern));
        const lastMatch = matches.at(-1);

        if (lastMatch) setCurrentPath(previous => lastMatch);
    }


    return (
        <div 
            className={`
                ${fileManagerStyles.container} 
                ${fileManagerStyles[systemTheme]}   
                `
            }
        >
            <FileManagerContext.Provider value={{...fileManagerContextValues}}>
                {menuIsBeingShowed && (
                    <div 
                        className={fileManagerStyles.menu__overlay}
                        onClick={() => setMenuIsBeingShowed(previous => false)}
                    />
                )}

                <FileManagerMenu/>
                <main className={fileManagerStyles.current__location__container}>
                    <div className={fileManagerStyles.location__path__container}>
                        <div className={fileManagerStyles.path__history__navigation__container}>
                            <button 
                                className={fileManagerStyles.navigate__path__history__button}
                                onClick={() => backInTheHistory(currentPath)}
                            >
                                &lt;
                            </button>
                            <button 
                                className={fileManagerStyles.navigate__path__history__button}
                                onClick={() => forwardInTheHistory(currentPath)}
                            >
                                &gt;
                            </button>
                        </div>
                        <div className={fileManagerStyles.current__path__container}>
                            {currentPath}
                        </div>
                    </div>

                    {initiator === 'Trash' && (
                        <div className={fileManagerStyles.trash__actions__wrapper}>
                            <p className={fileManagerStyles.trash__label}>
                                Trash
                            </p>
                            <button 
                                className={`
                                    ${fileManagerStyles.action__button}
                                    ${fileManagerStyles[
                                        getDirectoryChildren(
                                            initialPath!, 
                                            canShowHiddenFiles
                                        ).length
                                        ? 'enabled' 
                                        : 'disabled'
                                    ]}
                                    `
                                }
                                disabled={
                                    getDirectoryChildren(
                                        initialPath!, 
                                        canShowHiddenFiles
                                    ).length
                                    ? false
                                    : true
                                }
                                onClick={() => emptyTrash()}
                            >
                                Empty
                            </button>
                        </div>
                    )}
                    <div 
                        className={fileManagerStyles.current__location__files__and__dirs}
                        onContextMenu={(e) => openContextMenu(
                            e, 
                            'filesSection', 
                            currentPath
                        )}
                        onKeyDown={handleKeyDown}
                        ref={filesAndDirsSectionRef}
                        tabIndex={0}
                    >
                        {getDirectoryChildren(currentPath, canShowHiddenFiles)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(fileOrDirData => (
                            <FileIconButton
                                name={fileOrDirData.name}
                                key={fileOrDirData.name}
                                path={`${currentPath === '/'? '' : currentPath}/${fileOrDirData.name}`}
                                type={targetIsDirectory(fileOrDirData)? 'directory' : 'file'}
                            />
                        ))}

                        {(promptsAreVisible.renameFile || promptsAreVisible.createFolder) && (
                            <div 
                                className={fileManagerStyles.prompt__overlay}
                                onClick={closePrompts}
                                onContextMenu={closePrompts}
                            />
                        )}
                            
                        {contextMenusAreVisible.singleFile && (
                            <ContextMenu 
                                origin={contextMenuAndPromptsOrigin}
                                targetPath={contextMenuTargetPath}
                                options={
                                    initiatorIsNautilus
                                    ? nautilusContextMenus.file
                                    : trashContextMenus.file
                                }
                            />
                        )}

                        {contextMenusAreVisible.singleDir && (
                            <ContextMenu 
                                origin={contextMenuAndPromptsOrigin} 
                                targetPath={contextMenuTargetPath}
                                options={
                                    initiatorIsNautilus
                                    ? nautilusContextMenus.directory
                                    : trashContextMenus.directory
                                }
                            />
                        )}

                        {contextMenusAreVisible.filesSection && (
                            <ContextMenu 
                                origin={contextMenuAndPromptsOrigin} 
                                targetPath={contextMenuTargetPath}
                                options={
                                    initiatorIsNautilus
                                    ? nautilusContextMenus.section
                                    : trashContextMenus.section
                                }
                            />
                        )}

                        {promptsAreVisible.renameFile && (
                             <RenameFilePrompt
                                currentPath={currentPath}
                                oldName={oldPathNameToRename}
                                closePrompts={closePrompts}
                            />
                        )}

                        {promptsAreVisible.createFolder && (
                            <NewFolderPrompt
                                currentPath={currentPath}
                                closePrompts={closePrompts}
                            />
                        )}

                    </div>
                </main>
            </FileManagerContext.Provider>
        </div>
    );
}