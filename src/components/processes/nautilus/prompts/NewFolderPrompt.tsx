import React, { useContext, useState } from 'react';
import nautilusStyles from '@/styles/processes/Nautilus.module.sass';
import { MainContext } from '@/components/workarea/Main';
import { COLOR_PALETTE_OPTIONS } from '@/lib/initial/settings';
import { getDirectoryData } from '@/lib/shell/commands/common/directoryAndFile';
import { interpretCommand } from '@/lib/shell/interpreter/interpreter';
import { Props } from '@/types/props';


export default function NewFolderPrompt({    
    currentPath,
    closePrompts
}: Props.NewFolderPromptProps) {

    const {
        systemColorPalette,
        basicCommandSystemAPI
    } = useContext(MainContext);


    const [ 
        folderName, 
        setFolderName 
    ] = useState('');


    const currentPathData = getDirectoryData(
        currentPath,
        basicCommandSystemAPI.environmentVariables['PWD'],
        basicCommandSystemAPI.currentShellUser,
        basicCommandSystemAPI.fileSystem
    );

    const currentPathChildren = [
        ...currentPathData.children.directories,
        ...currentPathData.children.files
    ];

    const currentPathNames = currentPathChildren.map(fileOrDir => fileOrDir.name);


    const isCurrentNameAvailable = (
        name: string
    ): boolean => {
        const currentNameIsNotInUse = !currentPathNames.includes(name);
        const currentNameIsNotVoid = name !== '';

        return currentNameIsNotInUse && currentNameIsNotVoid;
    }


    const createFolder = (
        name: string
    ): void => {
        const createFolderCommand = `mkdir "${currentPath}/${name}"`;

        interpretCommand(createFolderCommand, basicCommandSystemAPI);

        closePrompts();
    }


    return (
        <div className={nautilusStyles.new__folder__prompt}>
            <div className={nautilusStyles.prompt__header}>
                <button 
                    className={nautilusStyles.cancel__button}
                    onClick={closePrompts}
                >
                    Cancel
                </button>
                <h3 className={nautilusStyles.prompt__title}>New Folder</h3>
                <button 
                    className={`
                        ${nautilusStyles.create__button}
                        ${isCurrentNameAvailable(folderName)? nautilusStyles.non__void__name : ''}
                        `
                    }
                    disabled={!isCurrentNameAvailable(folderName)}
                    onClick={() => createFolder(folderName)}
                >
                    Create
                </button>
            </div>
            <div className={nautilusStyles.prompt__input__wrapper}>
                <label 
                    htmlFor="new__folder__name" 
                    className={nautilusStyles.new__folder__name__label}
                >
                    Folder name
                </label>
                <input 
                    type="text" 
                    className={nautilusStyles.new__folder__name__input} 
                    id="new__folder__name"
                    style={{
                        outlineColor: COLOR_PALETTE_OPTIONS[systemColorPalette].settingsColor
                    }}
                    onInput={(e) => setFolderName(previous => 
                        (e.target as HTMLInputElement).value
                    )}
                />
                <p 
                    className={nautilusStyles.hidden__file__description} 
                    aria-label='hidden files and directories description'
                >
                    {
                        folderName.startsWith('.')
                        ? `Folders with "." at the beginning of their name are hidden.` 
                        : ''
                    }
                </p>
            </div>
        </div>
    );
}