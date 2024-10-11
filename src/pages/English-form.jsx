import React, { useState, useEffect } from 'react';
import '../style/Login.css';
import logo4 from "../assets/kommonailogo.png";
import { useNavigate } from 'react-router-dom';

const English_Form = () => {
    const [companyName, setCompanyName] = useState('');
    const [jobRole, setJobRole] = useState('');
    // const [timeDuration, setTimeDuration] = useState('');
    // const [Language, setLanguage] = useState(''); 
    const [noOfQuestions, setNoOfQuestions] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // State to hold the user's name
    const [userName, setUserName] = useState('');

    useEffect(() => {
        // Retrieve the user's name from local storage
        const storedName = localStorage.getItem('firstName'); // Adjust the key based on your implementation
        if (storedName) {
            setUserName(storedName);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!companyName || !jobRole || !noOfQuestions) {
            setErrorMessage('All fields are required.');
            return;
        }
        localStorage.setItem('language', 'english');
        // Redirect to the main page with necessary data for the NPC
        navigate('/audio-speaker', {
            state: {
                characterId: 'e74f718e-7297-11ef-ac55-42010a7be011',
                companyName,
                jobRole,
                // timeDuration,
                noOfQuestions,
                userName,
                Language: 'english',
            }
        });
    };

    return (
        <div className="loginimg">
            <div className="form">
                <div className="container1">
                    <div className="my-form">
                        <img src={logo4} alt="Logo" />
                        <div className="form-title">
                            {userName && <h2>Hi, {userName}!</h2>} {/* Display user's name if available */}
                        </div>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <form onSubmit={handleSubmit}>
                            <div className="single-input">
                                <span>
                                    <i className="fa-solid fa-building"></i>
                                </span>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Company Name"
                                    required
                                />
                            </div>
                            <div className="single-input">
                                <span>
                                    <i className="fa-solid fa-user"></i>
                                </span>
                                <input
                                    type="text"
                                    value={jobRole}
                                    onChange={(e) => setJobRole(e.target.value)}
                                    placeholder="Job Role"
                                    required
                                />
                            </div>
                            {/* <div className="single-input">
                                <span>
                                    <i className="fa-regular fa-clock"></i>
                                </span>
                                <select
                                    className="gender-select"
                                    value={timeDuration}
                                    onChange={(e) => setTimeDuration(e.target.value)}
                                    required
                                >
                                    <option value="">Time Duration</option>
                                    <option value="5 Min">5 Min</option>
                                    <option value="10 Min">10 Min</option>
                                    <option value="15 Min">15 Min</option>
                                    <option value="20 Min">20 Min</option>
                                </select>
                                <i className="fa-solid fa-chevron-down arrow-icon"></i>
                            </div> */}

                            <div className="single-input">
                                <span>
                                    <i className="fa-solid fa-circle-question"></i>
                                </span>
                                <select
                                    className="gender-select"
                                    value={noOfQuestions}
                                    onChange={(e) => setNoOfQuestions(e.target.value)}
                                    required
                                >
                                    <option value="">No. of Questions</option>
                                    <option value="5 Questions">5 Questions</option>
                                    <option value="10 Questions">10 Questions</option>
                                    <option value="15 Questions">15 Questions</option>
                                    <option value="20 Questions">20 Questions</option>
                                </select>
                                <i className="fa-solid fa-chevron-down arrow-icon"></i> {/* Arrow icon */}
                            </div>

                            <div className="single-input submit-btn">
                                <input type="submit" value="START SESSION" />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default English_Form;
