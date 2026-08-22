import type { RequestStatus } from "../../../shared/types";

export type AllNewsInterface = NewsInterface[]


export  interface NewsInterface {
id: number;
title: string;
description: string;
image: string | null;
uploadDate: string;
}

export type NewsFormInput = Omit<NewsInterface , 'id' | 'uploadDate' | 'image'> & {image: File | null}

export interface NewsStatus {
news: AllNewsInterface;
newsById: NewsInterface | null;
getAllNewsStatus: RequestStatus;
getAllNewsError: string | undefined;
getNewsByIdStatus: RequestStatus;
getNewsByIdError: string | undefined;
createNewsStatus: RequestStatus;
createNewsError: string | undefined;
updateNewsStatus: RequestStatus;
updateNewsError: string | undefined;
deleteNewsStatus: RequestStatus;
deleteNewsError: string | undefined;
}