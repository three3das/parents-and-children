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
