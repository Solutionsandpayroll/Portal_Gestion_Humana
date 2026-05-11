import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FormularioRequisicion from './pages/FormularioRequisicion';
import FormularioDesempenoEstrategico from './pages/FormularioDesempenoEstrategico';
import FormularioDesempenoTactico from './pages/FormularioDesempenoTactico';
import FormularioDesempenoOperativo from './pages/FormularioDesempenoOperativo';
import FormularioPeople from './pages/FormularioPeople';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/formulario-requisicion" element={<ProtectedRoute><FormularioRequisicion /></ProtectedRoute>} />
          <Route path="/formulario-desempeno/estrategico" element={<ProtectedRoute><FormularioDesempenoEstrategico /></ProtectedRoute>} />
          <Route path="/formulario-desempeno/tactico" element={<ProtectedRoute><FormularioDesempenoTactico /></ProtectedRoute>} />
          <Route path="/formulario-desempeno/operativo" element={<ProtectedRoute><FormularioDesempenoOperativo /></ProtectedRoute>} />
          <Route path="/formulario-people" element={<ProtectedRoute><FormularioPeople /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
