import React, { useContext, useEffect, useState } from 'react';
import applicationsWindowStyles from '@/styles/workarea/applications/ApplicationsWindow.module.sass';
import Image from 'next/image';
import SearchIcon from '../../../../public/assets/system-search-symbolic.symbolic.png';
import A from '../../../../public/assets/terminal.png';
import B from '../../../../public/assets/nautilus.png';
import C from '../../../../public/assets/preferences-desktop.png';
import ApplicationIcon from './ApplicationIcon';
import Workspace from '../workspace/Workspace';
import BaseWorkspace from '../workspace/BaseWorkspace';
import { MainContext } from '../Main';
import { Data } from '@/types/data';
import { Props } from '@/types/props';
import { generateJSXKey } from '@/lib/utils';
import { COLOR_PALETTE_OPTIONS } from '@/lib/initial/settings';
import { getFilteredApplicationsByNameAndMetadata } from '@/lib/application';


export default function ApplicationsWindow({ 
	applicationsWindowRef,
	opennedProcessesData, 
	workspaceActivitiesData,
	baseWorkspaceUUID 
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

	
	const baseWorkspaceProps: Props.BaseWorkspaceProps = {
		baseWorkspaceUUID: baseWorkspaceUUID,
		workspaceActivitiesData,
		applicationsWindowRef
	};

	const [ searchFilterString, setSearchFilterString ] = useState('');

	const applicationsIconProps: (Props.ApplicationIconProps & Data.ApplicationMetadata)[] = [
		{
			applicationIconStaticImage: A,
			applicationIconAlt: '',
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
			applicationIconAlt: '',
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
			applicationIconAlt: '',
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
			applicationIconAlt: '',
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
			applicationIconAlt: '',
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
			applicationIconAlt: '',
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
			applicationIconAlt: '',
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
			applicationIconAlt: '',
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
			applicationIconAlt: '',
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
		  			<Image 
						src={SearchIcon} 
						alt={'Search icon: it\'s a black magnifying glass.'} 
						className={applicationsWindowStyles.icon}
					/>
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
					workspaceActivitiesData.map((workspaceActivityData, index) => (
						<Workspace 
							key={workspaceActivityData.UUID}
							UUID={workspaceActivityData.UUID} 
							opennedProcessesData={opennedProcessesData}
							applicationsWindowRef={applicationsWindowRef}
						/>
					))
				}

		  		{applicationsWindowRefLoaded && (
					<BaseWorkspace 
						key={baseWorkspaceUUID} 
						{...baseWorkspaceProps}
					/>
				)}

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
