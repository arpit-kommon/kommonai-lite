import React, { useState } from 'react';
import '../style/Language.css'; // Adjust the path as necessary
import logo2 from "../assets/kommonschoollogo.png";
import { Link } from 'react-router-dom';


const Language = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hindi = () => {
    localStorage.setItem('language', 'hindi');
  };

  const english = () => {
    localStorage.setItem('language', 'english')
  };

  return (
    <section className="modal main2">
    <div class="main-container">

<div class="content1">
        {/* <div class="content1-img">
            <img src={logo2} />
        </div> */}
        <h3 class="line1">HELLO, I AM</h3>
        <h1>KOMMON AI</h1>
        <h3 class="line3 ">Choose your preferred language
</h3>
        <div class="btn2">
            <Link to="/audio-speaker"  onClick={hindi}> HINDI</Link>
            <Link  to="/audio-speaker" onClick={english}> ENGLISH</Link>
     
        </div>
    </div>

      </div>
    </section>
  );
};

export default Language;
