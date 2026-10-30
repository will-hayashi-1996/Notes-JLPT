
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Quiz from "./Quiz";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="ml-64 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quiz" element={<Quiz />} />
        </Routes>
      </main>
    </div>
  );
}
