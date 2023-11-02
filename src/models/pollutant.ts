export type AddPollutant = {
    pollutantName: string,
    mfr: number,
    tlv: number,
    elv: number,
    pollutantType: {id: number},
    taxRate: number,
}

export type UpdatePollutant = {
    id: number,
    pollutantName: string,
    mfr: number,
    tlv: number,
    elv: number,
    pollutantType: {id: number},
    taxRate: number,
}

export default interface Pollutant {
    id: number;

    pollutantName: string;

    mfr: number;

    tlv: number;

    elv: number;

    sf: number;

    rfc: number;

    pollutantType: {
        id: number,
        pollutantTypeName: string
    };

    taxRate: number;
}