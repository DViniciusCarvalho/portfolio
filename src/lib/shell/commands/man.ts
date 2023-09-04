import { Shell } from "@/types/shell"
import { BREAK_LINE } from "./common/patterns";

export const man = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    const targetCommand = commandArguments.at(0);
    
    if (!targetCommand) {
        return {
            stdout: null,
            stderr: `What manual page do you want?${BREAK_LINE}For example, try 'man man'.`,
            exitStatus: 1,
            modifiedSystemAPI: systemAPI
        };
    }

    const commandName = targetCommand.value;
    const commandModule = require(`@/lib/shell/commands/${commandName}`);
    const commandHelpFunction = commandModule['help'];

    return commandHelpFunction();
}