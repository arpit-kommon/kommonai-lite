import React from 'react'
import '../style/Home.css'
import { Link } from 'react-router-dom'
import logo2 from "../assets/kommonschoollogo.png";

export default function Home() {
    return (
      <>
    <div class="main">

<div class="container1">
 <div class="content-img">
            <img src={logo2} />
        </div>
    <div class="content">
       
        <h3 class="line1">HELLO, I AM</h3>
        <h1>KOMMON AI</h1>
        <h3 class="line2 ">YOUR SPEECH EVALUATOR</h3>
        <div class="btn">
            <Link to="login"> START EXPERIENCE</Link>

        </div>
    </div>
</div>
</div>     
 </>
    )
  }
  