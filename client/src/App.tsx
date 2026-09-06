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
import HomePage from "@/pages/home";
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
import IshvaraPage from "@/pages/IshvaraPage";
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
                что использует useLanguageScript() (IshvaraPage, чипы на
                страницах тем, оверлей колеса ниже), должно быть его
                потомком — поэтому оборачиваем весь Switch + оверлей. */}
            <LanguageScriptProvider>
              <Switch>
                <Route path="/" component={IshvaraPage} />
                <Route path="/login" component={LoginPage} />
                <Route path="/register" component={RegisterPage} />
                <Route path="/subscription" component={SubscriptionPage} />
                <Route path="/admin" component={AdminPanel} />
                <Route path="/game" component={GamePage} />
                <Route path="/reading" component={ReadingPage} />
                <Route path="/alphabet" component={AlphabetPage} />
                <Route path="/numbers" component={NumbersPage} />
                <Route path="/notes" component={NotesPage} />
                <Route path="/colors" component={ColorsPage} />
                <Route path="/shapes" component={ShapesPage} />
                <Route path="/living-world" component={LivingWorldPage} />
                <Route path="/elements" component={ElementsPage} />
                <Route path="/punctuation" component={PunctuationPage} />
                <Route path="/ishvara" component={IshvaraPage} />
                <Route path="/payments" component={PaymentsPage} />
                <Route path="/svarupa-bhagavana" component={SvarupaBhagavanaPage} />
                {CATEGORIES.filter((cat) => cat.id !== "reading").map((cat) => (
                  <Route key={cat.id} path={cat.path}>
                    {() => <CategoryPage category={cat} />}
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