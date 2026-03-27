export interface Student {

    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    zipCode: string;
}

export type StudentDto = Omit<Student, 'id'>;