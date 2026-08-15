export type NavItem = { key: string; label: string };

export const headerNav: NavItem[] = [
  { key: "name", label: "Первое имя участника" },
  { key: "form", label: "Второе имя участника" },
  { key: "qualities", label: "Третье имя участника" },
  { key: "plays", label: "Четвертое имя участника" },
];

// Базовые подписи для нижней навигации. Подпись пункта "all-data"
// подменяется динамически в зависимости от статуса входа — это делает
// сама страница (IshvaraPage / PaymentsPage), а не этот общий файл.
export const footerNav: NavItem[] = [
  { key: "site-page", label: "Страница сайта" },
  { key: "your-page", label: "Ваша страница" },
  { key: "all-data", label: "Точка доступа к данным сайта" },
  { key: "languages", label: "Меню доступных языков" },
];