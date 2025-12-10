export interface TopicData {
    name: string;
    avgMinutes?: number;
    energyLevel?: 'high' | 'medium' | 'low';
    difficultyScore?: number;
    priority?: number;
}

export interface SubjectData {
    name: string;
    category: 'Okul' | 'LGS' | 'TYT' | 'AYT' | 'YDT';
    topics: TopicData[];
}
