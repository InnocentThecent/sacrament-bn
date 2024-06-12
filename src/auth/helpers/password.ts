import * as bcrypt from 'bcrypt';

export class Password {
  static async hashPassword(
    password: string,
    saltRound: number,
  ): Promise<string> {
    return await bcrypt.hash(password, saltRound);
  }

  static async comparePassword(
    password: string,
    hashedPassword = '',
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async generateRandomPassword(): Promise<string> {
    return Math.random().toString(36).slice(-8);
  }

  // create a function to generate a 6 digit random number
  static async generateRandomNumber(): Promise<number> {
    return Math.floor(100000 + Math.random() * 900000);
  }
}
