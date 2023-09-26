export type AddPollutant = {
    pollutantName: string,
    mfr: number,
    tlv: number
}

export default interface Pollutant {
    id: number;

    pollutantName: string;

    mfr: number;

    tlv: number;
}