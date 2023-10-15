import React, { 
    useContext, 
    useState 
} from 'react';

import Image from 'next/image';
import fileIconButtonStyles from '@/styles/processes/files/buttons/FileIconButton.module.sass';
import { FileManagerContext } from '../FileManager';
import { MainContext } from '@/components/workarea/Main';
import { Props } from '@/types/props';


export default function FileIconButton({
    name,
    path,
    type,
}: Props.FileIconButtonProps) {

    const {
        systemTheme
    } = useContext(MainContext);
    
    const {
        currentUserHomeDir,
        currentPath,
        openDirectory,
        openContextMenu,
        copyFileAction,
        cutFileAction
    } = useContext(FileManagerContext);


    const [
        lastTouchTime, 
        setLastTouchTime
    ] = useState(0);


    const isDirectory = type === 'directory';
    const contextMenuType = isDirectory? 'singleDir' : 'singleFile';


    function handleKeyDown(
        event: React.KeyboardEvent<HTMLButtonElement>
    ): void {

        const ctrlKey = event.ctrlKey;
        const eventKey = event.key;

        if (isDirectory && eventKey === 'Enter') {
            openDirectory(path);
        }

        if (ctrlKey && eventKey === 'c') {
            copyFileAction(path);
        }
        else if (ctrlKey && eventKey === 'x') {
            cutFileAction(path);
        }
    }


    function handleTouchStart(): void {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastTouchTime;

        if (timeDiff < 300) {
            openDirectory(path);
        }

        setLastTouchTime(previous => currentTime);
    }


    function getFileIconElement(): JSX.Element {
        const fileIconImage = require(`../../../../../public/assets/emblem-documents.png`);

        const fileIconElement = (
            <Image
                className={fileIconButtonStyles.file__type__icon}
                src={fileIconImage}
                alt={'File icon: it\'s a white paper with horizontal black lines'}
            />
        );

        return fileIconElement;
    }


    function getFolderIconElement(
        folderName: string
    ): JSX.Element {

        const mainFoldersIconsMapping = {
            Documents: {
                iconName: 'folder-documents.png',
                iconAlt: 'Documents folder icon: it\'s a gray folder with orange details and a paper with straight horizontal lines inside it in the middle'
            },
            Downloads: {
                iconName: 'folder-download.png',
                iconAlt: 'Downloads folder icon: it\'s a gray folder with orange details and a down arrow above a straight horizontal line in the middle'
            },
            Music: {
                iconName: 'folder-music.png',
                iconAlt: 'Music folder icon: it\'s a gray folder with orange details and a blass clef symbol in the middle'
            },
            Pictures: {
                iconName: 'folder-pictures.png',
                iconAlt: 'Pictures folder icon: it\'s a gray folder with orange details and a landscape photo framed in the middle'
            },
            Videos: {
                iconName: 'folder-videos.png',
                iconAlt: 'Videos folder icon: it\'s a gray folder with orange details and a piece of videotape in the middle'
            }
        } as {
            [key: string]: {
                iconName: string;
                iconAlt: string;
            }
        };

        const isHomeMainFolder = mainFoldersIconsMapping.hasOwnProperty(folderName);

        const folderIconImage = require(
            `../../../../../public/assets/${
                isHomeMainFolder && currentPath === currentUserHomeDir
                ? mainFoldersIconsMapping[folderName].iconName 
                : 'folder.png'
            }`
        );

        const folderIconAlt = isHomeMainFolder
                              ? mainFoldersIconsMapping[folderName].iconAlt
                              : 'Folder icon: it\'s a gray folder with orange details';

        const folderIconElement = (
            <Image
                className={fileIconButtonStyles.file__type__icon}
                src={folderIconImage}
                alt={folderIconAlt}
            />
        );

        return folderIconElement;
    }


    return (
        <button 
            className={`
                ${fileIconButtonStyles.file__icon__wrapper}
                ${fileIconButtonStyles[systemTheme]}
                `
            }
            onDoubleClick={() => isDirectory && openDirectory(path)}
            onTouchStart={() => isDirectory && handleTouchStart()}
            onContextMenu={(e) => openContextMenu(e, contextMenuType, path)}
            onKeyDown={handleKeyDown}
            id={path}
        >
            {isDirectory? getFolderIconElement(name) : getFileIconElement()}
            <p className={fileIconButtonStyles.file__name}>{name}</p>
        </button>
    );
}