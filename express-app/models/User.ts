import { IsNotEmpty, IsEmail, MinLength, MaxLength } from "class-validator";

export class UserInput {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  name: string;

  @IsNotEmpty()
  @MinLength(4)
  password: string;
}

export class User extends UserInput {
  readonly id: string;
}
