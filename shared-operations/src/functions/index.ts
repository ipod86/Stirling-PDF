import { PdfFile } from "../wrappers/PdfFile";
import { Action } from "../../declarations/Action";
import Joi from "@stirling-tools/joi";

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
    actionValues: any = undefined;

    constructor (action: Action) {
        this.actionValues = action.values;
    }

    async run(input: PdfFile[] | any[], progressCallback: (progress: Progress) => void): Promise<PdfFile[] | any[]> {
        progressCallback({ curFileProgress: 1, operationProgress: 1 })
        return input;
    }
}


export class OperatorSchema {
    schema: Joi.ObjectSchema<any>;

    constructor(label: string, description: string, inputSchema: Joi.Schema, valueSchema: Joi.Schema, outputSchema: Joi.Schema) {
        this.schema = Joi.object({
            input: inputSchema,
            values: valueSchema.required(),
            output: outputSchema
        }).label(label).description(description);
    }
}

/** This function should be used if the Operation may take multiple files as inputs and only outputs one file */
export async function nToOne <I, O>(inputs: I[], callback: (input: I[]) => Promise<O>): Promise<O[]> {
    return [await callback(inputs)];
}

/** This function should be used if the Operation takes one file as input and may output multiple files */
export async function oneToN <I, O>(inputs: I[], callback: (input: I, index: number, max: number) => Promise<O[]>): Promise<O[]> {
    let output: O[] = [];
    for (let i = 0; i < inputs.length; i++) {
        output = output.concat(await callback(inputs[i], i, inputs.length));
    }
    return output;
}

/** This function should be used if the Operation takes one file as input and outputs only one file */
export async function oneToOne <I, O>(inputs: I[], callback: (input: I, index: number, max: number) => Promise<O>): Promise<O[]> {
    return oneToN(inputs, async (input, index, max) => {
        return [await callback(input, index, max)];
    });
}