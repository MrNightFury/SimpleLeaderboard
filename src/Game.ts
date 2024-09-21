export interface SavedScore {
    name: string;
    score: number;
}

export interface Game {
    id: string;
    savedScores: SavedScore[];
}