
import { useState } from 'react';

const API_URL = 'https://batloung-1.onrender.com/api';

function Login({ onLogin }) {
  const [role, setRole] = useState('Admin');
  const [isRegistering, setIsRegistering] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            password,
            full_name: fullName.trim(),
            phone,
            email,
            address
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed.');
        }

        setSuccess('Account created successfully! You can now log in.');

        setIsRegistering(false);
        setRole('Customer');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setPhone('');
        setEmail('');
        setAddress('');

      } else {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed.');
        }

        if (data.user.role !== role) {
          throw new Error(
            `This account is not a ${role} account.`
          );
        }

        onLogin(data.token, data.user);
      }

    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot reach the server. Make sure the backend is running.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-brand">
          <span className="login-logo">BF</span>
          <h1>BF Distribution System</h1>
          <p>Fresh Produce Management</p>
        </div>

        {!isRegistering && (
          <div className="login-tabs">
            {['Admin', 'Staff', 'Customer'].map(r => (
              <button
                key={r}
                type="button"
                className={`login-tab ${role === r ? 'active' : ''}`}
                onClick={() => {
                  setRole(r);
                  setError('');
                  setSuccess('');
                }}
              >
                {r} Login
              </button>
            ))}
          </div>
        )}

        <h2>
          {isRegistering ? 'Create Customer Account' : `${role} Login`}
        </h2>

        <form onSubmit={handleSubmit}>

          {isRegistering && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Enter your address"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
                required
              />
            </div>
          )}

          {error && <div className="login-error">{error}</div>}

          {success && <div className="login-success">{success}</div>}

          <button
            type="submit"
            className="save-button login-submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isRegistering
              ? 'Create Account'
              : `Sign in as ${role}`}
          </button>

        </form>

        {role === 'Customer' && !isRegistering && (
          <p className="login-note">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setError('');
                setSuccess('');
              }}
            >
              Create Account
            </button>
          </p>
        )}

        {isRegistering && (
          <p className="login-note">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setError('');
                setSuccess('');
              }}
            >
              Back to Login
            </button>
          </p>
        )}

      </div>
    </div>
  );
}

export default Login;
