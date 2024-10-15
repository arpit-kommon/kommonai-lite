import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/Login.css'; // Assuming you have CSS for styling
import logo4 from "../assets/kommonschoollogo.png";
import { toast } from 'react-toastify';

const Register = () => {
  const [firstName, setFirstName] = useState(''); // State for first name
  const [lastName, setLastName] = useState(''); // State for last name
  const [email, setEmail] = useState(''); // State for email
  const [password, setPassword] = useState(''); // State for password
  const [confirmPassword, setConfirmPassword] = useState(''); // State for confirm password
  const [passwordMatch, setPasswordMatch] = useState(true); // State for checking if passwords match
  const [userName, setUserName] = useState(''); // State for storing user name

  const navigate = useNavigate(); // For programmatic navigation

  // Check if passwords match
  useEffect(() => {
    setPasswordMatch(password === confirmPassword || confirmPassword === '');
  }, [password, confirmPassword]);

  // Retrieve the user's name from local storage
  useEffect(() => {
    const storedFirstName = localStorage.getItem('userName'); // Adjust the key based on your implementation
    if (storedFirstName) {
      setUserName(storedFirstName);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordMatch) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('https://api.kommonschool.com/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (response.ok) {
        const res_data = await response.json();
         // Store first name for displaying later
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        navigate('/login'); // Redirect to login page after successful registration
        toast.success("Registration Successfully");
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration failed', err.message);
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className='loginimg'>
      <div className="form">
        <div className="container1">
          <div className="my-form">
            <img src={logo4} alt="Logo" />
            <div className="form-title">
              <h1>REGISTER</h1>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="single-input">
                <span>
                  <i className="fa-solid fa-user"></i>
                </span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  required
                />
              </div>
              <div className="single-input">
                <span>
                  <i className="fa-solid fa-user"></i>
                </span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  required
                />
              </div>
              <div className="single-input">
                <span>
                  <i className="fa-solid fa-envelope"></i>
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
              <div className="single-input">
                <span>
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                />
              </div>
              {!passwordMatch && (
                <p style={{ color: 'red' }}>Passwords do not match</p>
              )}
              <div className="single-input submit-btn">
                <input type="submit" value="SIGN UP" />
              </div>
            </form>
            <p>Already have an account?</p>
            <h5>
              <Link to="/login">Sign in</Link>
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
