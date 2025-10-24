export default interface apiResponse<T = any> {
    data?: {
        statusCode?: number;
        isSuccess?: boolean;
        errorMessage?: Array<string>;
        result: T
    };
    error?: any;
}

// Interface koristim kada definisem objekat ili klasu 