import { ParseTreeError } from "../exception";
import { executeAST } from "./ASTanalyzer";
import { lexer } from "./lexer";
import { parser } from "./parser";
import { Shell } from "@/types/shell";


export const interpretCommand = (
    command: string,
    systemAPI: Shell.SystemAPI
): Shell.ExitFlux => {

    const commandTokens = lexer(command);
    const abstractSyntaxTree = parser(commandTokens);

    if (abstractSyntaxTree instanceof ParseTreeError) {
        return {
            stdout: null,
            stderr: abstractSyntaxTree.errorMessage,
            exitStatus: abstractSyntaxTree.errorStatus
        };
    }

    const { 
        stdout, 
        stderr, 
        exitStatus 
    } = executeAST(abstractSyntaxTree, systemAPI);

    return {
        stdout: stdout === null? '' : stdout,
        stderr: stderr,
        exitStatus: exitStatus
    };

}