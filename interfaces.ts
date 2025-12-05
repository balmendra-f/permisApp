
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  country: string;
  imageUrl: string;
  vacationsInDays: number;
  vacationUsedInDays: number;
  administrativeDays: number;
  timeReturnsInHours: number;
  section: string;
  sectionBoss?: string;
  isAdmin?: boolean;
  isMaster?: boolean;
  createdAt?: any;
}
