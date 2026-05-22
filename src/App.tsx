import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { CalculatorProvider } from "@/lib/calculator/CalculatorContext";
import StartPage from "./pages/StartPage";
import Calculator from "./pages/Calculator";
import Summary from "./pages/Summary";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <CalculatorProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<StartPage />} />
              <Route path="/rechner" element={<Calculator />} />
              <Route path="/zusammenfassung" element={<Summary />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CalculatorProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
