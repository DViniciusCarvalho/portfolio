import React, { useContext } from 'react';
import Image from 'next/image';
import locationDirButtonStyles from '@/styles/processes/files/buttons/LocationDirButton.module.sass';
import { FileManagerContext } from '../FileManager';
import { MainContext } from '@/components/workarea/Main';
import { Props } from '@/types/props';



export default function LocationDirButton({
    title,
    iconSrc,
    iconAlt,
    locationPath
}: Props.LocationDirButtonProps) {

    const {
        systemTheme,
        systemEnvironmentVariables
    } = useContext(MainContext);

    const {
        initiator,
        openDirectory
    } = useContext(FileManagerContext);

    
    const currentUserHome = systemEnvironmentVariables['HOME'];
    const trashRelativeLocationPath = `${currentUserHome}/.local/share/Trash`;


    function openDirectoryHasEffect(
        path: string
    ): boolean {
        if (initiator === 'Nautilus') {
            return path !== trashRelativeLocationPath;
        }

        return path === trashRelativeLocationPath;
    }


    return (
        <li 
            className={`
                ${locationDirButtonStyles.location__dir__list__element}
                ${locationDirButtonStyles[systemTheme]}
                `
            }
        >
            <button
                className={locationDirButtonStyles.location__dir__button__element}
                onClick={() => 
                    openDirectoryHasEffect(locationPath) 
                    && openDirectory(locationPath
                )}
            >
                <Image 
                    src={iconSrc} 
                    alt={iconAlt}
                />
                {title}
            </button>
        </li>
    );
}