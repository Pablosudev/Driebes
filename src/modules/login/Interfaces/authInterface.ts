import type { RequestStatus } from "../../../shared/types";

export interface AuthInput {
    email: string;
    password: string;
}
export interface AuthResponse {
    token: string;
    user: AuthUser;
}

export interface AuthUser {
    id: number;
    email:string;
    name:string;
    createDate: string;
}

export interface AuthState {
    user:AuthUser | null;
    token: string | null;
    status:RequestStatus;
    error: string | undefined;
}