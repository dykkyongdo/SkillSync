export type User = {
    id: string;
    email: string;
    role: "USER" | "ADMIN"
};

export type Group = {
    groupId: string; // Backend returns 'groupId', not 'id'
    name: string; 
    description: string;
    createdAt: string; 
    createdBy?: User;
    currentUserGroupRole?: "OWNER" | "ADMIN" | "MEMBER";
};

export type FlashcardSet = {
    id: string; 
    title: string; 
    description: string;
    createdAt: string; 
    groupId: string;
};

export type Flashcard = {
    id: string;
    question: string;
    answer: string;
    explanation?: string;
    difficulty: number;
    tags: string[];
    groupId: string;
    setId: string;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
    usageCount: number;
};

export type Page<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
};

export type DueCard = {
    flashcardId: string;
    question: string;
    answer: string;
    explanation?: string;
    difficulty: number;
    tags: string[];
    questionType: "FREE_TEXT" | "MULTIPLE_CHOICE";
    options?: string[];
    correctOptionIndex?: number;
};

export type ReviewResult = {
    flashcardId: string;
    grade: number;
    newIntervalDays: number;
    newEase: number;
    newRepetitions: number;
    nextDueAt: string;
};

export type FlashcardStats = {
    totalCards: number;
    averageDifficulty: number;
    difficultyCounts: Record<number, number>;
    allTags: string[];
    mostUsedCards: Flashcard[];
};

export type StudySubmission = {
    flashcardId: string;
    selectedOptionIndex?: number;
    userAnswer?: string;
    responseTimeMs: number;
};

export type StudyResponse = {
    flashcardId: string;
    question: string;
    answer: string;
    explanation?: string;
    difficulty: number;
    tags: string[];
    questionType: "FREE_TEXT" | "MULTIPLE_CHOICE";
    options?: string[];
    correctOptionIndex?: number;
    selectedOptionIndex?: number;
    userAnswer?: string;
    isCorrect: boolean;
    feedback: string;
};

export type Invitation = {
    membershipId: string;
    groupId: string;
    groupName: string;
    groupDescription?: string;
    inviterEmail: string;
    inviterName: string;
    sentAt: string;
};