import React, { useContext, useEffect, useState } from 'react';
import applicationsWindowStyles from '@/styles/workarea/applications/ApplicationsWindow.module.sass';
import Image from 'next/image';
import SearchIcon from '../../../../public/assets/system-search-symbolic.symbolic.png';
import Desktop from '../desktop/Desktop';
import { MainContext } from '../Main';
import { Props } from '@/types/props';


export default function ApplicationsWindow({ 
	applicationsWindowRef,
	opennedProcessesData, 
	updateProcessCoordinates,
	desktopActivities,
	baseDesktopUUID 
}: Props.ApplicationsWindowProps) {

    const { layoutStyleClass, applicationsAreBeingShowed } = useContext(MainContext);

	const [ applicationsWindowRefLoaded, setApplicationsWindowRefLoaded ] = useState(false);

	useEffect(() => setApplicationsWindowRefLoaded(previous => true), [applicationsWindowRef]);
    
	const baseDesktopProps: Props.DesktopProps = {
		applicationsWindowRef,
		UUID: baseDesktopUUID,
		opennedProcessesData, 
		updateProcessCoordinates 
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
				{desktopActivities.map((desktopActivity, index) => (
					<Desktop 
						key={index}
						UUID={desktopActivity.UUID} 
						opennedProcessesData={opennedProcessesData}
						updateProcessCoordinates={updateProcessCoordinates}
						applicationsWindowRef={applicationsWindowRef}
					/>
				))}
		  		{applicationsWindowRefLoaded && (<Desktop key={baseDesktopUUID} {...baseDesktopProps}/>)}
			</div>
            <div className={applicationsWindowStyles.applications__wrapper}></div>
        </div>
    );
}
