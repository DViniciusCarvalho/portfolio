import { lexer } from "./lexer";
import { parser } from "./parser";
import { Shell } from "@/types/shell";


export const interpretCommand = (
    command: string,
    systemAPI: Shell.SystemAPI
): Shell.ExitFlux => {

    const commandTokens = lexer(command);
    const abstractSyntaxTree = parser(commandTokens);
    console.log(abstractSyntaxTree)

    return {
        stdout: JSON.stringify(abstractSyntaxTree),
        stderr: null,
        exitStatus: 0
    };
}