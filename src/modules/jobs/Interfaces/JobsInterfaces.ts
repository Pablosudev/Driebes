


import type { RequestStatus } from "../../../shared/types";

export type AllJobsInterface = JobInterface[];
export interface JobInterface {
    id: number,
    title: string,
    description: string,
    requirements: string,
    companyName: string,
    phone: string | null,
    email: string | null,
    createDate: string
}

export interface JobStatus {
    jobs: AllJobsInterface,
    jobById: JobInterface | null,
    getJobsStatus: RequestStatus,
    getJobsError: string | undefined,
    getJobByIdStatus: RequestStatus,
    getJobByIdError: string | undefined,
    createJobStatus: RequestStatus,
    createJobError: string | undefined,
    updateJobStatus: RequestStatus,
    updateJobError: string | undefined,
    deleteJobStatus: RequestStatus,
    deleteJobError: string | undefined
}

export type JobInputInterface = Omit<JobInterface, 'id' | 'createDate'>;