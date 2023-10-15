import React, { useContext } from 'react';
import { StaticImageData } from 'next/image';
import fileManagerMenuStyles from '@/styles/processes/files/menus/FileManagerMenu.module.sass';
import { FileManagerContext } from '../FileManager';
import { MainContext } from '@/components/workarea/Main';
import { getDirectoryData } from '@/lib/shell/commands/common/directoryAndFile';
import { Directory } from '@/lib/shell/commands/models/Directory';
import LocationDirButton from '../buttons/LocationDirButton';


export default function FileManagerMenu() {

    const {
        systemTheme,
        systemEnvironmentVariables,
        fileSystem
    } = useContext(MainContext);

    const {
        menuIsBeingShowed,
        setMenuIsBeingShowed,
        canShowHiddenFiles,
        setCanShowHiddenFiles,
        currentUserHomeDir,
        currentPath,
        currentUser
    } = useContext(FileManagerContext);


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

            const icon = require(`../../../../../public/assets/${systemTheme}/${iconName}`);

            const mainDirData = {
                icon: icon,
                alt: homeMainDirsIconsMapping[childDir.name].iconAlt,
                data: childDir
            };

            homeAvailableMainDirs.push(mainDirData);
        }

        return homeAvailableMainDirs;
    }


    return (
        <div 
            className={`
                ${fileManagerMenuStyles.locations__container}
                ${fileManagerMenuStyles[systemTheme]}
                `
            }
        >
            <button 
                className={fileManagerMenuStyles.file__manager__menu__button}
                onClick={() => setMenuIsBeingShowed((previous: boolean) => !previous)}
            >
                <span/>
                <span/>
                <span/>
            </button>
            <nav 
                className={`
                    ${fileManagerMenuStyles.locations__and__options__wrapper}
                    ${fileManagerMenuStyles[
                        menuIsBeingShowed? 'showed' : 'non--showed'
                    ]}
                    `
                }
            >
                <ul className={fileManagerMenuStyles.home__dirs__list}>

                    <LocationDirButton
                        title={'Home'}
                        locationPath={currentUserHomeDir}
                        iconSrc={require(
                            `../../../../../public/assets/${systemTheme}/user-home-symbolic.svg`
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
                            iconSrc={dir.icon}
                            iconAlt={dir.alt}
                        />
                    ))}

                    <LocationDirButton
                        title={'Trash'}
                        locationPath={`${systemEnvironmentVariables['HOME']}/.local/share/Trash`}
                        iconSrc={require(
                            `../../../../../public/assets/${systemTheme}/user-trash-symbolic.svg`
                        )}
                        iconAlt={'Trash folder icon: it\'s a garbage image, with straight vertical lines in it\'s body'}
                    />

                    <LocationDirButton
                        title={'System Root'}
                        locationPath={'/'}
                        iconSrc={require(
                            `../../../../../public/assets/${systemTheme}/drive-harddisk-symbolic.svg`
                        )}
                        iconAlt={'Hard disk icon: it\'s a rectangular shape with a circular area in the center referred to as the platter, and there\'s a diagonal line inside the platter, representing the actuator.'}
                    />

                </ul>
                <label 
                    htmlFor="show__hidden__files" 
                    className={fileManagerMenuStyles.show__hidden__files__wrapper}
                >
                    <input 
                        type="checkbox" 
                        id="show__hidden__files" 
                        className={fileManagerMenuStyles.show__hidden__files__check__box}
                        onChange={(event) => setCanShowHiddenFiles(
                            (previous: boolean) => event.target.checked
                        )}
                        checked={canShowHiddenFiles}
                    />
                    Show Hidden Files
                </label>
            </nav>
        </div>
    )
}