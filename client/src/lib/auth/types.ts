export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  newsletter: boolean;
  createdAt: string;
  hasSubscription: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Имя для приветствия в шапке/футере страниц-«колёс» (например,
// "Добро пожаловать, three3das!"). Берётся из части email до символа "@",
// а не из поля "Имя" — так приветствие не зависит от того, что человек
// случайно ввёл (или не ввёл) в форме регистрации.
export function getWelcomeName(user: User | null | undefined): string {
  if (!user?.email) return "друг";
  const atIndex = user.email.indexOf("@");
  return atIndex > 0 ? user.email.slice(0, atIndex) : user.email;
}