import React, { useContext, useEffect, useState } from 'react';
import applicationsWindowStyles from '@/styles/workarea/applications/ApplicationsWindow.module.sass';
import Image from 'next/image';
import SearchIcon from '../../../../public/assets/system-search-symbolic.symbolic.png';
import Desktop from '../desktop/Desktop';
import BaseDesktop from '../desktop/BaseDesktop';
import { MainContext } from '../Main';
import { Props } from '@/types/props';


export default function ApplicationsWindow({ 
	applicationsWindowRef,
	opennedProcessesData, 
	updateProcessCoordinates,
	desktopActivitiesData,
	baseDesktopUUID 
}: Props.ApplicationsWindowProps) {

    const { layoutStyleClass, applicationsAreBeingShowed } = useContext(MainContext);

	const [ applicationsWindowRefLoaded, setApplicationsWindowRefLoaded ] = useState(false);

	useEffect(() => {
		setApplicationsWindowRefLoaded(previous => true);
	}, [applicationsWindowRef]);
    
	const baseDesktopProps: Props.BaseDesktopProps = {
		baseDesktopUUID: baseDesktopUUID,
		desktopActivitiesData,
		applicationsWindowRef
	};

	
    return ( 
        <div 
			className={`
				${applicationsWindowStyles.container} 
				${applicationsWindowStyles[layoutStyleClass]}
				${applicationsWindowStyles[applicationsAreBeingShowed? 'applications__showed' : '']}
				`
			}
			ref={applicationsWindowRef}
        >
            <div className={applicationsWindowStyles.search__wrapper}>
                <div className={applicationsWindowStyles.search__icon__wrapper}>
		  			<Image src={SearchIcon} alt='search icon' className={applicationsWindowStyles.icon}/>
                </div>
                <input 
					type='text' 
					className={applicationsWindowStyles.search__input} 
					placeholder='Type to search'
				/>
            </div>
            <div className={applicationsWindowStyles.activities__wrapper}>
				{desktopActivitiesData.map((desktopActivityData, index) => (
					<Desktop 
						key={desktopActivityData.UUID}
						UUID={desktopActivityData.UUID} 
						opennedProcessesData={opennedProcessesData}
						updateProcessCoordinates={updateProcessCoordinates}
						applicationsWindowRef={applicationsWindowRef}
					/>
				))}
		  		{applicationsWindowRefLoaded && (<BaseDesktop key={baseDesktopUUID} {...baseDesktopProps}/>)}
			</div>
            <div className={applicationsWindowStyles.applications__wrapper}></div>
        </div>
    );
}
