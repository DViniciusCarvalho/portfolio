import { Shell } from "@/types/shell"

export const echo = (    
    commandOptions: Shell.Token[],
    commandArguments: Shell.Token[],
    systemAPI: Shell.SystemAPI,
    stdin: string | null
): Shell.ExitFlux => {

    const stringContent = commandArguments[0].value as string;
    const stringContentWithoutExternalQuotes = stringContent.replace(/^['"]|['"]$/g, '');

    return {
        stdout: stringContentWithoutExternalQuotes,
        stderr: null,
        exitStatus: 0
    };
}