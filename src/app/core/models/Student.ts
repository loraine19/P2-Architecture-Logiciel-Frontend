/**
 * Student entity model with complete information
 * Represents a student record in the system
 */
export class Student {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    zipCode: string;

    constructor(
        id: number,
        firstName: string,
        lastName: string,
        email: string,
        phoneNumber: string,
        address: string,
        city: string,
        zipCode: string
    ) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.city = city;
        this.zipCode = zipCode;
    }

    /**
     * Factory method to create student from API response
     */
    static fromApiResponse(data: any): Student {
        return new Student(
            data.id,
            data.firstName,
            data.lastName,
            data.email,
            data.phoneNumber,
            data.address,
            data.city,
            data.zipCode
        );
    }

}

/**
 * Student DTO for creation without ID
 * Used when creating new student records
 */
export type StudentDto = Omit<Student, 'id'>;