import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const computeSecretHash = (username: string, clientId: string, clientSecret: string) => {
  return crypto.createHmac('sha256', clientSecret)
    .update(username + clientId)
    .digest('base64');
};

export const convertExpiresInToExpiredAt = (expiresIn: number): string => {
  const currentDate = new Date();
  const expiredAtDate = new Date(currentDate.getTime() + expiresIn * 1000);

  // Format the date as a string, for example in ISO format
  const expiredAt = expiredAtDate.toISOString();

  return expiredAt;
};