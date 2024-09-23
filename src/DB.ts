import { ObjectId } from "mongodb";

export interface PlayerScore {
    username: string;
    score: number;
}

export interface Game {
    _id?: ObjectId;
    title: string;
    scores: PlayerScore[];
}