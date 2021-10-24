import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

export class Api {
    private api: AxiosInstance;

    public constructor(config?: AxiosRequestConfig) {
        this.api = axios.create(config);
        this.api.interceptors.request.use((param: AxiosRequestConfig) => ({
            ...param
        }));
    }

    public async getUri(config?: AxiosRequestConfig): Promise<string> {
        return this.api.getUri(config);
    }

    public async request<T, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R> {
        return this.api.request(config);
    }

    public async get<T, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.api.get(url, config);
    }

    public async delete<T, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.api.delete(url, config);
    }

    public async head<T, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
        return this.api.head(url, config);
    }

    public async post<T, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.api.post(url, data, config);
    }

    public async put<T, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.api.put(url, data, config);
    }

    public async patch<T, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
        return this.api.patch(url, data, config);
    }
}
