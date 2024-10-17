import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="text-3xl bg-primary text-primary-foreground p-6 text-center">Hello</div>
    </ThemeProvider>
  );
}

export default App;
