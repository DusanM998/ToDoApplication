import type userModel from "./userModel";

export default interface toDoTaskModel {
    id: number;
    title: string;
    description?: string;
    isCompleted: boolean;
    createdAt: string; // koristimo string jer API obično vraća ISO date string
    dueDate?: string;  // nullable
    applicationUserId: string;
    user?: userModel; // optional, može biti undefined ako API ne vrati user
}