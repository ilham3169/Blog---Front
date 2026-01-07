import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';


function App() {
  return (
    <BrowserRouter future={{v7_relativeSplatPath: true, v7_startTransition: true}}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;