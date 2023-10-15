import React, { useContext } from 'react';
import terminalSectionStyles from '@/styles/processes/settings/sections/TerminalSection.module.sass';
import { MainContext } from '@/components/workarea/Main';
import PreviousTerminal from './PreviousTerminal';
import AppearanceColorSelector from './AppearanceSelector';


export default function TerminalSection() {

	const {
		systemTheme,
		terminalFontSizeInPixels,
		terminalUserHostColor,
		terminalRootHostColor,
		terminalCurrentDirectoryColor,
		terminalDefaultColor,
		terminalBackgroundColor,
		changeTerminalFontSizeInPixels,
		changeTerminalUserHostColor,
		changeTerminalRootHostColor,
		changeTerminalCurrentDirectoryColor,
		changeTerminalDefaultColor,
		changeTerminalBackgroundColor
	} = useContext(MainContext);


	function handleFontSizeChanging(
		inputValue: string
	): void {
		
		const valueAsANumber = Number(inputValue);
		const inputIsNumber = !isNaN(valueAsANumber);

		if (inputIsNumber) changeTerminalFontSizeInPixels(valueAsANumber);
	}

	
	return (
		<React.Fragment>
			<p 
				className={`
					${terminalSectionStyles.terminal__label}
					${terminalSectionStyles[systemTheme]}
					`
				}
			>
				Terminal
			</p>
			<div 
				className={`
					${terminalSectionStyles.terminal__wrapper} 
					${terminalSectionStyles[systemTheme]}
					`
				}
			>
				<div className={terminalSectionStyles.terminal__previous__section}>
					<PreviousTerminal terminalUserIsRootUser={false}/>
					<PreviousTerminal terminalUserIsRootUser={true}/>
				</div>
				<div className={terminalSectionStyles.terminal__appearance__selectors__wrapper}>
					<div className={terminalSectionStyles.terminal__appearance__selector}>
						Font-size
						<div className={terminalSectionStyles.fontsize__input__wrapper}>
							<button
								onClick={() => changeTerminalFontSizeInPixels(
									terminalFontSizeInPixels - 1
								)}
							>
								-
							</button>
							<input 
								type={'text'}
								className={terminalSectionStyles.fontsize__input}
								value={terminalFontSizeInPixels}
								onInput={(e) => handleFontSizeChanging(
									(e.target as HTMLInputElement).value
								)}
							/>
							<button
								onClick={() => changeTerminalFontSizeInPixels(
									terminalFontSizeInPixels + 1
								)}
							>
								+
							</button>
						</div>
					</div>

					<AppearanceColorSelector
						color={terminalUserHostColor}
						action={changeTerminalUserHostColor}
						title={'Normal User Prompt Color'}
						description={'Is the "username@domain".'}
					/>

					<AppearanceColorSelector
						color={terminalRootHostColor}
						action={changeTerminalRootHostColor}
						title={'Root User Prompt Color'}
						description={'Is the "root@domain".'}
					/>

					<AppearanceColorSelector
						color={terminalCurrentDirectoryColor}
						action={changeTerminalCurrentDirectoryColor}
						title={'Current Directory Color'}
						description={'Is the "~".'}
					/>

					<AppearanceColorSelector
						color={terminalDefaultColor}
						action={changeTerminalDefaultColor}
						title={'Default Color'}
						description={'Is the color of ":", "$", "#" and "clear".'}
					/>

					<AppearanceColorSelector
						color={terminalBackgroundColor}
						action={changeTerminalBackgroundColor}
						title={'Background Color'}
					/>

				</div>
			</div>
		</React.Fragment>
	);
}