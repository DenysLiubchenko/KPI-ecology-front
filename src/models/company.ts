export type AddCompany = {
    companyName: string,
    activity: string,
    location: string
}

export default interface Company {
    id: number;

    companyName: string;

    activity: string;

    location: string;
}