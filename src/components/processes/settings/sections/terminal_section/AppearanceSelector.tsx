import React from 'react';
import terminalSectionStyles from '@/styles/processes/settings/sections/TerminalSection.module.sass';
import { Props } from '@/types/props';


export default function AppearanceColorSelector({
    color,
    action,
    title,
    description
}: Props.AppearanceColorSelectorProps) {

    return (
        <div className={terminalSectionStyles.terminal__appearance__selector}>
			<p className={terminalSectionStyles.terminal__appearance__selector__label}>
                {title}
                {description && (
                    <p className={terminalSectionStyles.label__description}>
                        {description}
                    </p>
                )}
			</p>
			<input 
				type={'color'}
				id={`color_input_${title}`}
				className={terminalSectionStyles.color__input}
				value={color}
				onInput={e => action(
					(e.target as HTMLInputElement).value
				)}
                tabIndex={1}
			/>
			<label 
				htmlFor={`color_input_${title}`}
				className={terminalSectionStyles.color__input__label}
                tabIndex={0}
			>
				<span 
					className={terminalSectionStyles.color__demonstration}
					style={{
						backgroundColor: color
					}}
				/>
				{color}
			</label>
		</div>
    );
}
