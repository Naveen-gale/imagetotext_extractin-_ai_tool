import "./index.css";
import Header from "./components/Header";
import Toast from "./components/Toast";
import Home from "./pages/Home";
import { useToast } from "./hooks/useToast";

export default function App() {
  const { toasts, addToast } = useToast();

  return (
    <div className="app-wrapper">
      <Header />

      <main className="content-wrap">
        <Home addToast={addToast} />
      </main>

      <footer className="footer">
        <p>
          Built with <span>VisionText AI</span> ·{" "}
          <span>developed by Naveen</span>
        </p>
      </footer>

      <Toast toasts={toasts} />
    </div>
  );
}
