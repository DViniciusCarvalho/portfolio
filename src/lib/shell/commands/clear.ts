import { Shell } from "@/types/shell"

export const clear = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux & { modifiedSystemAPI: Shell.SystemAPI } => {

    systemAPI.clearTerminal();

    return {
        stdout: null,
        stderr: null,
        exitStatus: 0,
        modifiedSystemAPI: systemAPI
    };
}