import React, { useState } from 'react';
import '../style/Login.css';
import logo4 from "../assets/kommonschoollogo.png";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State to handle errors
  const navigate = useNavigate(); // Use navigate for redirection

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error messages

    try {
      // Admin credentials check (move this to a secure server-side check if possible)
      if (email === 'admin@gmail.com' && password === '12345') {
        // Redirect to admin page if credentials are admin credentials
        navigate('/laguage'); // Use React Router's navigate function
        return;
      }

      // Normal user login request
      const response = await fetch('https://api.kommonschool.com/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      console.log(response)
      if (response.ok) {
        const res_data = await response.json();
        console.log(res_data.user.firstName);
        localStorage.setItem('token', res_data.token); // Store token in localStorage
        localStorage.setItem('firstName', res_data.user.firstName);
        localStorage.setItem('lastName', res_data.user.lastName);
        localStorage.setItem('userId', res_data.user._id);
        console.log('userId: ',res_data.user._id)
        setEmail('');
        setPassword('');
        navigate('/laguage'); // Redirect to home page after successful login
        toast.success("Login succesfully");

      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login failed', err.message);
      toast.error('An error occurred while logging in. Please try again later.');
    }
  };

  return (
    <div className="loginimg">
      <div className="form">
        <div className="container1">
          <div className="my-form">
            <img src={logo4} alt="Logo" />
            <div className="form-title">
              <h1>LOGIN</h1>
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error */}
            <form onSubmit={handleSubmit}>
              <div className="single-input">
                <span>
                  <i className="fa-solid fa-user"></i>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
              </div>
              <div className="single-input">
                <span>
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
              <div className="single-input submit-btn">
                <input type="submit" value="SIGN IN" />
              </div>
            </form>
            <p>Don't have an account?</p>
            <h5>
              <Link to="/register">Sign up</Link>
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
