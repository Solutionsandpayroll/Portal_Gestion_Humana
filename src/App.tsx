import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FormularioRequisicion from './pages/FormularioRequisicion';
import FormularioDesempenoEstrategico from './pages/FormularioDesempenoEstrategico';
import FormularioDesempenoTactico from './pages/FormularioDesempenoTactico';
import FormularioDesempenoOperativo from './pages/FormularioDesempenoOperativo';
import FormularioPeople from './pages/FormularioPeople';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/formulario-requisicion" element={<FormularioRequisicion />} />
          <Route path="/formulario-desempeno/estrategico" element={<FormularioDesempenoEstrategico />} />
          <Route path="/formulario-desempeno/tactico" element={<FormularioDesempenoTactico />} />
          <Route path="/formulario-desempeno/operativo" element={<FormularioDesempenoOperativo />} />
          <Route path="/formulario-people" element={<FormularioPeople />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
