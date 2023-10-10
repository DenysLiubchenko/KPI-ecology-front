import Company from "./company";
import Pollutant from "./pollutant";

export type AddPollution = {
    company: {id: number},
    pollutant: {id: number},
    pollutionValue: number,
    pollutionConcentration: number,
    addLadd: number,
    year: number
}

export type UpdatePollution = {
    id: number,
    company: {id: number},
    pollutant: {id: number},
    pollutionValue: number,
    pollutionConcentration: number,
    addLadd: number,
    year: number
}

export default interface Pollution {
    id: number;

    company: Company;

    pollutant: Pollutant;

    pollutionValue: number;

    pollutionConcentration: number;

    addLadd: number;

    year: number;
}