import type toDoTaskModel from "./toDoTaskModel";

export default interface userModel {
    name?: string,
    id: string,
    email: string,
    role?: string,
    image: string,
    phoneNumber?: string,
    tasks?: toDoTaskModel[]
}

// Interface koristim kada definisem objekat ili klasu 