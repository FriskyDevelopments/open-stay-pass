import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

const Arrival = lazy(() => import("./pages/Arrival"));
const Handoff = lazy(() => import("./pages/Handoff"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Operator = lazy(() => import("./pages/Operator"));
const PressKit = lazy(() => import("./pages/PressKit"));
const Pricing = lazy(() => import('./pages/Pricing'));
const Demo = lazy(() => import('./pages/Demo'));
const Start = lazy(() => import('./pages/Start'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));
const LicensePage = lazy(() => import('./pages/LicensePage'));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<div className="route-loading" aria-live="polite">Loading credential surface…</div>}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/pricing"} component={Pricing} />
        <Route path={"/demo"} component={Demo} />
        <Route path={"/start"} component={Start} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/privacy"} component={Privacy} />
        <Route path={"/terms"} component={Terms} />
        <Route path={"/security"} component={SecurityPage} />
        <Route path={"/license"} component={LicensePage} />
        <Route path={"/operator"} component={Operator} />
        <Route path={"/arrival/:token"} component={Arrival} />
        <Route path={"/handoff/:token"} component={Handoff} />
        <Route path={"/integrations"} component={Integrations} />
        <Route path={"/press-kit"} component={PressKit} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
