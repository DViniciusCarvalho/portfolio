import { ParseTreeError } from '../exception';
import { executeAST } from './ASTanalyzer';
import { lexer } from './lexer';
import { parser } from './parser';
import { Shell } from '@/types/shell';


export const interpretCommand = (
    command: string,
    systemAPI: Shell.SystemAPI
): Shell.ExitFlux & { systemAPI: Shell.SystemAPI } => {

    const commandTokens = lexer(command);

    const abstractSyntaxTree = parser(commandTokens);

    if (abstractSyntaxTree instanceof ParseTreeError) {
        return {
            stdout: null,
            stderr: abstractSyntaxTree.errorMessage,
            exitStatus: abstractSyntaxTree.errorStatus,
            systemAPI
        };
    }

    const ASTExecutionResult = executeAST(
        abstractSyntaxTree, 
        systemAPI
    );

    return {
        stdout: ASTExecutionResult.stdout,
        stderr: ASTExecutionResult.stderr,
        exitStatus: ASTExecutionResult.exitStatus,
        systemAPI: ASTExecutionResult.systemAPI
    };

}