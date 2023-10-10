export type AddPollutant = {
    pollutantName: string,
    mfr: number,
    tlv: number,
    elv: number,
}

export type UpdatePollutant = {
    id: number;
    pollutantName: string;
    mfr: number;
    tlv: number;
    elv: number;
}

export default interface Pollutant {
    id: number;

    pollutantName: string;

    mfr: number;

    tlv: number;

    elv: number;
}