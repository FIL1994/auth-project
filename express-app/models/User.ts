export interface User {
  readonly id: string;
  email: string;
  name: string;
  password: string;
}

export interface UserInput extends Omit<User, "id"> {}
