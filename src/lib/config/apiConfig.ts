export interface ApiConfig {
    BASE_URL: string
    TIMEOUT : number
    RETRY_ATTEMPT : number
    RETRY_DELAY : number
}

export const API_CONFIG:ApiConfig = {
    BASE_URL:process.env.NEXT_PUBLIC_BASE_URL || "",
    TIMEOUT : 50000,
    RETRY_ATTEMPT : 3,
    RETRY_DELAY : 1000
} as const
