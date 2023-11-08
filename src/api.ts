import Pollution, {AddPollution, UpdatePollution} from "./models/pollution";
import axios, {AxiosProgressEvent, AxiosResponse} from "axios";
import Pollutant, {AddPollutant, UpdatePollutant} from "./models/pollutant";
import Company, {AddCompany, UpdateCompany} from "./models/company";
import PollutantType from "./models/pollutantType";
import Emergency, {AddEmergency, UpdateEmergency} from "./models/emergency";

export const baseUrl = "http://localhost:8080";

export async function fetchPollution(): Promise<Pollution[]> {
    return (await axios.get(baseUrl + "/data/get/pollution")).data;
}

export async function fetchPollutant(): Promise<Pollutant[]> {
    return (await axios.get(baseUrl + "/data/get/pollutant")).data;
}

export async function fetchCompany(): Promise<Company[]> {
    return (await axios.get(baseUrl + "/data/get/company")).data;
}

export async function fetchPollutantType(): Promise<PollutantType[]> {
    return (await axios.get(baseUrl + "/data/get/pollutantType")).data;
}

export async function fetchEmergency(): Promise<Emergency[]> {
    return (await axios.get(baseUrl + "/data/get/emergency")).data;
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

export async function deleteEmergency(ids: number[]): Promise<AxiosResponse<any, any>> {
    return axios.post(baseUrl + "/data/delete/emergency", ids);
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

export async function addEmergency(emergency: AddEmergency): Promise<Emergency> {
    return axios.post(baseUrl + "/data/upload/emergency", emergency);
}

export async function updatePollutant(pollutant: UpdatePollutant): Promise<AxiosResponse<any, any>> {
    return axios.post(baseUrl + "/data/update/pollutant", pollutant);
}

export async function updateCompany(company: UpdateCompany): Promise<AxiosResponse<any, any>> {
    return axios.post(baseUrl + "/data/update/company", company);
}

export async function updatePollution(pollution: UpdatePollution): Promise<AxiosResponse<any, any>> {
    return axios.post(baseUrl + "/data/update/pollution", pollution);
}

export async function updateEmergency(emergency: UpdateEmergency): Promise<AxiosResponse<any, any>> {
    return axios.post(baseUrl + "/data/update/emergency", emergency);
}

function download(url: string): void {
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.style.display = "none";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
}

export async function downloadPollutants() {
    download(baseUrl + "/data/get/csv/pollutant");
}

export async function downloadCompanies() {
    download(baseUrl + "/data/get/csv/company");
}

export async function downloadPollutions() {
    download(baseUrl + "/data/get/csv/pollution");
}