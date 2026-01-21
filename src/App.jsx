import { useState, useEffect } from "react";
import axios from "axios";

import "./assets/week2.css";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  const [formData, setFormData] = useState({
    username: 'bastar_dize@icloud.com',
    password: '',
  });

  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  // 表單輸入處理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 登入提交
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;

      // 存 cookie，並設 axios header
      document.cookie = `miaToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common['Authorization'] = token;

      setIsAuth(true);
    } catch (error) {
      setIsAuth(false);
      console.log(error.response);
    }
  };

  // 確認登入狀態（可選按鈕）
  const checkLogin = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("miaToken="))
        ?.split("=")[1];

      const response = await axios.post(`${API_BASE}/api/user/check`);
      console.log(response.data);
    } catch (error) {
      console.log(error.response);
    }
  };

  // 抓產品列表
  const getProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      console.log('抓到產品列表:', response.data.products); // 確認抓到
      setProducts(response.data.products);
    } catch (error) {
      console.log(error.response);
    }
  };

  // 登入成功後抓產品
  useEffect(() => {
    if (isAuth) getProducts();
  }, [isAuth]);

  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1>請先登入</h1>

          <form className="form-floating" onSubmit={onSubmit}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="username"
                name="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={handleInputChange}
              />
              <label htmlFor="username">Email address</label>
            </div>

            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <label htmlFor="password">Password</label>
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-2">
              登入
            </button>
          </form>
        </div>
      ) : (
        <div className="container">
          <div className="row mt-5">
            <div className="col-md-6">
              <button
                className="btn btn-danger mb-5"
                type="button"
                onClick={checkLogin}
              >
                確認是否登入
              </button>

              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.origin_price}</td>
                      <td>{item.price}</td>
                      <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => setTempProduct(item)}
                        >
                          查看細節
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="col-md-6">
              <h2>單一產品細節</h2>

              {tempProduct ? (
                <div className="card mb-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    alt="主圖"
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">商品描述：{tempProduct.description}</p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex align-items-center">
                      <p className="card-text text-secondary me-2 mb-0">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      元 / {tempProduct.price} 元
                    </div>

                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt="副圖"
                          className="me-2 mb-2"
                          height="160px"
                          width="auto"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
