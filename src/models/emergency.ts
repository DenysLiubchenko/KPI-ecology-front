import Company from "./company";
import Pollutant from "./pollutant";

export type AddEmergency = {
    company: {id: number};

    pollutant: {id: number};

    pollutionValue: number;

    pollutionConcentration: number;

    peopleMinorInjury: number;

    peopleSeriousInjury: number;

    peopleDisability: number;

    peopleDead: number;
}

export type UpdateEmergency = {
    company: {id: number};

    pollutant: {id: number};

    pollutionValue: number;

    pollutionConcentration: number;

    peopleMinorInjury: number;

    peopleSeriousInjury: number;

    peopleDisability: number;

    peopleDead: number;
}

export default interface Emergency {
    id: number;

    company: Company;

    pollutant: Pollutant;

    pollutionValue: number;

    pollutionConcentration: number;

    peopleMinorInjury: number;

    peopleSeriousInjury: number;

    peopleDisability: number;

    peopleDead: number;

    pollutionLoss: number;

    peopleLoss: number;
}