import '../index.css';
import React, { useState, useEffect, useRef } from "react";
import logo1 from "../assets/Kommon ai.png";
import logo2 from "../assets/kommonschoollogo.png";
import btnimg from "../assets/switch.png";
import logo3 from "../assets/conversation-assessment.png";
import logo5 from "../assets/download.png";
import asserp from '../assets/assessment-report.pdf'
import { Link } from 'react-router-dom';
import axios from "axios";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import frstImg from '../images/Assessment Report_page-0001.png'
import lstImg from '../images/Assessment Report_page-0007.jpg'
import basicDs from '../images/basic details1.png'
import transcriptss from '../images/transcript.png'
import speechs from '../images/Speech.png'
import contDPerameters from '../images/contDPerameter.png'
import perameters from '../images/perameter.png'
import languages from '../images/language.png'
import tipss from '../images/tips.png'
import notoSansDevanagariBase64 from '../fonts/noto-regular';
import poppins from '../fonts/base';
import logo4 from "../assets/kommonschoollogo.png";
import { toast } from 'react-toastify';



// import { useLocation } from 'react-router-dom';
// import {components, pipelines, MediaStream} from 'media-stream-library';

//==========================================================================
// const location = useLocation();
// const { Language } = location.state;
const Language = localStorage.getItem('language');

// Encode to WAV format
const encodeWAV = (samples, sampleRate) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 2, true); // Stereo (2 channels)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 4, true); // Byte rate (sampleRate * 2 channels * 16 bits)
  view.setUint16(32, 4, true); // Block align (2 channels * 16 bits)
  view.setUint16(34, 16, true); // Bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write interleaved samples to PCM data
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return view;
};

// Helper function to write a string to DataView
const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const Audiospeaker = (props) => {
  const { userText, npcText, keyPressed } = props;
  const [feedback, setFeedback] = useState(0);
  const [showTopButton, setShowTopButton] = useState(false); // Initially hide the top button
  const [firstConversation, setFirstConversation] = useState(false); // Track if the user had the first conversation
  const [isHoldingButton, setIsHoldingButton] = useState(false); // Track if the button is being held
  const [conversationEnded, setConversationEnded] = useState(false); // Track if the conversation has ended
  const [status, setStatus] = useState(''); // Track status of assessment process
  const [isRecording, setIsRecording] = useState(false);
  const [animation, setAnimation] = useState(false);
  const [download, setDownload] = useState(false);
  const [btn, setbtn] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [audioTopic, setAudioTopic] = useState("interview"); // New state for the audio topic
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const [assessmentData, setAssessmentData] = useState(null); // Changed to null since the data is an object
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Loading should be false initially
  const [loader, setLoader] = useState(false); // Loading should be false initially

  const [showIntro, setShowIntro] = useState(true);
  const [spAsseStat, setSpAsseStat] = useState(null); // New state for assessment status
  const [simulationIdd, setSimulationIdd] = useState(null); // Track simulationId
  const [userIdd, setUserId] = useState(null); // Track 
  const [recordingStartTime, setRecordingStartTime] = useState(null);


  useEffect(() => {
    // Retrieve the user's name from local storage
    const id = localStorage.getItem('userId'); // Adjust the key based on your implementation
    if (id) {
      setUserId(id);
    }
  }, []);
  // Detect keydown and keyup events for "T" key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 't' || e.key === 'T') {
        setShowTopButton(false); // Hide the top button when "T" is held down
        handleStartSpeaking(); // Start speaking when "T" is pressed
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 't' || e.key === 'T') {
        setShowTopButton(true); // Show the top button when "T" is released and after first conversation
        handleStopSpeaking(); // Stop speaking when "T" is released
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [firstConversation]);

  // Monitor if the first conversation happens
  useEffect(() => {
    if (userText !== '') {
      setFirstConversation(true); // Set this flag to true after the first conversation
    }
  }, [userText]);

  // Handle speaking start (common for both "T" key and button press)
  const handleStartSpeaking = () => {
    console.log('Start speaking'); // You can replace this with the actual speaking functionality
  };

  // Handle speaking stop (common for both "T" key and button release)
  const handleStopSpeaking = () => {
    console.log('Stop speaking'); // You can replace this with the actual stop speaking functionality
  };

  // Handle button press and release for "PRESS 'T' OR HOLD TO SPEAK"
  const handleButtonMouseDown = () => {
    setIsHoldingButton(true);
    handleStartSpeaking();
  };

  const handleButtonMouseUp = () => {
    setIsHoldingButton(false);
    handleStopSpeaking();
  };

  const handleEndConversation = () => {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - recordingStartTime) / 1000; // Convert to seconds

    if (elapsedTime < 60) {
      toast.error("Please continue speaking for at least 1 more minute.");
    } else {
      setConversationEnded(true); // Hide buttons and show message
      setStatus('inProgress');
      stopRecording(); // Stop the audio recording
      setLoader(true);
      setIsRecording(false); // End the recording session
      setBtn(true); // Set the button state
    }
  };

  // Handle restart practice
  const handleRestartPractice = () => {
    setConversationEnded(false); // Reset the conversationEnded flag
    setStatus(''); // Reset the status
    window.location.reload(); // Reload the page to reset the state (optional)
  };

  // API upload function
  const uploadToAPI = async (blob) => {
    const formData = new FormData();
    formData.append("audio", blob, "combined-audio-recording.wav");
    formData.append("topic", audioTopic);
    formData.append("language", Language);

    setIsUploading(true);

    try {
      const response = await axios.post("https://api.kommonschool.com/api/v1/speaker/audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          userId: userIdd,
        },
      });
      console.log(response.data.success.data.simulationId);
      if (response.status === 200) {
        const simulationId = response.data.success.data.simulationId;
        console.log(simulationId);
        // console.log(response.data.simulationId);
        setSimulationIdd(simulationId); // Save simulationId in state
        // alert(`Audio uploaded successfully with topic: ${audioTopic}`);
        console.log(`Audio uploaded successfully with topic: ${audioTopic}`);
      } else {
        alert("Failed to upload audio");
      }
    } catch (error) {
      console.error("API upload failed:", error);
      alert("An error occurred while uploading the audio");
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch speaker assessment function
  const fetchSpeakerAssessment = async () => {
    if (!simulationIdd) {
      console.log("Simulation ID is not available.");
      return;
    }

    setLoading(true); // Set loading to true when fetching data
    try {
      const response = await axios.post(
        "https://api.kommonschool.com/api/v1/speaker/assessments",
        {},
        {
          headers: {
            userId: userIdd, // Replace with the actual user ID if different
            simulationId: simulationIdd, // Use the simulationId from the first response
          },
        }
      );

      console.log("API Response:", response.data.success.data);
      const status = response.data.success.data.spAsseStat;
      const data = response.data.success.data;
      setSpAsseStat(status); // Set the assessment status (PENDING: 0, IN_PROGRESS: 1, ENDED: 2)
      setAssessmentData(data); // Set the assessment data
      if (status === 2) {
        setLoader(false);
      }
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false); // Stop loading

    }
  };

  useEffect(() => {
    if (simulationIdd) {
      fetchSpeakerAssessment();
    }
  }, [simulationIdd]);

  // Automatically fetch assessment after simulationId is set and poll for updates
  useEffect(() => {
    let pollingInterval;

    if (simulationIdd) {
      // Poll every 5 seconds until assessment status is "ENDED" (spAsseStat === 2)
      pollingInterval = setInterval(async () => {
        await fetchSpeakerAssessment();

        if (spAsseStat === 2) {
          // clearInterval(pollingInterval); // Stop polling when assessment is complete
        }
      }, 10000); // Poll every 5 seconds
    }

    return () => clearInterval(pollingInterval); // Clean up the interval on component unmount
  }, [simulationIdd, spAsseStat]);

  // Function to get the status message based on spAsseStat
  const getStatusMessage = () => {
    switch (spAsseStat) {
      case 0:
        return 'Assessment Pending...';
      case 1:
        return 'Assessment In Progress...';
      case 2:
        return 'Download Assessment';
      default:
        return 'Fetching Assessment...';
    }
  };

  useEffect(() => {
    if (simulationIdd) {
      console.log(getStatusMessage()); // Display the status message
    }
  }, [simulationIdd, spAsseStat]); // Re-run whenever simulationIdd or spAsseStat changes


  // ================================================

  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');

  const downloadPDF = () => {
    if (!assessmentData) return;

    const doc = new jsPDF();
    const myFont = notoSansDevanagariBase64; // your base64 string here

    // Add font to the PDF
    doc.addFileToVFS('NotoSansDevanagari.ttf', myFont);
    doc.addFont('NotoSansDevanagari.ttf', 'NotoSansDevanagari', 'normal');
    doc.setFont('NotoSansDevanagari');

    //===================================================================================
    const popp = poppins; // Your base64 string for the Poppins font

    // Add the Poppins font to the PDF
    doc.addFileToVFS('Poppins.ttf', popp);
    doc.addFont('Poppins.ttf', 'Poppins', 'normal');

    // Set Poppins font for the document
    doc.setFont('Poppins');
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let cursorY = 20; // Start position for Y axis
    const margin = 21; // Adjust margin as needed

    doc.setFont('Poppins', 'normal');

    // ** Load Images (Base64 or URL) **
    const firstImageBase64 = frstImg;
    const secondImageBase64 = lstImg;
    const basicD = basicDs;
    const transcripts = transcriptss;
    const speech = speechs;
    const contDPerameter = contDPerameters;
    const perameter = perameters;
    const language = languages;
    const tips = tipss;

    // Calculate words per minute (assuming wordCount and speechDurationMinutes are available)
    const wordsPerMin = (assessmentData.transcriptWordCount || 0) / (assessmentData.speechDurationMinutes || 1);

    // First image on the first page (no footer on the first page)
    doc.addImage(firstImageBase64, 'PNG', 0, 0, pageWidth, pageHeight);

    // Move to second page for content and start footer/page numbers from here
    doc.addPage();
    cursorY = 10;

    // Add first image and spacing
    doc.addImage(basicD, 'PNG', 17, cursorY, 70, 30);
    cursorY += 30 + 8;

 // Get the timestamp
      const currentDateTime = assessmentData.recordedAt; // Get the timestamp

    // Convert the timestamp to a Date object to get date and time strings
    const date = new Date(currentDateTime).toLocaleDateString('en-IN'); // Get the current date
    const time = new Date(currentDateTime).toLocaleTimeString('en-IN');
    
    doc.autoTable({
      body: [
        ['Assessed Individual Name', `${firstName} ${lastName}`],
        ['Date & Time', `${date} | ${time}`],
      ],
      startY: cursorY,
      margin: { left: margin, right: margin }, // Add margins
      theme: 'grid',
      styles: {
        fontSize: 11,
        halign: 'justify',
        lineWidth: 0.1, // Border width
        valign: 'middle', // Center vertical alignment in table body cells
        // fontStyle: 'PoppinsRegular'
      },
      columnStyles: {
        0: { cellWidth: 50 }, // Equal width for the first column
        1: { cellWidth: 'auto' }, // Equal width for the second column
      },
      tableWidth: 'auto', // Adjust to fit the content
    });

    cursorY = doc.lastAutoTable.finalY + 10;

    doc.addImage(transcripts, 'PNG', 13, cursorY, 130, 30);
    cursorY += 30 + 1;


    // const transcript = assessmentData.content || 'No transcript available';
    const transcriptText = assessmentData.content;
    const wordCount = transcriptText.trim().split(/\s+/).length;

    // Determine font size based on word count
    let fontS = 11; // Default font size
    if (wordCount > 800) {
      fontS = 7;
    } else if (wordCount > 550) {
      fontS = 7;
    } else if (wordCount > 480) {
      fontS = 8;
    } else if (wordCount > 400) {
      fontS = 9;
    } else if (wordCount > 300) {
      fontS = 10;
    } else {
      fontS = 11;
    }

    function isHindi(text) {
      // Check if the text contains any Devanagari characters (Unicode range: \u0900 - \u097F)
      return /[\u0900-\u097F]/.test(text);
    }

    const transcript = [[transcriptText]];
    const isTextInHindi = isHindi(transcriptText); // Check if the transcript is in Hindi
    const selectedFont = isTextInHindi ? 'NotoSansDevanagari' : 'Poppins';

    doc.autoTable({
      body: transcript,
      startY: cursorY + 10, // Add space above table
      margin: { left: margin, right: margin }, // Add margins
      theme: 'grid',
      styles: {
        font: selectedFont,
        fontSize: fontS, // Set the font size based on word count
        halign: 'justify',
        lineWidth: 0,
        valign: 'middle',
        cellPadding: { top: 0, bottom: 0, left: 0, right: 0 },
        fontStyle: 'normal'
      },
    });

    // ** Start Parameters Section on a New Page **
    doc.addPage();
    cursorY = 10;
    doc.addImage(perameter, 'PNG', 15, cursorY, 130, 30);
    cursorY += 30 + 1;

    const tableData3 = [
      ['Reasoning', Math.round(assessmentData.accScore) + "%", assessmentData.reasoningImp.trim()],
      ['Creativity', Math.round(assessmentData.conScore) + "%", assessmentData.creativityImp.trim()],
      ['Clarity', Math.round(assessmentData.fluScore) + "%", assessmentData.clarityImp.trim()],
      ['Structure', Math.round(assessmentData.fluScore) + "%", assessmentData.structureImp.trim()],
      ['Emotion', Math.round(assessmentData.emotionScore) + "%", assessmentData.emotionImp.trim()],
    ];

    doc.autoTable({
      head: [['Factor(s)', 'Score', 'Feedback']],
      body: tableData3,
      startY: cursorY + 10, // Add space above table
      margin: { left: margin, right: margin }, // Add margins
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255], // White background
        textColor: [0, 0, 0], // Black text color
        fontStyle: 'poppins', // Bold text
        halign: 'left', // Left alignment for header text
        valign: 'middle',
        lineWidth: 0.1, // Border width
        lineColor: [0, 0, 0], // Black border color
      },
      styles: {
        fontSize: 11,
        halign: 'justify',
        lineWidth: 0.1, // Center alignment for table body cells
        valign: 'middle', // Center vertical alignment in table body cells
        cellPadding: { top: 7, bottom: 7, left: 4, right: 4 },
      },
    });

    cursorY = doc.lastAutoTable.finalY + 20; // Add space below table

    // ** Start Speech Section on a New Page **
    doc.addPage();
    cursorY = 10;
    doc.addImage(speech, 'PNG', 17, cursorY, 100, 30);
    cursorY += 30 + 1;

    const wordCounts = assessmentData.misProns.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    const misPronTableData = Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a) // Sort by count in descending order
      .slice(0, 5) // Take top 5 entries
      .map(([word, count]) => `${word} - ${count}x`)
      .join('\n');


    const fillerWordCounts = assessmentData.fillers.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    const fillerWordTableData = Object.entries(fillerWordCounts)
      .map(([word, count]) => `${word} - ${count}x`)
      .join('\n');

    const vocabWordsCounts = assessmentData.vocabWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    const vocabWordsTableData = Object.entries(vocabWordsCounts)
      .map(([word, count]) => ` ${word} - ${count}x`)
      .join('\n');

    const totalFillerWords = assessmentData.fillers.length;

    const tableData2 = [
      [{ content: 'Pronunciation', rowSpan: 2 }, 'Pronunciation Score', '100%', Math.round(assessmentData.pronScore) + '%'],
      ['Mispronounced Words List + Count', 'NA', misPronTableData],
      [{ content: 'Filler Words Analysis', rowSpan: 2 }, 'Average Filler Words Per Minute', '2 Filler Words', ` ${totalFillerWords} Total filler words`],
      ['Filler Words List + Count', 'NA', fillerWordTableData],
      [{ content: 'Speech Fluency Metrics', rowSpan: 3 }, 'Accuracy Score', '100%', assessmentData.accScore + '%'],
      ['Confidence Score', '100%', Math.round(assessmentData.conScore) + "%"],
      ['Fluency Score', '100%', Math.round(assessmentData.fluScore) + "%"],
      [{ content: 'Speech Tempo', rowSpan: 2 }, 'Speaking Rate', '150 Words Per Min', Math.round(assessmentData.wordsPerMin)],
      ['Sentiment Analysis', 'Neutral / Positive', 'Positive'],
    ];

    doc.autoTable({
      head: [['Factor(s)', 'Parameter(s)', 'Ideal #', 'Your Analysis cum Score']],
      body: tableData2,
      startY: cursorY + 10, // Add space above table
      margin: { left: margin, right: margin }, // Add margins
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255], // White background
        textColor: [0, 0, 0], // Black text color
        fontStyle: 'bold', // Bold text
        halign: 'left', // Center alignment for header text
        valign: 'middle',
        lineWidth: 0.1, // Border width
        lineColor: [0, 0, 0], // Black border color
      },
      styles: {
        fontSize: 11,
        halign: 'left',
        font: selectedFont,
        lineWidth: 0.1, // Center alignment for table body cells
        valign: 'middle', // Center vertical alignment in table body cells
        cellPadding: { top: 7, bottom: 7, left: 4, right: 4 },
      },
    });

    cursorY = doc.lastAutoTable.finalY + 20; // Add space below table

    // ** Start Language Section on a New Page **
    doc.addPage();
    cursorY = 10;
    doc.addImage(language, 'PNG', 15, cursorY, 110, 30);
    cursorY += 30 + 1;

    const tableData4 = [
      [{ content: 'Vocabulary Analysis', rowSpan: 4 }, 'Vocabulary Score', Math.round(assessmentData.vocabScore) + '%'],
      ['Most Used Words List', ` ${vocabWordsTableData}`],
      ['Vocabulary Score Reasoning', ` ${assessmentData.vocabRes.trim()}`],
      ['Vocabulary Score Improvement Feedback', assessmentData.vocabImp.trim()],
      [{ content: 'Contextual Relevance', rowSpan: 3 }, 'Context Score', Math.round(assessmentData.ctxScore) + '%'],
      ['Context Score Reasoning', assessmentData.ctxRes.trim()],
      ['Context Score Improvement Feedback', assessmentData.ctxImp.trim()],
    ];

    doc.autoTable({
      head: [['Factor(s)', 'Parameter(s)', 'Score cum Analysis']],
      body: tableData4,
      startY: cursorY + 10, // Add space above table
      margin: { left: margin, right: margin }, // Add margins
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255], // White background
        textColor: [0, 0, 0], // Black text color
        fontStyle: 'bold', // Bold text
        halign: 'left', // Left alignment for header text
        valign: 'middle',
        lineWidth: 0.1, // Border width
        lineColor: [0, 0, 0], // Black border color
      },
      styles: {
        fontSize: 11,
        halign: 'justify',
        font: selectedFont,
        lineWidth: 0.1, // Center alignment for table body cells
        valign: 'middle', // Center vertical alignment in table body cells
        cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
        // theme: 'grid',
        // lineWidth: 0.1,
      },
    });

    cursorY = doc.lastAutoTable.finalY + 20; // Add space below table

    // ** Start Continuous Development Parameter Section on a New Page **
    doc.addPage();
    cursorY = 10;
    doc.addImage(contDPerameter, 'PNG', 15, cursorY, 120, 30);
    cursorY += 30 + 1;

    const tableData5 = [
      [{ content: 'Grammar Analysis', rowSpan: 3 }, 'Grammar Score', Math.round(assessmentData.gramScore) + '%'],
      ['Grammar Score Reasoning', `${assessmentData.gRes.trim()}`],
      ['Grammar Score Improvement Feedback', assessmentData.gImp.trim()],
    ];

    doc.autoTable({
      head: [['Factor(s)', 'Parameter(s)', 'Score cum Analysis']],
      body: tableData5,
      startY: cursorY + 10, // Add space above table
      margin: { left: margin, right: margin }, // Add margins
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255], // White background
        textColor: [0, 0, 0], // Black text color
        fontStyle: 'bold', // Bold text
        halign: 'left', // Left alignment for header text
        valign: 'middle', // Center vertical alignment for header text
        lineWidth: 0.1, // Border width
        lineColor: [0, 0, 0], // Black border color
      },
      styles: {
        fontSize: 11,
        halign: 'justify', // Left alignment for table body cells
        valign: 'middle', // Center vertical alignment in table body cells
        lineWidth: 0.1, // Border width
        cellPadding: { top: 7, bottom: 7, left: 4, right: 4 }, // Add vertical spacing in cells
        lineHeight: 12, // Adjust line height to add space between lines
      },
    });
    cursorY = doc.lastAutoTable.finalY + 10; // Add space below table

    doc.addImage(tips, 'PNG', 15, cursorY, 80, 30);

    cursorY += 30 + -5;
    const tableDataTips = [
      [`1. ${assessmentData.tip1.title}`],
      [`${assessmentData.tip1.description.trim()}`],
      [`2. ${assessmentData.tip2.title}`],
      [`${assessmentData.tip2.description.trim()}`],
      [`3. ${assessmentData.tip3.title}`],
      [`${assessmentData.tip3.description.trim()}`],
      [`4. ${assessmentData.tip4.title}`],
      [`${assessmentData.tip4.description.trim()}`],
    ];
    
    doc.autoTable({
      // head: [['Tips', 'Feedback']],
      body: tableDataTips,
      startY: cursorY + 10, // Positioning Y-axis
      theme: 'grid',
      styles: {
        fontSize: 10,
        lineWidth: 0,
        valign: 'top',
        cellPadding: { top: 2, bottom: 0, left: 0, right: 0 },
        fillColor: null // Remove background color
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.row.index % 2 === 0) {
          // Apply bold font style to even rows
          data.cell.styles.fontStyle = 'bold';
        }
      }
      
    });
    

    // ** Add Last Page with Image and Text (Without Footer) **
    doc.addPage();
    doc.addImage(secondImageBase64, 'PNG', 0, 0, pageWidth, pageHeight);


    // Add footer starting from the second page to the second-last page
    const pageCount = doc.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
      doc.setPage(i);
      const footerText = 'Copyright | Kommonify Ventures Private Limited';
      doc.setFontSize(10);
      doc.text(footerText, margin, pageHeight - 10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    doc.save('assessment_report.pdf');
  };

  // Start recording
  const startRecording = async () => {
    try {
      // Get user's microphone audio
      const userMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try to get system/browser audio
      let audioOutputStream;
      setAnimation(true);
      setbtn(false);
      setShowIntro(false)
      //   try {
      // audioOutputStream = await navigator.mediaDevices.getDisplayMedia({
      //   audio: true,
      //   video: true, // We don't need video, only system audio
      // });
      //   } catch (err) {
      //     console.warn("System audio could not be captured, recording only user audio.", err);
      //   }

      // Initialize the AudioContext for audio processing
      audioContextRef.current = new AudioContext();

      // Create media stream sources for both user and system audio
      const userSource = audioContextRef.current.createMediaStreamSource(userMediaStream);
      let systemSource = null;
      if (audioOutputStream) {
        systemSource = audioContextRef.current.createMediaStreamSource(audioOutputStream);
      }

      // Create a ChannelMergerNode to mix both streams into a single stereo output
      const merger = audioContextRef.current.createChannelMerger(2);

      // Connect user audio to the left channel (channel 0)
      userSource.connect(merger, 0, 0);

      // Connect system audio (if available) to the right channel (channel 1)
      if (systemSource) {
        systemSource.connect(merger, 0, 1);
      }

      // Create a ScriptProcessorNode for recording audio in stereo
      const recorder = audioContextRef.current.createScriptProcessor(2048, 2, 2);

      // Array to store audio chunks
      const audioChunks = [[], []];

      // On audio process, capture the left and right channels
      recorder.onaudioprocess = (e) => {
        const left = e.inputBuffer.getChannelData(0);  // Left channel (user's mic)
        const right = e.inputBuffer.getChannelData(1); // Right channel (system/browser audio)

        // Store the audio chunks for both channels
        audioChunks[0].push(new Float32Array(left));
        audioChunks[1].push(new Float32Array(right));
      };

      // Connect the merger node (mixed stream) to the recorder
      merger.connect(recorder);
      recorder.connect(audioContextRef.current.destination);

      // Store the references for later use
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = audioChunks;
      setIsRecording(true);
      setRecordingStartTime(Date.now()); // Store the start time of the recording


    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };


  // Stop recording
  const stopRecording = async (topic) => {
    // Stop the recorder and disconnect it
    mediaRecorderRef.current.disconnect();
    setIsRecording(true);
    setAnimation(false);
    setbtn(true);

    // Merge the captured audio chunks for both channels (left = user, right = system)
    const buffer = mergeBuffers(audioChunksRef.current, audioContextRef.current.sampleRate);

    // Encode the merged audio buffer into a WAV file
    const wavData = encodeWAV(buffer, audioContextRef.current.sampleRate);
    const blob = new Blob([wavData], { type: "audio/wav" });
    console.log("Recording stopped");

    // Download the merged audio file locally
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = "combined-audio-recording.wav";
    // document.body.appendChild(a); // Append the anchor to trigger download
    // a.click();
    // document.body.removeChild(a); // Remove the anchor after triggering download

    // Upload the merged audio file to the API
    await uploadToAPI(blob, topic);

    // Clear the stored audio data
    audioChunksRef.current = [[], []];
  };

  // Merge the buffers from both left (user) and right (system) channels
  const mergeBuffers = (audioData, sampleRate) => {
    const leftBuffer = mergeChannelBuffers(audioData[0]);  // User's microphone audio
    const rightBuffer = mergeChannelBuffers(audioData[1]); // System/browser audio

    return interleave(leftBuffer, rightBuffer);
  };

  // Merge a single channel's buffers into one continuous buffer
  const mergeChannelBuffers = (channelData) => {
    const length = channelData.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Float32Array(length);
    let offset = 0;
    channelData.forEach((chunk) => {
      result.set(chunk, offset);
      offset += chunk.length;
    });
    return result;
  };

  // Interleave left and right channel data to create a stereo output
  const interleave = (leftChannel, rightChannel) => {
    const length = leftChannel.length + rightChannel.length;
    const result = new Float32Array(length);

    for (let i = 0; i < leftChannel.length; i++) {
      result[2 * i] = leftChannel[i];     // Left channel (user)
      result[2 * i + 1] = rightChannel[i] !== undefined ? rightChannel[i] : 0; // Right channel (system or fallback to silence)
    }
    return result;
  };

  //===========================
  // useEffect(() => {
  //   startRecording();
  // }, [])

  // Manage status transitions
  useEffect(() => {
    if (status === 'inProgress') {
      const timer = setTimeout(() => {
        setStatus('preparingReport');
      }, 5000);
      return () => clearTimeout(timer);
    } else if (status === 'preparingReport') {
      const timer = setTimeout(() => {
        setStatus('downloadReport');
        if(status === 'downloadReport')
        {

          setDownload(true);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);


  return (
    <>


      <div className="container-image">
        <div className='audio-home'
          style={{
            width: '100%',
            position: 'relative',
          }}
        >



          {/* Top right button (only visible after the first conversation and when "T" is not being held down) */}
          {showTopButton && firstConversation && !conversationEnded && (
            <button
              onClick={handleEndConversation} // Call handleEndConversation when the button is clicked
              style={{
                position: 'absolute',
                top: '5px',
                right: '-1400px',
                padding: '10px 20px',
                backgroundColor: '#216b8d',
                border: 'none',
                borderRadius: '15px',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '15px',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontFamily: 'Poppins, sans-serif', // Apply Poppins font family

              }}
            >
              <img
                src={btnimg}
                height="40px"
                width="40px"
                alt="Stop Interaction Icon"
              />
              STOP INTERACTION
            </button>
          )}

          <section

            style={{
              position: 'absolute',
              top: '65vh',
              left: '2.5vw',
              right: '2.5vw',
              // width: '90%',
              height: '200px',
              borderRadius: '10px',
              // background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              display: 'grid'
            }}
          >
            {/* Left logo */}
            {/* <div
          style={{
            marginLeft: '10px',
            marginTop: '20px',
          }}
        >
          <img
            loading="lazy"
            src={logo2}
            height="120px"
            width="250px"
            alt="Left logo"
          />
        </div>*/}
            <section
              className="container-chat"
              style={{
                borderRadius: '10px',
                marginBottom: '15px',
                marginTop: '25px',
                // width: '60%',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                fontSize: '20px',
                alignItems: 'center',
                fontFamily: 'Poppins, sans-serif', // Apply Poppins font family

              }}
            >
              {/* Key pressed indicator */}
              <div>
                {keyPressed && (
                  <div className="icon">
                    <span className="span-prop" />
                    <span className="span-prop" />
                    <span className="span-prop" />
                  </div>
                )}

                {!isRecording && !conversationEnded &&  (
                  <button
                    className="record-button"
                    onClick={startRecording}
                    disabled={isUploading}
                  >
                    GET STARTED
                  </button>
                )}
                {isRecording && !btn && (
                  <button
                    className="record-button"
                    onClick={handleEndConversation}
                    disabled={isUploading}
                  >
                    STOP SESSION
                  </button>

                )}


                {/* {conversationEnded && (
                  <div>
                    <p>Conversation has ended. Please wait...</p>
                    {loader && <p>Loading...</p>}
                  </div>
                )}             */}
                  </div>

              {/* Display userText or status message */}
              {userText === '' ? (
                <p
                  style={{
                    fontSize: '25px',
                    color: 'rgba(219,168,66,255)',
                    textAlign: 'center',
                    fontFamily: 'Poppins, sans-serif', // Apply Poppins font family
                    fontWeight: 500
                  }}
                >
                  {/* Press [T] to talk */}
                </p>
              ) : conversationEnded ? (
                status === 'inProgress' ? (
                  <p className='conversationreport'
                    style={{
                      fontFamily: 'Poppins, sans-serif', // Apply Poppins font family
                      fontWeight: 500,
                      fontSize: '25px',
                      color: 'white',
                      textAlign: 'center',
                    }}
                  >

                    <img
                      loading="lazy"
                      src={logo3}
                      height="80px"
                      width="350px"
                      alt="Right logo"
                    />

                  </p>
                ) : status === 'preparingReport' ? (
                  <button
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#e07c30',
                      border: 'none',
                      borderRadius: '15px',
                      color: '#fff',
                      fontSize: '16px',
                      cursor: 'pointer',
                      width: '300px',
                      alignItems: 'center',
                      fontFamily: 'Poppins, sans-serif', // Apply Poppins font family
                      fontWeight: 500
                    }}
                  >
                    PREPARING ASSESSMENT REPORT
                  </button>
                ) : status === 'downloadReport' ? (
                  <button
                    onClick={downloadPDF} // Only enable download on completion
                    disabled={spAsseStat !== 2 || loading} // Disable button unless the assessment is complete
                    style={{
                      padding: '10px 20px',
                      backgroundColor: spAsseStat === 2 ? '#e07c30' : '#cccccc', // Change color based on status
                      border: 'none',
                      borderRadius: '15px',
                      color: '#fff',
                      fontSize: '16px',
                      cursor: spAsseStat === 2 ? 'pointer' : 'not-allowed', // Show pointer only when enabled
                      width: '300px',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 500,
                    }}
                  >
                    {loading ? 'Fetching Assessment...' : getStatusMessage()} {/* Update button text */}
                  </button>
                  
                ) : null
                
              ) : (
                <div
                  style={{
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      color: '#FFFFFF',
                      marginTop: '10px',
                    }}
                  >
                    {userText}
                  </p>
                  <p
                    style={{
                      color: '#39FF14',
                    }}
                  >
                    {npcText}
                  </p>
                </div>
              )}
            </section>

            {/* Right logo and button below */}
            <div
              style={{
                marginRight: '10px',
                marginTop: '-40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontFamily: 'Poppins, sans-serif', // Apply Poppins font family

              }}
            >
              {/* <Link to="/">
            <img
              loading="lazy"
              src={logo1}
              height="180vh"
              width="280vw"
              alt="Right logo"
            />
          </Link> */}
              {/* Button to trigger talk functionality */}

              {/* {isRecording && !conversationEnded && (
                <button
                  onMouseDown={handleButtonMouseDown} // Start speaking when button is pressed
                  onMouseUp={handleButtonMouseUp} // Stop speaking when button is released
                  onMouseLeave={handleButtonMouseUp} // Stop speaking when mouse leaves the button (optional for better UX)
                  style={{
                    marginTop: '-30px',
                    padding: '10px 50px',
                    backgroundColor: '#e07c30',
                    border: 'none',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    color: '#fff',
                    fontSize: '15px',
                    fontFamily: 'Poppins, sans-serif', // Apply Poppins font family
                    fontWeight: 500
                  }}
                >
                  PRESS " T " OR <br />HOLD TO SPEAK
                </button>
              )} */}

              {/* Restart practice button */}
              {status === 'downloadReport' && (
                <button
                  onClick={handleRestartPractice} // Call handleRestartPractice when the button is clicked
                  style={{
                    marginTop: '-20px',
                    padding: '10px 40px',
                    backgroundColor: '#e07c30',
                    border: 'none',
                    borderRadius: '15px',
                    color: '#fff',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif', // Apply Poppins font family
                    fontWeight: 500
                  }}
                >
                  RESTART PRACTICE
                </button>
              )}
            </div>
          </section>
          <div class="content-img-audio">
            <Link to="/"> <img src={logo4} /></Link>
          </div>
          {showIntro && (
            <div className='intro'>

              <h1>Start speech with your introduction or choose any topic that you want for 3 minutes...</h1>

            </div>

          )}


          {animation && (
            <div className="record_animation">
              <div id="bars">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
              </div>
            </div>
          )}

          {loader && (
            <div className='intro'>
              <div class="spinner-box">
                <div class="pulse-container">
                  <div class="pulse-bubble pulse-bubble-1"></div>
                  <div class="pulse-bubble pulse-bubble-2"></div>
                  <div class="pulse-bubble pulse-bubble-3"></div>
                </div>
              </div>
            </div>
          )}

          {download && !loading && ( // Image shows up after assessment is fetched
      <div className="intro">
        <img src={logo5} alt="Logo" />
      </div>
    )}
        </div>
      </div>
    </>
  )
}

export default Audiospeaker
