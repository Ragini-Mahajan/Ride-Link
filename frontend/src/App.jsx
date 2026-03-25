import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

const navItems = [
  ['/', 'Home'],
  ['/schedule', 'Schedule'],
  ['/routes', 'Routes'],
  ['/about', 'About'],
  ['/dashboard', 'Dashboard'],
  ['/login', 'Login'],
  ['/register', 'Register']
];

const Page = ({ title, text }) => (
  <div className="container">
    <h1>{title}</h1>
    <p>{text}</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <nav>
        {navItems.map(([path, text]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => (isActive ? 'active' : '')}
            style={{ marginRight: '0.75rem' }}
          >
            {text}
          </NavLink>
        ))}
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Page title="RideLink Home" text="Welcome to RideLink React UI." />} />
          <Route path="/schedule" element={<Page title="Schedule" text="Browse scheduled rides." />} />
          <Route path="/routes" element={<Page title="Routes" text="View route map and stops." />} />
          <Route path="/about" element={<Page title="About" text="About RideLink service." />} />
          <Route path="/dashboard" element={<Page title="Dashboard" text="User dashboard." />} />
          <Route path="/login" element={<Page title="Login" text="Sign in to RideLink." />} />
          <Route path="/register" element={<Page title="Register" text="Create your RideLink account." />} />
          <Route path="/search-results" element={<Page title="Search Results" text="Results for ride search." />} />
          <Route path="/booking" element={<Page title="Booking" text="Book a ride." />} />
          <Route path="/ticket" element={<Page title="Ticket" text="Your ticket details." />} />
          <Route path="*" element={<Page title="404" text="Page not found." />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
