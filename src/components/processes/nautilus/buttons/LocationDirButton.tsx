import React from 'react';
import nautilusStyles from '@/styles/processes/Nautilus.module.sass';
import Image from 'next/image';
import { Props } from '@/types/props';

function LocationDirButton({
    title,
    iconSrc,
    iconAlt,
    locationPath,
    openDirectory
}: Props.LocationDirButtonProps) {


    return (
        <li 
            className={nautilusStyles.location__dir__list__element}
        >
            <button
                className={nautilusStyles.location__dir__button__element}
                onClick={() => openDirectory(locationPath)}
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

export default LocationDirButton