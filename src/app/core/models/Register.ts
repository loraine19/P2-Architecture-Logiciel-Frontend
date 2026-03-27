export interface User {
  id: number;
  firstName: string;
  lastName: string;
  login: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDTO = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
