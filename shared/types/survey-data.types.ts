export interface SurveyQuestion {
    id?: string;
    questionText: string;
    questionType: 'YES_NO' | 'TEXT' | 'MULTIPLE_CHOICE' | 'SCALE' | 'CHECKBOX';
    required: boolean;
    options?: string[];
    category?: string;
}

export interface SurveyTemplateDefault {
    template: {
        id: string;
        title: string;
        description: string;
        targetAudience: 'STUDENT' | 'PARENT' | 'TEACHER' | 'ALL';
        tags: string[];
        createdBy: string;
        isActive: boolean;
    };
    questions: SurveyQuestion[];
}
