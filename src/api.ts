import Pollution from "./models/pollution";
import axios, {AxiosProgressEvent, AxiosResponse} from "axios";

const baseUrl = "http://localhost:8080";

export async function fetchPollution(): Promise<Pollution[]> {
    return (await fetch(baseUrl + "/data/get/pollution")).json();
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