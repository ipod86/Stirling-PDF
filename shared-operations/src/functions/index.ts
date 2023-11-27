import { Action } from "../../declarations/Action";
import Joi from "joi";

export interface ValidationResult { 
    valid: boolean, 
    reason?: string 
}

export interface Progress {
    /** A percentage between 0-1 describing the progress on the currently processed file */
    curFileProgress: number,
    /** A percentage between 0-1 describing the progress on all input files / operations */
    operationProgress: number,
}

export class Operator {
    /** The internal name of the operator in camelCase (impose, merge, etc.) */
    static type: string;

    /** The Joi validators & decorators */
    static inputSchema: Joi.Schema;
    static valueSchema: Joi.Schema;
    static outputSchema: Joi.Schema;
    static schema: Joi.Schema;

    actionValues: any;

    constructor (action: Action) {
        this.actionValues = action.values;
    }

    async run(input: any[], progressCallback: (progress: Progress) => void): Promise<any[]> {
        return [];
    }

    validate(): ValidationResult {
        if(!this.actionValues) {
            return { valid: false, reason: "The Operators action values were empty."}
        }
        return { valid: true };
    }
}

/** This function should be used if the Operation may take multiple files as inputs and only outputs one file */
export async function nToOne <I, O>(inputs: I[], callback: (input: I[]) => Promise<O>): Promise<O[]> {
    return [await callback(inputs)];
}

/** This function should be used if the Operation takes one file as input and may output multiple files */
export async function oneToN <I, O>(inputs: I[], callback: (input: I, index: number, max: number) => Promise<O[]>): Promise<O[]> {
    let output: O[] = []
    for (let i = 0; i < inputs.length; i++) {
        output = output.concat(await callback(inputs[i], i, inputs.length));
    }
    return output;
}

/** This function should be used if the Operation takes one file as input and outputs only one file */
export async function oneToOne <I, O>(inputs: I[], callback: (input: I, index: number, max: number) => Promise<O>): Promise<O[]> {
    return oneToN(inputs, async (input, index, max) => {
        return [await callback(input, index, max)]
    });
}