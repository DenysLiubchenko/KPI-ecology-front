import Company from "./company";
import Pollutant from "./pollutant";

export default interface Pollution {
    id: number;

    company: Company;

    pollutant: Pollutant;

    pollutionValue: number;

    year: number;
}