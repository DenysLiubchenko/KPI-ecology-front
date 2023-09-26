import Company from "./company";
import Pollutant from "./pollutant";

export type AddPollution = {
    company: {id: number},
    pollutant: {id: number},
    pollutionValue: number,
    year: number
}

export default interface Pollution {
    id: number;

    company: Company;

    pollutant: Pollutant;

    pollutionValue: number;

    year: number;
}