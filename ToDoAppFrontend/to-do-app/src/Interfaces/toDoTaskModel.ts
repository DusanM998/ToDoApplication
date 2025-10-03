import type { StatusTaska } from "./StatusTaska";
import type { TaskPriority } from "./TaskPriority";
import type userModel from "./userModel";

export default interface toDoTaskModel {
    id: number;
    title: string;
    description?: string;
    status: StatusTaska;
    createdAt: string; 
    dueDate?: string; 
    category?: string;
    priority?: TaskPriority;
    applicationUserId: string;
    user?: userModel; // optional, moze biti undefined ako API ne vrati user
    name?: string;
    email?: string;
}

// Interface koristim kada definisem objekat ili klasu 