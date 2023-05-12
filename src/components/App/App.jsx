import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home, ProductList, Auth, AuthContextProvider } from '~/features';
import { Layout } from '~/components';
import './App.css';

function App() {
  return (
    <AuthContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<ProductList />} />
            <Route path="login" element={<Auth />} />
            <Route path="register" element={<Auth />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContextProvider>
  );
}

export default App;
