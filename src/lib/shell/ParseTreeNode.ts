import { IParseTreeNode, Token } from "@/types/shell_interpreter";

export class ParseTreeNode implements IParseTreeNode {
    public token: Token;
    public rightNode: ParseTreeNode | null;
    public leftNode: ParseTreeNode | null;

    constructor(
        token: Token,
        rightNode: ParseTreeNode | null = null, 
        leftNode: ParseTreeNode | null = null
    ) {
        this.token = token;
        this.rightNode = rightNode;
        this.leftNode = leftNode;
    }

    public insertRight(node: ParseTreeNode) {
        this.rightNode = node;
    }

    public insertLeft(node: ParseTreeNode) {
        this.leftNode = node;
    }
}