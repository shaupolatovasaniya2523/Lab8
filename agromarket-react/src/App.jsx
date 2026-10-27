import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm.jsx';
import AddProductForm from './components/AddProductForm.jsx';
import { API_URL, apiFetch } from './api.js';

export default function App() {
  const [products, setProducts] = useState([]);
  
  // Состояние пользователя инициализируется из localStorage
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem('user') || 'null')
  );

  // Проверка токена при открытии страницы (если токен есть)
  useEffect(() => {
    if (!localStorage.getItem('token')) return;

    apiFetch('/auth/me')
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        // Ошибку перехватываем пустым catch, а 401 обрабатывается внутри apiFetch (происходит логаут)
      });
  }, []);

  // Загрузка каталога товаров при монтировании компонента
  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Ошибка загрузки каталога:', err));
  }, []);

  function handleLogin(loggedInUser, token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <div className="container">
      <header>
        <h1>АгроМаркет</h1>
        <div className="auth-bar">
          {user ? (
            <>
              <span>Вы вошли как <b>{user.name}</b> ({user.role})</span>
              <button onClick={handleLogout}>Выйти</button>
            </>
          ) : (
            <LoginForm onLogin={handleLogin} />
          )}
        </div>
      </header>

      <main>
        {/* Форма добавления товара видна ТОЛЬКО администратору */}
        {user?.role === 'admin' && (
          <AddProductForm onAdded={(newProduct) => setProducts([...products, newProduct])} />
        )}

        <h2>Каталог товаров</h2>
        <div className="products-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <h3>{p.name}</h3>
              <p>{p.category}</p>
              <p><b>{p.price} ₸</b> / {p.unit}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}