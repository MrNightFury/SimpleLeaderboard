export interface GetScoresRequest {
    id: string;
}

export interface AddScoreRequest {
    id: string;
    username: string;
    score: number;
}