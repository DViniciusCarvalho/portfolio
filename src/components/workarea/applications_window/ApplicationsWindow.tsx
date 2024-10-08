import React, { 
	useContext, 
	useEffect, 
	useState 
} from 'react';

import Image from 'next/image';

import applicationsWindowStyles from '@/styles/workarea/applications/ApplicationsWindow.module.sass';

import { MainContext } from '../Main';

import { Data } from '@/types/data';
import { Props } from '@/types/props';

import { generateJSXKey } from '@/lib/utils';
import { COLOR_PALETTE_OPTIONS } from '@/lib/initial/settings';
import { getFilteredApplicationsByNameAndMetadata } from '@/lib/application';

import ApplicationIcon from './ApplicationIcon';
import Workspace from '../workspace/Workspace';
import BaseWorkspace from '../workspace/BaseWorkspace';
import APITester from '@/components/processes/applications/APITester';
import IPLocator from '@/components/processes/applications/IPLocator';
import Goalcket from '@/components/processes/applications/Goalcket';
import TicTacToe from '@/components/processes/applications/TicTacToe';
import SecNoting from '@/components/processes/applications/SecNoting';
import PersonalSite from '@/components/processes/applications/PersonalSite';
import CineMaster from '@/components/processes/applications/CineMaster';
import Contabilidadls from '@/components/processes/applications/Contabilidadls';

import SearchIcon from '../../../../public/assets/system-search-symbolic.symbolic.png';
import APITesterIcon from '../../../../public/assets/api.png';
import GoalcketIcon from '../../../../public/assets/rocket.png';
import IPLocatorIcon from '../../../../public/assets/geolocation.png';
import SecnotingIcon from '../../../../public/assets/notes.png';
import TicTacToeIcon from '../../../../public/assets/tic-tac-toe.png';
import PersonalSiteIcon from '../../../../public/assets/profile.png';
import CineMasterIcon from '../../../../public/assets/clapperboard.png';
import ContabilidadlsIcon from '../../../../public/assets/logo.png';


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


	const [ 
		applicationsWindowRefLoaded, 
		setApplicationsWindowRefLoaded 
	] = useState(false);

	const [ 
		searchFilterString, 
		setSearchFilterString 
	] = useState('');


	useEffect(() => {
		setApplicationsWindowRefLoaded(previous => true);
	}, [applicationsWindowRef]);

	
	const baseWorkspaceProps: Props.BaseWorkspaceProps = {
		baseWorkspaceUUID: baseWorkspaceUUID,
		workspaceActivitiesData,
		applicationsWindowRef
	};

	const applicationsIconProps: (
		Props.ApplicationIconProps & Data.ApplicationMetadata
	)[] = [
		{
			applicationIconStaticImage: APITesterIcon,
			applicationIconAlt: 'It\'s a gear with a cloud next to it, and \'API\' is written on the gear.',
			applicationName: 'API Tester',
			applicationElement:	<APITester/>,
			metadata: {
				description: 'It\'s an API tester, that receives and send data in JSON format',
				keyWords: [
					'API',
					'Test'
				],
				category: [
					'API',
					'Test'
				]
			} 
		},
		{
			applicationIconStaticImage: GoalcketIcon,
			applicationIconAlt: 'It\'s a rocket taking off.',
			applicationName: 'Goalcket',
			applicationElement: <Goalcket/>,
			metadata: {
				description: 'It\'s a Kanban, that allows you to create and manage goals, single or in a group',
				keyWords: [
					'Kanban',
					'Goals',
					'Enterprise',
					'Productivity'
				],
				category: [
					'Management',
					'Productivity'
				]
			}
		},
		{
			applicationIconStaticImage: IPLocatorIcon,
			applicationIconAlt: 'It\'s a red location marker on a map, that is colored by yellow, green and blue.',
			applicationName: 'IP Locator',
			applicationElement: <IPLocator/>,
			metadata: {
				description: 'It\'s a interface that allows you to obtain the geographic location of any IP address',
				keyWords: [
					'IP',
					'Location',
					'Network'
				],
				category: [
					'Network',
					'Geographic Location'
				]
			}
		},
		{
			applicationIconStaticImage: SecnotingIcon,
			applicationIconAlt: 'It\'s a red pin holding yellow note papers.',
			applicationName: 'SecNoting',
			applicationElement: <SecNoting/>,
			metadata: {
				description: 'It\'s a note app that allows you to store your data in format of notes',
				keyWords: [
					'Notes',
					'Data',
				],
				category: [
					'Notes',
					'Data'
				]
			}
		},
		{
			applicationIconStaticImage: TicTacToeIcon,
			applicationIconAlt: 'It\'s a yellow tic-tac-toe game board, with the "X" colored by red and the "O" colored by blue.',
			applicationName: 'Tic Tac Toe',
			applicationElement: <TicTacToe/>,
			metadata: {
				description: 'It\'s a tic tac toe game, with an IA as the enemy',
				keyWords: [
					'Tic Tac Toe',
					'Game',
					'IA'
				],
				category: [
					'Game',
					'IA'
				]
			}
		},
		{
			applicationIconStaticImage: PersonalSiteIcon,
			applicationIconAlt: 'It\'s a fictional resume with a yellow pencil on top.',
			applicationName: 'Personal Site',
			applicationElement: <PersonalSite/>,
			metadata: {
				description: 'It\'s Douglas\' personal website, that has information about him',
				keyWords: [
					'Personal',
					'Info'
				],
				category: [
					'Portfolio',
					'Personal',
					'Profile',
					'Info'
				]
			}
		},
		{
			applicationIconStaticImage: CineMasterIcon,
			applicationIconAlt: 'It\'s a cinema clapperboard.',
			applicationName: 'CineMaster',
			applicationElement: <CineMaster/>,
			metadata: {
				description: 'It\'s an anime cinema made in college using HTML, CSS and JS',
				keyWords: [
					'Cinema',
					'Anime',
					'Movie'
				],
				category: [
					'Cinema',
					'Entertainment',
					'College'
				]
			}
		},
		{
			applicationIconStaticImage: ContabilidadlsIcon,
			applicationIconAlt: 'It\'s a pizza graphic with \'contabilidadls\' at the bottom.',
			applicationName: 'Contabilidadls',
			applicationElement: <Contabilidadls/>,
			metadata: {
				description: 'It\'s a professional accounting website made in wordpress',
				keyWords: [
					'Accounting',
					'Wordpress',
					'Professional'
				],
				category: [
					'Accounting',
					'Professional',
					'Wordpress',
					'Real experience'
				]
			}
		}
	];


    return ( 
        <div 
			className={`
				${applicationsWindowStyles.container} 
				${applicationsWindowStyles[systemLayout]}
				${applicationsWindowStyles[
					applicationsAreBeingShowed? 'showed' : 'not--showed'
				]}
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
