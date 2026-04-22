import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/i18n";
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
import GamePage from "@/pages/game";
import { CATEGORIES } from "@/lib/categories";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <LanguageProvider>
            <Switch>
              <Route path="/" component={HomePage} />
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
              {CATEGORIES.filter((cat) => cat.id !== "reading").map((cat) => (
                <Route key={cat.id} path={cat.path}>
                  {() => <CategoryPage category={cat} />}
                </Route>
              ))}
            </Switch>
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
