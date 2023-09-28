import React, { 
    createContext, 
    useContext, 
    useRef, 
    useState 
} from 'react';

import { StaticImageData } from 'next/image';

import nautilusStyles from '@/styles/processes/Nautilus.module.sass';
import { MainContext } from '../../workarea/Main';
import { Directory } from '@/lib/shell/commands/models/Directory';
import { File } from '@/lib/shell/commands/models/File';

import { 
    checkProvidedPath,
    getDirectoryData, 
    targetIsDirectory 
} from '@/lib/shell/commands/common/directoryAndFile';
import { interpretCommand } from '@/lib/shell/interpreter/interpreter';

import NautilusIcon from './NautilusIcon';
import ContextMenu from './ContextMenu';
import RenameFilePrompt from './prompts/RenameFilePrompt';
import NewFolderPrompt from './prompts/NewFolderPrompt';
import LocationDirButton from './buttons/LocationDirButton';
import { Props } from '@/types/props';


export const NautilusContext = createContext<any>(null);

export default function Nautilus({
    initialPath
}: Props.NautilusProps) {

    const filesAndDirsSectionRef = useRef<HTMLDivElement | null>(null);
    const contextMenuRef = useRef<HTMLUListElement | null>(null);

    const {
        fileSystem,
        systemEnvironmentVariables,
        systemTheme,
        basicCommandSystemAPI
    } = useContext(MainContext);

    const currentUser = systemEnvironmentVariables['USER'];
    const currentUserHomeDir = `/home/${currentUser}`;


    const [ 
        currentPath, 
        setCurrentPath 
    ] = useState(initialPath ?? currentUserHomeDir);

    const [ 
        pathsHistory, 
        setPathsHistory 
    ] = useState([currentUserHomeDir]);

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


    const nautilusContextValues = {
        contextMenuRef,
        clickContextMenuOptionDecorator,
        openDirectory,
        openContextMenu,
        copyFileAction,
        cutFileAction
    };


    const SINGLE_FILE_CONTEXT_MENU_OPTIONS = [
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
    ];

    const SINGLE_DIRECTORY_CONTEXT_MENU_OPTIONS = [
        {
            text: 'Open',
            handler: openDirectory
        },
        ...SINGLE_FILE_CONTEXT_MENU_OPTIONS
    ];

    const FILES_SECTION_CONTEXT_MENU_OPTIONS = [
        {
            text: 'New Folder',
            handler: createFolderAction
        },
        {
            text: 'Paste',
            handler: pasteInFolderAction
        }
    ];


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

        const trashDirectoryPath = `${currentUserHomeDir}/.local/share/Trash`;
        const moveCommand = `mv ${path} ${trashDirectoryPath}`;

        interpretCommand(moveCommand, basicCommandSystemAPI);
    }


    function renameFileAction(
        path: string
    ): void {

        const lastSlashIndex = path.lastIndexOf('/');
        const pathName = path.slice(lastSlashIndex + 1);

        setOldPathNameToRename(previous => pathName);

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


    async function pasteInFolderAction(): Promise<void> {

        const clipboardText = await navigator.clipboard.readText();

        try {
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


    function getHomeDirMainChildrenDirectories(
        homePath: string
    ): {
        icon: StaticImageData;
        alt: string;
        data: Directory;
    }[] {

        const homeMainDirsIconsMapping = {
            'Documents': {
                iconName: 'folder-documents-symbolic.svg',
                iconAlt: 'Documents folder icon: it\'s a paper with straight horizontal lines as its lines'
            },
            'Downloads': {
                iconName: 'folder-download-symbolic.svg',
                iconAlt: 'Downloads folder icon: it\'s a down arrow above a straight horizontal line'
            },
            'Music': {
                iconName: 'folder-music-symbolic.svg',
                iconAlt: 'Music folder icon: it\'s a blass clef symbol'
            },
            'Pictures': {
                iconName: 'folder-pictures-symbolic.svg',
                iconAlt: 'Pictures folder icon: it\'s a landscape photo framed'
            },
            'Videos': {
                iconName: 'folder-videos-symbolic.svg',
                iconAlt: 'Videos folder icon: it\'s a piece of videotape'
            }
        } as {
            [key: string]: {
                iconName: string;
                iconAlt: string;
            }
        };

        const directoryData = getDirectoryData(
            homePath,
            currentPath,
            currentUser,
            fileSystem
        );

        const childrenDirectories = directoryData.children.directories;

        const homeAvailableMainDirs = [] as {
            icon: StaticImageData;
            alt: string;
            data: Directory;
        }[];

        for (const childDir of childrenDirectories) {
            const currentDirIsMain = homeMainDirsIconsMapping.hasOwnProperty(childDir.name);

            if (!currentDirIsMain) continue;

            const { iconName } = homeMainDirsIconsMapping[childDir.name];

            const icon = require(`../../../../public/assets/${systemTheme}/${iconName}`);

            const mainDirData = {
                icon: icon,
                alt: homeMainDirsIconsMapping[childDir.name].iconAlt,
                data: childDir
            };

            homeAvailableMainDirs.push(mainDirData);
        }

        return homeAvailableMainDirs;
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

        const { valid, resolvedPath } = checkProvidedPath(
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
                ${nautilusStyles.container} 
                ${nautilusStyles[systemTheme]}   
                `
            }
        >
            {menuIsBeingShowed && (
                <div 
                    className={nautilusStyles.menu__overlay}
                    onClick={() => setMenuIsBeingShowed(previous => false)}
                />
            )}

            <div className={nautilusStyles.locations__container}>
                <button 
                    className={nautilusStyles.nautilus__menu__button}
                    onClick={() => setMenuIsBeingShowed(previous => !previous)}
                >
                    <span/>
                    <span/>
                    <span/>
                </button>
                <nav 
                    className={`
                        ${nautilusStyles.locations__and__options__wrapper}
                        ${nautilusStyles[menuIsBeingShowed? 'showed' : 'non--showed']}
                        `
                    }
                >
                    <ul className={nautilusStyles.home__dirs__list}>

                        <LocationDirButton
                            title={'Home'}
                            locationPath={currentUserHomeDir}
                            openDirectory={openDirectory}
                            iconSrc={require(
                                `../../../../public/assets/${systemTheme}/user-home-symbolic.svg`
                            )}
                            iconAlt={'Home folder icon: it\'s a simple drawing of a house with a square base, a triangular roof, and a front door'}
                        />

                        {getHomeDirMainChildrenDirectories(currentUserHomeDir)
                        .sort((a, b) => a.data.name.localeCompare(b.data.name))
                        .map((dir, index) => (
                            <LocationDirButton
                                key={index}
                                title={dir.data.name}
                                locationPath={`${currentUserHomeDir}/${dir.data.name}`}
                                openDirectory={openDirectory}
                                iconSrc={dir.icon}
                                iconAlt={dir.alt}
                            />
                        ))}

                        <LocationDirButton
                            title={'Trash'}
                            locationPath={'~/.local/share/Trash'}
                            openDirectory={openDirectory}
                            iconSrc={require(
                                `../../../../public/assets/${systemTheme}/user-trash-symbolic.svg`
                            )}
                            iconAlt={'Trash folder icon: it\'s a garbage image, with straight vertical lines in it\'s body'}
                        />

                        <LocationDirButton
                            title={'System Root'}
                            locationPath={'/'}
                            openDirectory={openDirectory}
                            iconSrc={require(
                                `../../../../public/assets/${systemTheme}/drive-harddisk-symbolic.svg`
                            )}
                            iconAlt={'Hard disk icon: it\'s a rectangular shape with a circular area in the center referred to as the platter, and there\'s a diagonal line inside the platter, representing the actuator.'}
                        />

                    </ul>
                    <label 
                        htmlFor="show__hidden__files" 
                        className={nautilusStyles.show__hidden__files__wrapper}
                    >
                        <input 
                            type="checkbox" 
                            id="show__hidden__files" 
                            className={nautilusStyles.show__hidden__files__check__box}
                            onChange={(event) => setCanShowHiddenFiles(
                                previous => event.target.checked
                            )}
                            checked={canShowHiddenFiles}
                        />
                        Show Hidden Files
                    </label>
                </nav>
            </div>
            <main className={nautilusStyles.current__location__container}>
                <div className={nautilusStyles.location__path__container}>
                    <div className={nautilusStyles.path__history__navigation__container}>
                        <button 
                            className={nautilusStyles.navigate__path__history__button}
                            onClick={() => backInTheHistory(currentPath)}
                        >
                            &lt;
                        </button>
                        <button 
                            className={nautilusStyles.navigate__path__history__button}
                            onClick={() => forwardInTheHistory(currentPath)}
                        >
                            &gt;
                        </button>
                    </div>
                    <div className={nautilusStyles.current__path__container}>
                        {currentPath}
                    </div>
                </div>
                <NautilusContext.Provider value={{...nautilusContextValues}}>
                    <div 
                        className={nautilusStyles.current__location__files__and__dirs}
                        onContextMenu={(e) => openContextMenu(e, 'filesSection', currentPath)}
                        onKeyDown={handleKeyDown}
                        ref={filesAndDirsSectionRef}
                        tabIndex={0}
                    >
                        {getDirectoryChildren(currentPath, canShowHiddenFiles)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(fileOrDirData => (
                            <NautilusIcon
                                name={fileOrDirData.name}
                                key={fileOrDirData.name}
                                path={`${currentPath === '/'? '' : currentPath}/${fileOrDirData.name}`}
                                type={targetIsDirectory(fileOrDirData)? 'directory' : 'file'}
                            />
                        ))}

                        {(promptsAreVisible.renameFile || promptsAreVisible.createFolder) && (
                            <div 
                                className={nautilusStyles.prompt__overlay}
                                onClick={closePrompts}
                                onContextMenu={closePrompts}
                            />
                        )}
                        
                        {contextMenusAreVisible.singleFile && (
                            <ContextMenu 
                                origin={contextMenuAndPromptsOrigin}
                                targetPath={contextMenuTargetPath}
                                options={SINGLE_FILE_CONTEXT_MENU_OPTIONS}
                            />
                        )}

                        {contextMenusAreVisible.singleDir && (
                            <ContextMenu 
                                origin={contextMenuAndPromptsOrigin} 
                                targetPath={contextMenuTargetPath}
                                options={SINGLE_DIRECTORY_CONTEXT_MENU_OPTIONS}
                            />
                        )}

                        {contextMenusAreVisible.filesSection && (
                            <ContextMenu 
                                origin={contextMenuAndPromptsOrigin} 
                                targetPath={contextMenuTargetPath}
                                options={FILES_SECTION_CONTEXT_MENU_OPTIONS}
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
                </NautilusContext.Provider>
            </main>
        </div>
    );
}