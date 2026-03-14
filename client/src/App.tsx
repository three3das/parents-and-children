import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/home";
import CategoryPage from "@/components/CategoryPage";
import ReadingPage from "@/pages/ReadingPage";
import AlphabetPage from "@/pages/AlphabetPage";
import NumbersPage from "@/pages/NumbersPage";
import NotesPage from "@/pages/NotesPage";
import ColorsPage from "@/pages/ColorsPage";
import ShapesPage from "@/pages/ShapesPage";
import { CATEGORIES } from "@/lib/categories";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/reading" component={ReadingPage} />
          <Route path="/alphabet" component={AlphabetPage} />
          <Route path="/numbers" component={NumbersPage} />
          <Route path="/notes" component={NotesPage} />
          <Route path="/colors" component={ColorsPage} />
          <Route path="/shapes" component={ShapesPage} />
          {CATEGORIES.filter((cat) => cat.id !== "reading").map((cat) => (
            <Route key={cat.id} path={cat.path}>
              {() => <CategoryPage category={cat} />}
            </Route>
          ))}
        </Switch>
        <Toaster />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
