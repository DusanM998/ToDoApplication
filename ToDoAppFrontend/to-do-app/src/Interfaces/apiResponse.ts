export default interface apiResponse {
    data?: {
        statusCode?: number;
        isSuccess?: boolean;
        errorMessage?: Array<string>;
        result: {
            [key: string]: string
        }
    };
    error?: any;
}

// Interface koristim kada definisem objekat ili klasu 