import { Operator } from "../functions";
import i18next from "i18next";

const compileTimeOperatorList: {basename: string}[] = import.meta.compileTime("../compiletime/operatorDescription.ts"); // The will compile to ["impose", "extractPages", etc...]

export async function getOperatorByName(name: string): Promise<typeof Operator | undefined> {
    // Check if exists
    if(!compileTimeOperatorList.find(e => e.basename == name)) return;

    i18next.loadNamespaces(name, (err, t) => { if (err) throw err; console.log(t) });
    const loadedModule = await import("../functions/" + name + ".ts");
    const operator = loadedModule[capitalizeFirstLetter(name)];
    if(!operator) {
        throw Error("This operator does not export its class in the correct format.")
    }
    return operator;
}

export function listOperatorNames(): string[] {
    const availableOperators = compileTimeOperatorList.map(e => e.basename);
    return availableOperators;
}

function capitalizeFirstLetter(string: String) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}