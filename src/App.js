import logo from './logo.svg';
import './App.css';
import Map from './ui/map';
function App() {
  return (
    <Map minZoom = {0} maxZoom = {18} width = {812} height={812} />
  );
}

export default App;
