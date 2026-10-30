import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Nav,
  Navbar,
  Row,
  Spinner
} from 'react-bootstrap';
import api from './api';

const money = n =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(Number(n || 0));

const FALLBACK_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
      <rect width="100%" height="100%" fill="#eef2ff"/>
      <rect x="220" y="100" width="160" height="130" rx="16" fill="#c7d2fe"/>
      <circle cx="300" cy="165" r="30" fill="#6366f1"/>
      <text x="300" y="275" font-size="26" text-anchor="middle"
        fill="#3730a3" font-family="Arial">TechStore</text>
    </svg>
  `);

const CATEGORY_IMAGES = {
  Audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=80',
  Storage: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=900&auto=format&fit=crop&q=80',
  Laptops: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&auto=format&fit=crop&q=80',
  Accessories: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=900&auto=format&fit=crop&q=80',
  Wearables: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop&q=80',
  Workspace: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=900&auto=format&fit=crop&q=80',
  Monitors: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=900&auto=format&fit=crop&q=80'
};

function handleProductImageError(event, category) {
  const image = event.currentTarget;

  if (image.dataset.fallbackAttempted !== 'category') {
    image.dataset.fallbackAttempted = 'category';
    image.src = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Accessories;
    return;
  }

  image.onerror = null;
  image.src = FALLBACK_IMAGE;
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageType, setMessageType] = useState('warning');

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techstore_cart') || '[]');
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techstore_user') || 'null');
    } catch {
      return null;
    }
  });

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [auth, setAuth] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const [showCart, setShowCart] = useState(false);
  const [address, setAddress] = useState('');
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const [draft, setDraft] = useState({
    name: '',
    description: '',
    category: 'Accessories',
    price: '',
    stock: '',
    imageUrl: ''
  });

  function notify(text, type = 'warning') {
    setError(text);
    setMessageType(type);
  }

  useEffect(() => {
    if (!error) return undefined;

    const timer = window.setTimeout(() => setError(''), 3500);

    return () => window.clearTimeout(timer);
  }, [error]);

  async function loadProducts() {
    setLoading(true);
    setError('');

    try {
      const params = {};

      if (query.trim()) params.q = query.trim();
      if (category) params.category = category;

      const { data } = await api.get('/products', { params });

      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Lỗi tải sản phẩm:', e);

      notify(
        'Không tải được sản phẩm. Hãy kiểm tra backend và MySQL.',
        'danger'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('techstore_cart', JSON.stringify(cart));
  }, [cart]);

  const cartCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  function addToCart(product) {
    if (Number(product.stock) <= 0) {
      notify('Sản phẩm này hiện đã hết hàng.', 'warning');
      return;
    }

    const existing = cart.find(item => item.id === product.id);

    if (
      existing &&
      Number(existing.quantity) >= Number(product.stock)
    ) {
      notify(
        `Bạn đã thêm tối đa ${product.stock} sản phẩm "${product.name}".`,
        'warning'
      );
      return;
    }

    setCart(old => {
      const item = old.find(x => x.id === product.id);

      if (item) {
        return old.map(x =>
          x.id === product.id
            ? {
                ...x,
                quantity: Math.min(
                  Number(x.quantity) + 1,
                  Number(product.stock)
                )
              }
            : x
        );
      }

      return [
        ...old,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
          stock: Number(product.stock),
          quantity: 1
        }
      ];
    });

    notify(`Đã thêm "${product.name}" vào giỏ hàng.`, 'success');
  }

  function updateQuantity(id, quantity) {
    const item = cart.find(x => x.id === id);

    if (!item) return;

    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      return;
    }

    if (parsedQuantity > Number(item.stock)) {
      notify(
        `Sản phẩm "${item.name}" chỉ còn ${item.stock} sản phẩm.`,
        'warning'
      );
    }

    setCart(old =>
      old.map(x =>
        x.id === id
          ? {
              ...x,
              quantity: Math.max(
                1,
                Math.min(parsedQuantity, Number(x.stock))
              )
            }
          : x
      )
    );
  }

  function removeFromCart(id) {
    setCart(old => old.filter(item => item.id !== id));
    notify('Đã xóa sản phẩm khỏi giỏ hàng.', 'success');
  }
    async function submitAuth(e) {
    e.preventDefault();
    setError('');

    try {
      const endpoint =
        authMode === 'login' ? '/auth/login' : '/auth/register';

      const payload =
        authMode === 'login'
          ? {
              email: auth.email,
              password: auth.password
            }
          : auth;

      const { data } = await api.post(endpoint, payload);

      localStorage.setItem('techstore_token', data.accessToken);
      localStorage.setItem('techstore_user', JSON.stringify(data.user));

      setUser(data.user);
      setShowAuth(false);

      setAuth({
        fullName: '',
        email: '',
        password: ''
      });

      notify(
        authMode === 'login'
          ? 'Đăng nhập thành công!'
          : 'Đăng ký thành công!',
        'success'
      );
    } catch (e) {
      console.error('Lỗi xác thực:', e);

      notify(
        e.response?.data?.message?.toString() ||
          'Đăng nhập hoặc đăng ký thất bại.',
        'danger'
      );
    }
  }

  function logout() {
    localStorage.removeItem('techstore_token');
    localStorage.removeItem('techstore_user');

    setUser(null);
    setOrders([]);
    setShowOrders(false);
    setShowAdmin(false);

    notify('Bạn đã đăng xuất.', 'success');
  }

  async function checkout() {
    if (!user) {
      setShowCart(false);
      setAuthMode('login');
      setShowAuth(true);

      notify('Vui lòng đăng nhập trước khi đặt hàng.', 'warning');
      return;
    }

    if (cart.length === 0) {
      notify('Giỏ hàng đang trống.', 'warning');
      return;
    }

    if (!address.trim()) {
      notify('Vui lòng nhập địa chỉ giao hàng.', 'warning');
      return;
    }

    try {
      await api.post('/orders', {
        shippingAddress: address,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }))
      });

      setCart([]);
      setAddress('');
      setShowCart(false);

      notify('Đặt hàng thành công!', 'success');

      await loadProducts();
    } catch (e) {
      console.error('Lỗi đặt hàng:', e);

      notify(
        e.response?.data?.message?.toString() ||
          'Không thể đặt hàng. Vui lòng thử lại.',
        'danger'
      );
    }
  }

  async function loadOrders() {
    try {
      const { data } = await api.get('/orders/mine');

      setOrders(Array.isArray(data) ? data : []);
      setShowOrders(true);
    } catch (e) {
      notify(
        e.response?.data?.message?.toString() ||
          'Vui lòng đăng nhập để xem đơn hàng.',
        'danger'
      );
    }
  }

  async function createProduct(e) {
    e.preventDefault();

    try {
      await api.post('/products', {
        ...draft,
        price: Number(draft.price),
        stock: Number(draft.stock)
      });

      setDraft({
        name: '',
        description: '',
        category: 'Accessories',
        price: '',
        stock: '',
        imageUrl: ''
      });

      setShowAdmin(false);

      notify('Đã thêm sản phẩm thành công!', 'success');

      await loadProducts();
    } catch (e) {
      console.error('Lỗi thêm sản phẩm:', e);

      notify(
        e.response?.data?.message?.toString() ||
          'Không thể thêm sản phẩm. Hãy kiểm tra quyền admin.',
        'danger'
      );
    }
  }

  return (
    <div className="app-shell">
      <Navbar expand="lg" className="store-nav" variant="dark">
        <Container>
          <Navbar.Brand href="#" className="brand-mark">
            <span className="brand-icon">T</span> TechStore
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="store-nav" />

          <Navbar.Collapse id="store-nav">
            <Nav className="ms-auto align-items-lg-center gap-lg-2">
              <Nav.Link href="#products">Sản phẩm</Nav.Link>

              {user && (
                <Nav.Link onClick={loadOrders}>
                  Đơn hàng của tôi
                </Nav.Link>
              )}

              {user?.role === 'admin' && (
                <Nav.Link onClick={() => setShowAdmin(true)}>
                  Quản trị
                </Nav.Link>
              )}

              <Button
                variant="outline-light"
                onClick={() => setShowCart(true)}
              >
                Giỏ hàng{' '}
                <Badge bg="warning" text="dark">
                  {cartCount}
                </Badge>
              </Button>

              {user ? (
                <>
                  <span className="nav-user">
                    Xin chào, {user.fullName}
                  </span>

                  <Button variant="light" onClick={logout}>
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <Button
                  variant="warning"
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuth(true);
                  }}
                >
                  Đăng nhập
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <section className="hero-section">
        <Container>
          <Row className="align-items-center gy-4">
            <Col lg={7}>
              <div className="eyebrow">
                TECHNOLOGY · LIFESTYLE · PRODUCTIVITY
              </div>

              <h1>
                Nâng cấp góc công nghệ <span>của bạn.</span>
              </h1>

              <p>
                Khám phá phụ kiện, thiết bị và những món đồ công nghệ
                hữu ích cho học tập, công việc và giải trí.
              </p>

              <Button variant="warning" size="lg" href="#products">
                Khám phá sản phẩm <span aria-hidden="true">→</span>
              </Button>
            </Col>

            <Col lg={5}>
              <div className="hero-art">
                <div className="orb orb-one"></div>
                <div className="orb orb-two"></div>

                <div className="device-card">
                  <div className="device-screen">
                    <span>TECH</span>
                    <strong>STORE</strong>
                    <small>YOUR DIGITAL SPACE</small>
                  </div>

                  <div className="device-base"></div>
                </div>

                <div className="float-chip">✦ Smart choices</div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
            <Container className="content-wrap" id="products">
        <div className="section-heading">
          <div>
            <div className="eyebrow dark-eyebrow">CURATED FOR YOU</div>
            <h2>Sản phẩm nổi bật</h2>
            <p>Tìm thiết bị phù hợp với nhu cầu của bạn.</p>
          </div>

          <div className="product-count">
            {products.length} sản phẩm
          </div>
        </div>

        <Form
          onSubmit={e => {
            e.preventDefault();
            loadProducts();
          }}
          className="search-panel mb-4"
        >
          <Row className="g-2 align-items-end">
            <Col md={7}>
              <Form.Label>Tìm kiếm</Form.Label>

              <Form.Control
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tên sản phẩm hoặc mô tả..."
              />
            </Col>

            <Col md={3}>
              <Form.Label>Danh mục</Form.Label>

              <Form.Select
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                <option value="Accessories">Accessories</option>
                <option value="Monitors">Monitors</option>
                <option value="Workspace">Workspace</option>
                <option value="Audio">Audio</option>
                <option value="Storage">Storage</option>
                <option value="Laptops">Laptops</option>
                <option value="Wearables">Wearables</option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Button type="submit" className="w-100 search-btn">
                Tìm kiếm
              </Button>
            </Col>
          </Row>
        </Form>

        {loading ? (
          <div className="loading-state">
            <Spinner animation="border" />
            <span>Đang tải sản phẩm...</span>
          </div>
        ) : (
          <Row className="g-4">
            {products.map(p => (
              <Col key={p.id} sm={6} lg={4} xl={3}>
                <Card className="product-card h-100">
                  <div className="product-image-wrap">
                    <Card.Img
                      variant="top"
                      src={
                        p.imageUrl ||
                        CATEGORY_IMAGES[p.category] ||
                        FALLBACK_IMAGE
                      }
                      alt={p.name}
                      loading="lazy"
                      onError={e =>
                        handleProductImageError(e, p.category)
                      }
                    />

                    <Badge
                      bg="light"
                      text="dark"
                      className="category-badge"
                    >
                      {p.category}
                    </Badge>
                  </div>

                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{p.name}</Card.Title>

                    <Card.Text className="product-description">
                      {p.description}
                    </Card.Text>

                    <div className="stock-note">
                      {p.stock > 0
                        ? `Còn ${p.stock} sản phẩm`
                        : 'Tạm hết hàng'}
                    </div>

                    <div className="mt-auto d-flex align-items-center justify-content-between gap-2">
                      <strong className="product-price">
                        {money(p.price)}
                      </strong>

                      <Button
                        size="sm"
                        variant="primary"
                        disabled={Number(p.stock) < 1}
                        onClick={() => addToCart(p)}
                      >
                        Thêm vào giỏ
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {!loading && products.length === 0 && (
          <div className="empty-state">
            Không tìm thấy sản phẩm phù hợp.
          </div>
        )}
      </Container>

      <footer>
        <Container className="d-flex flex-column flex-md-row justify-content-between gap-2">
          <span className="footer-brand">
            TechStore<span>®</span>
          </span>

          <span>Đồ án học tập · NestJS + React + MySQL</span>

          <span>© 2026 TechStore</span>
        </Container>
      </footer>

      {/* Modal đăng nhập và đăng ký */}
      <Modal
        show={showAuth}
        onHide={() => setShowAuth(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {authMode === 'login'
              ? 'Đăng nhập TechStore'
              : 'Tạo tài khoản'}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={submitAuth}>
          <Modal.Body>
            {authMode === 'register' && (
              <Form.Group className="mb-3">
                <Form.Label>Họ và tên</Form.Label>

                <Form.Control
                  required
                  value={auth.fullName}
                  onChange={e =>
                    setAuth({ ...auth, fullName: e.target.value })
                  }
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>

              <Form.Control
                required
                type="email"
                value={auth.email}
                onChange={e =>
                  setAuth({ ...auth, email: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Mật khẩu</Form.Label>

              <Form.Control
                required
                minLength={6}
                type="password"
                value={auth.password}
                onChange={e =>
                  setAuth({ ...auth, password: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer className="justify-content-between">
            <Button
              variant="link"
              type="button"
              onClick={() =>
                setAuthMode(
                  authMode === 'login' ? 'register' : 'login'
                )
              }
            >
              {authMode === 'login'
                ? 'Chưa có tài khoản? Đăng ký'
                : 'Đã có tài khoản? Đăng nhập'}
            </Button>

            <Button type="submit" variant="primary">
              {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
            {/* Modal giỏ hàng */}
      <Modal
        show={showCart}
        onHide={() => setShowCart(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Giỏ hàng ({cartCount})</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {cart.length === 0 ? (
            <p>Giỏ hàng đang trống.</p>
          ) : (
            <>
              {cart.map(item => (
                <div className="cart-row" key={item.id}>
                  <img
                    src={
                      item.imageUrl ||
                      CATEGORY_IMAGES[item.category] ||
                      FALLBACK_IMAGE
                    }
                    alt={item.name}
                    onError={e =>
                      handleProductImageError(e, item.category)
                    }
                  />

                  <div className="cart-product">
                    <strong>{item.name}</strong>
                    <span>{money(item.price)}</span>
                  </div>

                  <Form.Control
                    aria-label={`Số lượng ${item.name}`}
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={e =>
                      updateQuantity(item.id, e.target.value)
                    }
                    className="quantity-input"
                  />

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Xóa
                  </Button>
                </div>
              ))}

              <Form.Group className="mt-3">
                <Form.Label>Địa chỉ giao hàng</Form.Label>

                <Form.Control
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường/xã, tỉnh/thành"
                />
              </Form.Group>

              <div className="cart-total">
                <span>Tổng cộng</span>
                <strong>{money(total)}</strong>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCart(false)}
          >
            Tiếp tục mua sắm
          </Button>

          <Button
            variant="primary"
            disabled={!cart.length}
            onClick={checkout}
          >
            Đặt hàng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal lịch sử đơn hàng */}
      <Modal
        show={showOrders}
        onHide={() => setShowOrders(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Lịch sử đơn hàng</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {orders.length === 0 ? (
            <p>Bạn chưa có đơn hàng nào.</p>
          ) : (
            orders.map(o => (
              <div className="order-card" key={o.id}>
                <div className="d-flex justify-content-between">
                  <strong>Đơn hàng #{o.id}</strong>

                  <Badge
                    bg={
                      o.status === 'completed'
                        ? 'success'
                        : 'primary'
                    }
                  >
                    {o.status}
                  </Badge>
                </div>

                <small>
                  {new Date(o.createdAt).toLocaleString('vi-VN')}
                </small>

                <div>{o.shippingAddress}</div>

                <div className="d-flex justify-content-between mt-2">
                  <span>
                    {o.items?.length || 0} dòng sản phẩm
                  </span>

                  <strong>{money(o.total)}</strong>
                </div>
              </div>
            ))
          )}
        </Modal.Body>
      </Modal>
            {/* Modal quản trị sản phẩm */}
      <Modal
        show={showAdmin}
        onHide={() => setShowAdmin(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm sản phẩm (Admin)</Modal.Title>
        </Modal.Header>

        <Form onSubmit={createProduct}>
          <Modal.Body>
            {[
              'name',
              'description',
              'category',
              'price',
              'stock',
              'imageUrl'
            ].map(field => (
              <Form.Group className="mb-2" key={field}>
                <Form.Label>
                  {{
                    name: 'Tên sản phẩm',
                    description: 'Mô tả',
                    category: 'Danh mục',
                    price: 'Giá (VND)',
                    stock: 'Tồn kho',
                    imageUrl: 'URL hình ảnh'
                  }[field]}
                </Form.Label>

                <Form.Control
                  required={[
                    'name',
                    'category',
                    'price',
                    'stock'
                  ].includes(field)}
                  type={
                    ['price', 'stock'].includes(field)
                      ? 'number'
                      : 'text'
                  }
                  min={
                    ['price', 'stock'].includes(field)
                      ? 0
                      : undefined
                  }
                  value={draft[field]}
                  onChange={e =>
                    setDraft({
                      ...draft,
                      [field]: e.target.value
                    })
                  }
                />
              </Form.Group>
            ))}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              type="button"
              onClick={() => setShowAdmin(false)}
            >
              Hủy
            </Button>

            <Button type="submit">Lưu sản phẩm</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {error && (
        <div
          className={`techstore-toast ${messageType}`}
          role="status"
          aria-live="polite"
        >
          <span className="toast-status-icon" aria-hidden="true">
            {messageType === 'success' ? '✓' : messageType === 'danger' ? '!' : 'i'}
          </span>

          <span className="toast-message">{error}</span>

          <button
            type="button"
            className="toast-close"
            aria-label="Đóng thông báo"
            onClick={() => setError('')}
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        .techstore-toast {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 2000;
          display: flex;
          align-items: center;
          gap: 11px;
          width: max-content;
          max-width: min(430px, calc(100vw - 32px));
          padding: 14px 15px;
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 14px;
          color: #fff;
          background: #166534;
          box-shadow: 0 14px 38px rgba(15,23,42,.24);
          animation: techstore-toast-in .24s ease-out;
        }

        .techstore-toast.warning {
          background: #92400e;
        }

        .techstore-toast.danger {
          background: #991b1b;
        }

        .toast-status-icon {
          display: grid;
          place-items: center;
          flex: 0 0 27px;
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: rgba(255,255,255,.18);
          font-weight: 800;
        }

        .toast-message {
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .toast-close {
          margin-left: 4px;
          padding: 0 2px;
          border: 0;
          color: #fff;
          background: transparent;
          font-size: 24px;
          line-height: 1;
          opacity: .8;
          cursor: pointer;
        }

        .toast-close:hover {
          opacity: 1;
        }

        @keyframes techstore-toast-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .product-image-wrap img {
          object-fit: contain;
        }

        @media (max-width: 576px) {
          .techstore-toast {
            right: 12px;
            bottom: 12px;
          }
        }
      `}</style>
    </div>
  );
}