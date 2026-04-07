import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Header from "./components/Header";
import Toast from "./components/Toast";
import Home from "./pages/Home";
import Aippt from "./pages/Aippt";
import { useToast } from "./hooks/useToast";

export default function App() {
  const { toasts, addToast } = useToast();

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Header />

        <main className="content-wrap">
          <Routes>
            <Route path="/" element={<Home addToast={addToast} />} />
            <Route path="/aippt" element={<Aippt />} />
          </Routes>
        </main>

<<<<<<< HEAD
        <footer className="footer">
          <p>
            Built with <span>VisionText AI</span> ·{" "}
            <span>developed by Naveen</span>
          </p>
        </footer>
=======
      <footer className="footer">
        <p>
          Built with <span>VisionText AI</span> ·{" "}
          <span>developed by Naveen and Vivek</span>
        </p>
      </footer>
>>>>>>> 3826fc00c44d38284a7a31932f13d3c9fbc50076

        <Toast toasts={toasts} />
      </div>
    </BrowserRouter>
  );
}
