import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LangProvider } from "@/i18n";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";

function App() {
  return (
    <div className="App">
      <LangProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </LangProvider>
    </div>
  );
}

export default App;
