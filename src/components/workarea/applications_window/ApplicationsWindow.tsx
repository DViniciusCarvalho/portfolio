import React, { useContext, useEffect, useState } from 'react';
import applicationsWindowStyles from '@/styles/workarea/applications/ApplicationsWindow.module.sass';
import Image from 'next/image';
import SearchIcon from '../../../../public/assets/system-search-symbolic.symbolic.png';
import A from '../../../../public/assets/terminal.png';
import B from '../../../../public/assets/nautilus.png';
import C from '../../../../public/assets/preferences-desktop.png';
import ApplicationIcon from './ApplicationIcon';
import Desktop from '../desktop/Desktop';
import BaseDesktop from '../desktop/BaseDesktop';
import { MainContext } from '../Main';
import { Data } from '@/types/data';
import { Props } from '@/types/props';
import { generateJSXKey, getFilteredApplicationsByNameAndMetadata } from '@/lib/utils';
import { COLOR_PALETTE_OPTIONS } from '@/lib/constants';


export default function ApplicationsWindow({ 
	applicationsWindowRef,
	opennedProcessesData, 
	desktopActivitiesData,
	baseDesktopUUID 
}: Props.ApplicationsWindowProps) {

    const { 
		systemColorPalette, 
		systemLayout, 
		applicationsAreBeingShowed 
	} = useContext(MainContext);

	const [ applicationsWindowRefLoaded, setApplicationsWindowRefLoaded ] = useState(false);

	useEffect(() => {
		setApplicationsWindowRefLoaded(previous => true);
	}, [applicationsWindowRef]);

	
	const baseDesktopProps: Props.BaseDesktopProps = {
		baseDesktopUUID: baseDesktopUUID,
		desktopActivitiesData,
		applicationsWindowRef
	};

	const [ searchFilterString, setSearchFilterString ] = useState('');

	const applicationsIconProps: (Props.ApplicationIconProps & Data.ApplicationMetadata)[] = [
		{
			applicationIconStaticImage: A,
			applicationName: 'Terminal',
			applicationElement: <></>,
			metadata: {
				description: '',
				keyWords: [''],
				category: ['']
			}
		},
		{
			applicationIconStaticImage: B,
			applicationName: 'nautilus',
			applicationElement: <></>,
			metadata: {
				description: '',
				keyWords: [''],
				category: ['']
			}
		},
		{
			applicationIconStaticImage: C,
			applicationName: 'settings',
			applicationElement: <></>,
			metadata: {
				description: '',
				keyWords: [''],
				category: ['']
			}
		},
		{
			applicationIconStaticImage: A,
			applicationName: 'Terminal',
			applicationElement: <></>,
			metadata: {
				description: '',
				keyWords: [''],
				category: ['']
			}
		},
		{
			applicationIconStaticImage: B,
			applicationName: 'nautilus',
			applicationElement: <></>,
			metadata: {
				description: '',
				keyWords: ['storage'],
				category: ['']
			}
		},
		{
			applicationIconStaticImage: C,
			applicationName: 'settings',
			applicationElement: <></>,
			metadata: {
				description: '',
				keyWords: [''],
				category: ['']
			}
		},
		{
			applicationIconStaticImage: A,
			applicationName: 'Terminal',
			applicationElement: <></>,
			metadata: {
				description: '',
				keyWords: [''],
				category: ['']
			}
		},
		{
			applicationIconStaticImage: B,
			applicationName: 'nautilus',
			applicationElement: <></>,
			metadata: {
				description: '',
				keyWords: [''],
				category: ['']
			}
		},
		{
			applicationIconStaticImage: C,
			applicationName: 'settings',
			applicationElement: <></>,
			metadata: {
				description: '',
				keyWords: [''],
				category: ['']
			}
		}
	];


    return ( 
        <div 
			className={`
				${applicationsWindowStyles.container} 
				${applicationsWindowStyles[systemLayout]}
				${applicationsWindowStyles[applicationsAreBeingShowed? 'app-showed' : 'app-not-showed']}
				`
			}
			ref={applicationsWindowRef}
        >
            <div 
				className={applicationsWindowStyles.search__wrapper}
				style={{
					outlineColor: COLOR_PALETTE_OPTIONS[systemColorPalette].opennedIndicatorColor
				}}
			>
                <div className={applicationsWindowStyles.search__icon__wrapper}>
		  			<Image src={SearchIcon} alt='search icon' className={applicationsWindowStyles.icon}/>
                </div>
                <input 
					type='text' 
					className={applicationsWindowStyles.search__input} 
					placeholder='Type to search'
					value={searchFilterString}
					onChange={(e) => setSearchFilterString(e.target.value)}
				/>
            </div>
            <div className={applicationsWindowStyles.activities__wrapper}>

				{
					desktopActivitiesData.map((desktopActivityData, index) => (
						<Desktop 
							key={desktopActivityData.UUID}
							UUID={desktopActivityData.UUID} 
							opennedProcessesData={opennedProcessesData}
							applicationsWindowRef={applicationsWindowRef}
						/>
					))
				}

		  		{applicationsWindowRefLoaded && (<BaseDesktop key={baseDesktopUUID} {...baseDesktopProps}/>)}

			</div>
            <div className={applicationsWindowStyles.applications__wrapper}>

				{
					getFilteredApplicationsByNameAndMetadata(applicationsIconProps, searchFilterString)
					.map((applicationIconProps, index) => (
						<ApplicationIcon 
							key={generateJSXKey(
								'application-icon', 
								applicationIconProps.applicationName, 
								index
							)} 
							{...applicationIconProps}
						/>
					))
				}

			</div>
        </div>
    );
}
