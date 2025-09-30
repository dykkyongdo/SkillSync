export type User = {
    id: string;
    email: string;
    role: "USER" | "ADMIN"
};

export type Group = {
    id: string; 
    name: string; 
    description: string;
    createdAt: string; 
    createdBy?: User;
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
    groupId: string; 
    setId: string;
};

export type Page<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
};