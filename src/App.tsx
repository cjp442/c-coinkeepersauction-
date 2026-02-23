import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auction from './components/Auction';
import Dashboard from './components/Dashboard';
import Multiplayer from './components/Multiplayer';
import Layout from './components/Layout';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path='/' element={<Dashboard />} />
                    <Route path='/auction' element={<Auction />} />
                    <Route path='/multiplayer' element={<Multiplayer />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
