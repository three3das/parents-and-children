import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/i18n";
import { LanguageScriptProvider } from "@/lib/languageScript";
import { LanguageScriptWheelOverlay } from "@/components/LanguageScriptWheelOverlay";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast";
import RequireSubscription from "@/components/RequireSubscription";
import SplashGate from "@/pages/SplashGate";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import SubscriptionPage from "@/pages/subscription";
import AdminPanel from "@/pages/admin";
import CategoryPage from "@/components/CategoryPage";
import ReadingPage from "@/pages/ReadingPage";
import AlphabetPage from "@/pages/AlphabetPage";
import NumbersPage from "@/pages/NumbersPage";
import NotesPage from "@/pages/NotesPage";
import ColorsPage from "@/pages/ColorsPage";
import ShapesPage from "@/pages/ShapesPage";
import LivingWorldPage from "@/pages/LivingWorldPage";
import ElementsPage from "@/pages/ElementsPage";
import PunctuationPage from "@/pages/PunctuationPage";
import SvarupaBhagavanaPage from "@/pages/SvarupaBhagavanaPage";
import GamePage from "@/pages/game";
import { CATEGORIES } from "@/lib/categories";
import PaymentsPage from "@/pages/PaymentsPage";


export default function App() {
  useEffect(() => {
    document.title = "Parents and children";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <LanguageProvider>
            {/* ⚠️ ДОБАВЛЕНО: LanguageScriptProvider — общее состояние
                выбора языка алфавита + системы письменности (см.
                @/lib/languageScript). Обязательно ВНУТРИ LanguageProvider,
                поскольку сам использует useLanguage() для языка. Всё,
                что использует useLanguageScript() (HomePage, чипы на
                страницах тем, оверлей колеса ниже), должно быть его
                потомком — поэтому оборачиваем весь Switch + оверлей. */}
            <LanguageScriptProvider>
              <Switch>
                {/* ⚠️ ПРАВКА: маршрут "/" больше НЕ оборачивается в
                    RequireSubscription. Раньше HomePage (с колесом
                    и всей его логикой для неавторизованных —
                    путеводитель, /payments и т.д.) вообще не успевала
                    отрендериться для незалогиненного пользователя:
                    RequireSubscription редиректил на /login ещё до
                    того, как HomePage получала шанс показать что-либо,
                    включая заставку SplashScreen. Теперь "/" рендерит
                    SplashGate — сам решает, что показать (заставку или
                    HomePage), без принудительного редиректа на /login.
                    HomePage внутри всё так же корректно обрабатывает
                    оба состояния (авторизован/нет) через
                    handleFooterClick, как и раньше. Остальные
                    маршруты (/game, /reading и т.д.) остаются
                    защищёнными RequireSubscription без изменений. */}
                <Route path="/" component={SplashGate} />
                <Route path="/login" component={LoginPage} />
                <Route path="/register" component={RegisterPage} />
                <Route path="/subscription" component={SubscriptionPage} />
                <Route path="/admin" component={AdminPanel} />
                <Route path="/game" component={() => <RequireSubscription component={GamePage} />} />
                <Route path="/reading" component={() => <RequireSubscription component={ReadingPage} />} />
                <Route path="/alphabet" component={() => <RequireSubscription component={AlphabetPage} />} />
                <Route path="/numbers" component={() => <RequireSubscription component={NumbersPage} />} />
                <Route path="/notes" component={() => <RequireSubscription component={NotesPage} />} />
                <Route path="/colors" component={() => <RequireSubscription component={ColorsPage} />} />
                <Route path="/shapes" component={() => <RequireSubscription component={ShapesPage} />} />
                <Route path="/living-world" component={() => <RequireSubscription component={LivingWorldPage} />} />
                <Route path="/elements" component={() => <RequireSubscription component={ElementsPage} />} />
                <Route path="/punctuation" component={() => <RequireSubscription component={PunctuationPage} />} />
                {/* ⚠️ ПРАВКА: "/home" тоже раньше вёл на HomePage через
                    RequireSubscription — оставлен как есть (защищённый
                    алиас на случай, если куда-то в коде уже жёстко
                    зашит переход именно на /home для авторизованных
                    пользователей). Только "/" (первая точка входа на
                    сайт) теперь открыт для всех через SplashGate. */}
                <Route path="/home" component={() => <RequireSubscription component={SplashGate} />} />
                <Route path="/payments" component={PaymentsPage} />
                <Route path="/svarupa-bhagavana" component={() => <RequireSubscription component={SvarupaBhagavanaPage} />} />
                {CATEGORIES.filter((cat) => cat.id !== "reading").map((cat) => (
                  <Route key={cat.id} path={cat.path}>
                    {() => <RequireSubscription component={() => <CategoryPage category={cat} />} />}
                  </Route>
                ))}
              </Switch>

              {/* ⚠️ ДОБАВЛЕНО: глобальный оверлей с колесом выбора
                  языка/письменности — рендерится один раз здесь (а не
                  на каждой странице отдельно), сам решает, показываться
                  ли ему, через activeWheel из useLanguageScript(). */}
              <LanguageScriptWheelOverlay />
            </LanguageScriptProvider>

            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}