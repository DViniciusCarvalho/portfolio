import React, { useContext } from 'react';
import settingsStyles from '@/styles/processes/Settings.module.sass';
import { MainContext } from '@/components/workarea/Main';
import PreviousTerminal from './PreviousTerminal';


export default function TerminalSection() {

	const {
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
				className={`${settingsStyles.terminal__label} ${settingsStyles.label}`}
				aria-label='terminal styles section label'
			>
				Terminal
			</p>
			<div className={`${settingsStyles.terminal__wrapper} ${settingsStyles.wrapper}`}>
				<div className={settingsStyles.terminal__previous__section}>
					<PreviousTerminal terminalUserIsRootUser={false}/>
					<PreviousTerminal terminalUserIsRootUser={true}/>
				</div>
				<div className={settingsStyles.terminal__appearance__selectors__wrapper}>
					<div className={settingsStyles.terminal__appearance__selector}>
						Font-size
						<div className={settingsStyles.fontsize__input__wrapper}>
							<button
								onClick={() => changeTerminalFontSizeInPixels(
									terminalFontSizeInPixels - 1
								)}
							>
								-
							</button>
							<input 
								type='text'
								className={settingsStyles.fontsize__input}
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
					<div className={settingsStyles.terminal__appearance__selector}>
						<div className={settingsStyles.terminal__appearance__selector__label}>
							Normal User Prompt Color
							<p className={settingsStyles.label__description}>
								Is the "username@domain".
							</p>
						</div>
						<input 
							type="color" 
							id='user_host_color_input'
							className={settingsStyles.color__input}
							value={terminalUserHostColor}
							onInput={e => changeTerminalUserHostColor(
								(e.target as HTMLInputElement).value
							)}
						/>
						<label 
							htmlFor='user_host_color_input'
							className={settingsStyles.color__input__label}
						>
							<span 
								className={settingsStyles.color__demonstration}
								style={{
									backgroundColor: terminalUserHostColor
								}}
							/>
							{terminalUserHostColor}
						</label>
					</div>
					<div className={settingsStyles.terminal__appearance__selector}>
						<div className={settingsStyles.terminal__appearance__selector__label}>
							Root User Prompt Color
							<p className={settingsStyles.label__description}>
								Is the "root@domain".
							</p>
						</div>
						<input 
							type="color" 
							id='root_host_color_input'
							className={settingsStyles.color__input}
							value={terminalRootHostColor}
							onInput={e => changeTerminalRootHostColor(
								(e.target as HTMLInputElement).value
							)}
						/>
						<label 
							htmlFor='root_host_color_input'
							className={settingsStyles.color__input__label}
						>
							<span 
								className={settingsStyles.color__demonstration}
								style={{
									backgroundColor: terminalRootHostColor
								}}
							/>
							{terminalRootHostColor}
						</label>
					</div>
					<div className={settingsStyles.terminal__appearance__selector}>
						<div className={settingsStyles.terminal__appearance__selector__label}>
							Current Directory Color
							<p className={settingsStyles.label__description}>
								Is the "~".
							</p>
						</div>
						<input 
							type="color" 
							id='current_dir_color_input'
							className={settingsStyles.color__input}
							value={terminalCurrentDirectoryColor}
							onInput={e => changeTerminalCurrentDirectoryColor(
								(e.target as HTMLInputElement).value
							)}
						/>
						<label 
							htmlFor='current_dir_color_input'
							className={settingsStyles.color__input__label}
						>
							<span 
								className={settingsStyles.color__demonstration}
								style={{
									backgroundColor: terminalCurrentDirectoryColor
								}}
							/>
							{terminalCurrentDirectoryColor}
						</label>
					</div>
					<div className={settingsStyles.terminal__appearance__selector}>
						<div className={settingsStyles.terminal__appearance__selector__label}>
							Default Color
							<p className={settingsStyles.label__description}>
								Is the color of ":", "$", "#" and "clear".
							</p>
						</div>
						<input 
							type="color" 
							id='default_color_input'
							className={settingsStyles.color__input}
							value={terminalDefaultColor}
							onInput={e => changeTerminalDefaultColor(
								(e.target as HTMLInputElement).value
							)}
						/>
						<label 
							htmlFor='default_color_input'
							className={settingsStyles.color__input__label}
						>
							<span 
								className={settingsStyles.color__demonstration}
								style={{
									backgroundColor: terminalDefaultColor
								}}
							/>
							{terminalDefaultColor}
						</label>
					</div>
					<div className={settingsStyles.terminal__appearance__selector}>
						Background Color
						<input 
							type="color" 
							id='background_color_input'
							className={settingsStyles.color__input}
							value={terminalBackgroundColor}
							onInput={e => changeTerminalBackgroundColor(
								(e.target as HTMLInputElement).value
							)}
						/>
						<label 
							htmlFor='background_color_input'
							className={settingsStyles.color__input__label}
						>
							<span 
								className={settingsStyles.color__demonstration}
								style={{
									backgroundColor: terminalBackgroundColor
								}}
							/>
							{terminalBackgroundColor}
						</label>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
}
