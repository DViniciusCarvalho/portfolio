export class ParseTreeError {
    constructor(public errorMessage: string, public errorStatus: number) {}
}

export class ExecutionTreeError {
    constructor(public errorMessage: string, public errorStatus: number) {}
}