import { Shell } from '@/types/shell';

export class ParseTreeNode implements Shell.IParseTreeNode {
    public token: Shell.Token;
    public rightNode: ParseTreeNode | null;
    public leftNode: ParseTreeNode | null;

    constructor(
        token: Shell.Token,
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