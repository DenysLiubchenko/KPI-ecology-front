import Pollution, {AddPollution} from "./models/pollution";
import axios, {AxiosProgressEvent, AxiosResponse} from "axios";
import Pollutant, {AddPollutant} from "./models/pollutant";
import Company, {AddCompany} from "./models/company";

const baseUrl = "http://localhost:8080";

export async function fetchPollution(): Promise<Pollution[]> {
    return (await fetch(baseUrl + "/data/get/pollution")).json();
}

export async function fetchPollutant(): Promise<Pollutant[]> {
    return (await fetch(baseUrl + "/data/get/pollutant")).json();
}

export async function fetchCompany(): Promise<Company[]> {
    return (await fetch(baseUrl + "/data/get/company")).json();
}

export async function uploadCsvPollutions(file: File, onProgress?: (progress: AxiosProgressEvent) => void): Promise<AxiosResponse<any, any>> {
    const data: FormData = new FormData();
    data.append("file", file);

    return await axios.post(baseUrl + "/data/upload/csv/pollution", data, {
        onUploadProgress: onProgress
    });
}

export async function uploadCsvPollutants(file: File, onProgress?: (progress: AxiosProgressEvent) => void): Promise<AxiosResponse<any, any>> {
    const data: FormData = new FormData();
    data.append("file", file);

    return axios.post(baseUrl + "/data/upload/csv/pollutant", data, {
        onUploadProgress: onProgress
    });
}

export async function uploadCsvCompanies(file: File, onProgress?: (progress: AxiosProgressEvent) => void): Promise<AxiosResponse<any, any>> {
    const data: FormData = new FormData();
    data.append("file", file);

    return axios.post(baseUrl + "/data/upload/csv/company", data, {
        onUploadProgress: onProgress
    });
}

export async function deletePollution(ids: number[]): Promise<AxiosResponse<any, any>> {
    return axios.post(baseUrl + "/data/delete/pollution", ids);
}

export async function deletePollutant(ids: number[]): Promise<AxiosResponse<any, any>> {
    return axios.post(baseUrl + "/data/delete/pollutant", ids);
}

export async function deleteCompany(ids: number[]): Promise<AxiosResponse<any, any>> {
    return axios.post(baseUrl + "/data/delete/company", ids);
}

export async function addPollution(pollution: AddPollution): Promise<Pollution> {
    return axios.post(baseUrl + "/data/upload/pollution", pollution);
}

export async function addCompany(company: AddCompany): Promise<Pollution> {
    return axios.post(baseUrl + "/data/upload/company", company);
}

export async function addPollutant(pollutant: AddPollutant): Promise<Pollution> {
    return axios.post(baseUrl + "/data/upload/pollutant", pollutant);
}