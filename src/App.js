import { useState } from 'react';
import Calendar from 'react-calendar';
import book from './images/book-demo.svg';
import arrow from './images/left-arrow.svg';
import timer from './images/timer.svg';
import right from './images/right-arrow.svg';
import cross from './images/cross.png';
import drop from './images/down1.svg';
import icon1 from './images/icon1.png';
import confirmation from './images/confirmation.svg';
import 'react-calendar/dist/Calendar.css';
import './App.css';
import axios from 'axios';
import { DateTime } from 'luxon';
import TextField from '@mui/material/TextField';
import LinearProgress, { LinearProgressProps } from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function LinearProgressWithLabel({ value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" value={value} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(value)}%`}</Typography>
      </Box>
    </Box>
  );
}

function App() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [contactError, setContactError] = useState(false);
  const [emailHelperText, setEmailHelperText] = useState('');
  const [nameHelperText, setNameHelperText] = useState('');
  const [contactHelperText, setContactHelperText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');


  // Email validation function
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // Name validation function
  const validateName = (value) => {
    const nameRegex = /^[A-Za-z\s]+$/; // Only letters and spaces allowed
    return value.trim() !== '' && nameRegex.test(value);
  };

  // Contact number validation function
  const validateContact = (value) => {
    const contactRegex = /^[0-9]{10}$/; // Exactly 10 digits
    return contactRegex.test(value);
  };

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmail(value);

    if (validateEmail(value)) {
      setEmailError(false);
      setEmailHelperText('');
    } else {
      setEmailError(true);
      setEmailHelperText('Please enter a valid email.');
    }
  };

  const handleNameChange = (event) => {
    const value = event.target.value;
    setName(value);

    if (validateName(value)) {
      setNameError(false);
      setNameHelperText('');
    } else {
      setNameError(true);
      setNameHelperText('Please enter a valid name.');
    }
  };

  const handleContactChange = (event) => {
    const value = event.target.value;
    setContact(value);

    if (validateContact(value)) {
      setContactError(false);
      setContactHelperText('');
    } else {
      setContactError(true);
      setContactHelperText('Please enter a valid 10-digit contact number.');
    }
  };
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelect = (option) => {
    setSelectedOption(option);
  };
  const [currentStep, setCurrentStep] = useState(1);
  const [date, setDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);

  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM"
  ];

  const handleBackClick = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
  };

  const today = new Date();

  const handleNextClick = () => {
    if (currentStep === 1) {
      if (!date) {
        setErrors((prevErrors) => ({ ...prevErrors, dateError: 'Please select a date.' }));
      } else if (!selectedSlot) {
        setErrors((prevErrors) => ({ ...prevErrors, slotError: 'Please select a time slot.' }));
      } else if (date < new Date()) {
        setErrors((prevErrors) => ({ ...prevErrors, futureDateError: 'Please select a date and time in the future.' }));
      } else {
        setCurrentStep((prevStep) => prevStep + 1);
        setErrors({
          dateError: '',
          slotError: '',
          futureDateError: '',
        });
      }
    } else if (currentStep === 2) {

      if (validateEmail(email) && validateName(name) && validateContact(contact) && selectedSlot) {
        scheduleMeeting();
      } else {
        // Handle validation errors
        setEmailError(!validateEmail(email));
        setNameError(!validateName(name));
        setContactError(!validateContact(contact));
      }

    } else {

      setCurrentStep((prevStep) => prevStep + 1);

    }

  };
  const handleSelectTimeZone = (zone) => {
    // Extract the time zone before the space (i.e., without the UTC offset)
    const timeZoneOnly = zone.split(' ')[0];
    setSelectedTimeZone(timeZoneOnly);
    setShowTimeZones(false);
  };

  const scheduleMeeting = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    // Convert selectedSlot (e.g., "10:00 AM") to 24-hour format
    const timeParts = selectedSlot.split(' ');
    const timeComponents = timeParts[0].split(':');
    let hours = parseInt(timeComponents[0], 10);
    const minutes = timeComponents[1];
    const period = timeParts[1]; // AM or PM

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    // Combine date and time into a JavaScript Date object
    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(hours);
    combinedDateTime.setMinutes(minutes);

    // Use luxon to handle the timezone and format the datetime string
    const dateTimeInTimeZone = DateTime.fromJSDate(combinedDateTime)
      .setZone(selectedTimeZone) // Set the user-selected time zone
      .toISO(); // Convert to ISO format, including the correct time zone offset

    const payload = {
      user_email: email,
      date_time: dateTimeInTimeZone,
      duration: "30m",
      time_zone: selectedTimeZone,  // Include the time zone
    };

    try {
      const response = await axios.post('http://localhost:8000/v1/open/meeting', payload);
      setSuccess(true);
      setCurrentStep(3);
    } catch (err) {
      setError('Failed to schedule the meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const [errors, setErrors] = useState({
    dateError: '',
    slotError: '',
    futureDateError: '',
  });
  const formattedSlot = selectedSlot ? selectedSlot : '';

  const formattedDate = `${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  const formattedSlotRange = selectedSlot ? formattedSlot : '';
  const [errorActive, setErrorActive] = useState(false);
  const [showTimeZones, setShowTimeZones] = useState(false);
  const [selectedTimeZone, setSelectedTimeZone] = useState('');

  const timeZones = [
    'Pacific/Midway UTC-11',
    'America/Adak UTC-10',
    'Pacific/Honolulu UTC-10',
    'America/Anchorage UTC-9',
    'America/Los_Angeles UTC-8',
    'America/Tijuana UTC-8',
    'America/Denver UTC-7',
    'America/Phoenix UTC-7',
    'America/Chicago UTC-6',
    'America/Mexico_City UTC-6',
    'America/New_York UTC-5',
    'America/Toronto UTC-5',
    'America/Caracas UTC-4',
    'America/Santiago UTC-4',
    'America/Halifax UTC-4',
    'Atlantic/Stanley UTC-3',
    'America/Sao_Paulo UTC-3',
    'Atlantic/South_Georgia UTC-2',
    'Atlantic/Azores UTC-1',
    'Europe/London UTC+0',
    'Europe/Lisbon UTC+0',
    'Africa/Casablanca UTC+0',
    'Europe/Berlin UTC+1',
    'Europe/Paris UTC+1',
    'Africa/Lagos UTC+1',
    'Africa/Cairo UTC+2',
    'Europe/Istanbul UTC+3',
    'Asia/Jerusalem UTC+3',
    'Europe/Moscow UTC+3',
    'Asia/Dubai UTC+4',
    'Asia/Karachi UTC+5',
    'Asia/Kolkata UTC+5:30',
    'Asia/Dhaka UTC+6',
    'Asia/Bangkok UTC+7',
    'Asia/Singapore UTC+8',
    'Asia/Shanghai UTC+8',
    'Australia/Perth UTC+8',
    'Asia/Tokyo UTC+9',
    'Asia/Seoul UTC+9',
    'Australia/Sydney UTC+10',
    'Pacific/Guam UTC+10',
    'Pacific/Auckland UTC+12'
  ];

  const handleToggleDropdown = () => {
    setShowTimeZones(!showTimeZones);
  };


  const questions = [
    {
      id: 1, question: 'Which segment does your company belong to?', options: ['Aerospace', 'Automotive', 'Gaming', 'Hospitality', 'Manufacturing', 'Mining', 'Retail', 'Agriculture', 'Consumer Goods ', 'Enterprise Technology', 'Government', 'Insurance', 'Marketing & Advertising ', 'Non-Profit Organization ',
        'Professional Services ', 'Banking and Finance Sector ', 'Consumer Technology ', 'Financial Services ', 'Healthcare', 'Life Sciences ', 'Media', 'Transportation and Logistics ', 'Wholesale and Distribution ']
    },
    { id: 2, question: 'Which segment does your company belong to?', options: ['Startup', 'Scale Startup', 'SME', 'Government/Public Sector ', 'Non-profit Organizations', 'Mid Enterprises', 'Mid Enterprises', 'Mid Enterprises'] },
    { id: 3, question: 'What stage is your AI adoption currently in?', options: ['Conceptualized: Use case defined, PoC pending ', 'Proof of Concept (PoC) Completed ', 'In Production with Challenges ', 'Not Yet Defined'] },
    {
      id: 4, question: 'Select your primary focus area(s) for AI Agent and Agentic AI use cases (choose one or more) :', options: ['Data Insights and Analytics  ', 'Business Intelligence', 'Knowledge Management', 'Customer Behavior Analysis ', 'Customer Behavior Analysis ', 'Customer Behavior Analysis '
        , 'IT Operations ', 'Customer Operations ', 'Risk and Fraud Detection ', 'Software Development Testing ', 'Predictive and Forecasting Models ', 'Real-Time Decision-Making ', 'Process Optimization  ', 'Resource and Inventory Management  ', 'Market Trends and Competitive Analysis  '
        , 'Compliance and Regulatory Reporting  ', 'Operational Performance Monitoring ', 'Custom Use Case (Please specify) ',
      ]
    },
    { id: 5, question: 'What is your current method for getting insights from data?  ', options: ['Traditional BI Tools , RPA-Based Solutions ', 'Cloud-Based Analytics Platforms', 'No AI-based Insights Yet', 'Other (Please specify)'] },
    { id: 6, question: 'What data sources will you integrate with AI Agents? ', options: ['On-prem SQL/NoSQL Databases ', 'Cloud storage, Excel, etc. ', 'Other (Please specify)'] },
    { id: 7, question: 'What would success look like for your organization after implementing AI Agents and Agentic Workflow?  ', options: ['Faster decision-making ', 'Improved data accuracy and insights ', 'Greater operational efficiency ', 'Enhanced customer experiences ', 'Increased innovation and adaptability ', 'Other (Please specify) '] },

  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [progress, setProgress] = useState(0);

  // Handle answer selection
  const handleSelectAnswer = (questionId, option) => {
    setSelectedAnswers((prevSelectedAnswers) => {
      // Get current answers for the question
      const currentAnswers = prevSelectedAnswers[questionId] || [];

      // If option is already selected, remove it (toggle)
      if (currentAnswers.includes(option)) {
        return {
          ...prevSelectedAnswers,
          [questionId]: currentAnswers.filter((answer) => answer !== option)
        };
      }

      // If option is not selected, add it to the list of selected answers
      return {
        ...prevSelectedAnswers,
        [questionId]: [...currentAnswers, option]
      };
    });
  };

  // Handle next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setProgress(((currentQuestionIndex + 1) / questions.length) * 100);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex === 0) {
      setCurrentStep(2); // Go back to Step 2 if on the first question
    } else {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setProgress((currentQuestionIndex / questions.length) * 100);
    }
  };

  return (
    <div className='callender-page'>
      <style>
        {`

          * {
            margin: 0;
            padding: 0;
          }
          .react-calendar { 
            width: 380px;
            max-width: 100%;
            background-color: #fff;
            color: #222;
            border-radius: 8px;
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.125em;
            border: none;
          }
          .react-calendar__navigation button {
            color: #0D5C9C;
            min-width: 44px;
            background: none;
            font-size: 20px;
            font-weight: 800;
            margin-top: 8px;
          }
          .react-calendar__tile--active:enabled:hover, .react-calendar__tile--active:enabled:focus{
          background: #97D0FF66;
          border: 1px solid #4399DF
          color: #0D5C9C;
          }
          .react-calendar__tile {
          padding: 15px 6.6667px;
          }
          .react-calendar__navigation button:enabled:hover,
          .react-calendar__navigation button:enabled:focus {
            background-color: #f8f8fa;
          }
          .react-calendar__navigation button[disabled] {
            background-color: #f0f0f0;
          }
          abbr[title] {
            text-decoration: none;
          }
          .react-calendar__tile:enabled:hover,
          .react-calendar__tile:enabled:focus {
            border-radius: 6px;
          }
            .react-calendar__month-view__days__day--neighboringMonth, .react-calendar__decade-view__years__year--neighboringDecade, .react-calendar__century-view__decades__decade--neighboringCentury {
    color: #707070;
}
    .react-calendar__month-view__days__day--weekend {
    color: #d10000;
}
          .react-calendar__tile--now {
            background: #6f48eb33;
            border-radius: 6px;
            font-weight: bold;
            color: #6f48eb;
          }
          .react-calendar__tile--now:enabled:hover,
          .react-calendar__tile--now:enabled:focus {
            border-radius: 6px;
            font-weight: bold;
            color: #6f48eb;
          }
          .react-calendar__tile--hasActive:enabled:hover,
          .react-calendar__tile--hasActive:enabled:focus {
            // background: #f8f8fa;
          }
          .react-calendar__tile--active {
            border-radius: 6px;
            font-weight: bold;
            color: white;
          }
          .react-calendar__tile--active:enabled:hover,
          .react-calendar__tile--active:enabled:focus {
          }
          .react-calendar--selectRange .react-calendar__tile--hover {
            background-color: #f8f8fa;
          }
          .react-calendar__tile--range {
            background: #f8f8fa;
            color: #6f48eb;
            border-radius: 0;
          }
          .react-calendar__tile--rangeStart {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            border-top-left-radius: 6px;
            border-bottom-left-radius: 6px;
            background: #6f48eb;
            color: white;
          }
          .react-calendar__tile--rangeEnd {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            border-top-right-radius: 6px;
            border-bottom-right-radius: 6px;
            background: #97D0FF66;
            color:#0D5C9C;
          }
        `}
      </style>
      <div className={`callender-wrapper ${errors.dateError || errors.slotError || errors.futureDateError ? '' : ''}`}>
        <div className={`callernder-top-wrapper ${errors.dateError || errors.slotError || errors.futureDateError ? 'blur-elements' : ''}`}>
          <div className={`callender-left-wrapper ${currentStep === 4 ? 'confirmation-step' : ''}`}>
            {(currentStep === 1 || currentStep === 2 || currentStep === 3) && (
              <>
                <div className='scheduled-demo-wrapper'>
                  <div className='scheduled-demo'>
                    <p>Get a walkthrough</p>
                    <h3>Schedule a demo</h3>
                    <h4>Our team will walk you through the platform and demonstrate how our solution can help!</h4>
                  </div>
                  <div className='duration-wrapper'>
                    <div className='duration'>
                      <img src={timer} alt="Timer" />
                      <h4>30 min</h4>
                    </div>
                    <div className='time-zone-wrapper'>
                      <div className="time-zone">
                        <img src={timer} alt="Timer" />
                        <input
                          type="text"
                          placeholder="Time Zone"
                          className="red-text"
                          value={selectedTimeZone}
                          readOnly
                        />
                      </div>
                      <img
                        src={drop}
                        alt="dropdown icon"
                        onClick={handleToggleDropdown}
                        style={{ cursor: 'pointer' }}
                      />
                      {showTimeZones && (
                        <div className='all-time-zone-wrapper'>
                          {timeZones.map((zone, index) => (
                            <div
                              key={index}
                              className="time-zone-item"
                              onClick={() => handleSelectTimeZone(zone)}
                            >
                              {zone}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <>
                <div className='confirmation-container'>
                  <img src={confirmation} alt="Confirmation" />
                  <div className='confirmation-header'>
                    <h1>We just scheduled a demo with you!</h1>
                    <p>A calendar invitation for your upcoming session has
                      been sent to your email.</p>
                  </div>
                  <div className='slot-confirmation'>
                    <div className='selected-date'>
                      <p>Date</p>
                      <h3>{formattedDate}</h3>
                    </div>
                    <div className='selected-date'>
                      <p>Time</p>
                      <h3>{formattedSlot}</h3>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          {currentStep === 1 && (
            <div className={`calender-container-wrapper ${errors.dateError || errors.slotError || errors.futureDateError ? 'blur-elements' : ''}`}>
              <div className='calendar-container'>
                <div className='top-callender-container'>
                  <p>Select a Date and Time</p>
                  <Calendar onChange={setDate} value={date} minDate={today} />
                </div>
                <div className='bottom-callender-conatiner'>
                  <div className='next-wrapper'>
                    <h4 onClick={() => setCurrentStep(2)}>Next</h4>
                  </div>
                </div>
              </div>
              <div className='calender-right-wrapper'>
                <h2>Available Slots</h2>
                <div className='slots-wrapper'>
                  {timeSlots.map((slot) => (
                    <div
                      key={slot}
                      className={`choose-slot ${selectedSlot === slot ? 'selected' : ''}`}
                      onClick={() => handleSlotClick(slot)}
                    >
                      <h4>{slot}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className='book-details'>
              <div className='book-wrapper'>
                <div className='top-book-details'>
                  <p>Enter your details</p>
                  <h3>Personal Information</h3>
                </div>
                <div className='middle-book-details'>
                  <TextField
                    error={emailError}
                    id="outlined-email"
                    label="Email"
                    value={email}
                    onChange={handleEmailChange}
                    helperText={emailHelperText}
                    variant="outlined"
                    margin="normal"
                    className="custom-width"
                  />
                  <TextField
                    error={nameError}
                    id="outlined-name"
                    label="Name"
                    value={name}
                    onChange={handleNameChange}
                    helperText={nameHelperText}
                    variant="outlined"
                    margin="normal"
                    className="custom-width"
                  />
                  <TextField
                    error={contactError}
                    id="outlined-contact"
                    label="Contact Number"
                    value={contact}
                    onChange={handleContactChange}
                    helperText={contactHelperText}
                    variant="outlined"
                    margin="normal"
                    className="custom-width"
                  />
                </div>
                <div className='bottom-book-details'>
                  <p>Any experience with handling Financial Operations on Cloud</p>
                  <div className='answer-wrapper'>
                    <div
                      className={`yes-wrapper ${selectedOption === 'yes' ? 'selected' : ''}`}
                      onClick={() => handleSelect('yes')}
                    >
                      <div className={`check-box ${selectedOption === 'yes' ? 'checked' : ''}`}></div>
                      <p>Yes</p>
                    </div>
                    <div
                      className={`no-wrapper ${selectedOption === 'no' ? 'selected' : ''}`}
                      onClick={() => handleSelect('no')}
                    >
                      <div className={`check-box ${selectedOption === 'no' ? 'checked' : ''}`}></div>
                      <p>No</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='bottom-callender-conatiner'>
                <div className='back-wrapper'>
                  <h4 onClick={() => setCurrentStep(1)}>Back</h4>
                </div>
                <div className='next-wrapper'>
                  <h4 onClick={() => setCurrentStep(3)}>Next</h4>
                </div>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="company-container">
              <div className="company-details">
                <div className="company-top-wrapper">
                  <p>Help us make your experience better</p>
                  <h2>Personalization</h2>
                </div>

                {/* Progress Bar */}
                <div className="status-wrapper">
                  <Box sx={{ width: '100%' }}>
                    <LinearProgressWithLabel value={progress} />
                  </Box>
                  <p>{questions[currentQuestionIndex].question}</p>
                </div>

                {/* Current Question */}
                <div>

                  <div className="option-wrapper">
                    {questions[currentQuestionIndex].options.map((option, index) => (
                      <div
                        key={index}
                        className={`option ${selectedAnswers[questions[currentQuestionIndex].id]?.includes(option) ? 'selected' : ''}`}
                        onClick={() => handleSelectAnswer(questions[currentQuestionIndex].id, option)}
                      >
                        <div className="option-box"></div>
                        <p>{option}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Navigation */}
              <div className="bottom-callender-conatiner">
                <div className="back-wrapper">
                  <h4 onClick={handleBack}>Back</h4>
                </div>
                <div className="next-wrapper">
                  {currentQuestionIndex < questions.length - 1 ? (
                    <h4 onClick={handleNext}>Next</h4>
                  ) : (
                    <h4 onClick={() => setCurrentStep(4)}>Submit</h4>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {currentStep !== 4 ? (
          <div className={`calender-bottom-wrapper ${errors.dateError || errors.slotError || errors.futureDateError ? 'blur-elements' : ''}`}>
          </div>
        ) : (
          <div className='confirmation-bottom'>
            <div className='get-back-home'>
              <p>Get Back Home</p>
            </div>
            <div className='resend-email'>
              <p>Resend E-mail</p>
            </div>
          </div>
        )}
        {errors.dateError || errors.slotError || errors.futureDateError ? (
          <div className="error">
            <div className='cross-wrapper'>
              <img src={cross}></img>
            </div>
            <h3>Warning</h3>
            <p>Please select time and slot to continue</p>
            <div className='okay-wrapper'>
              <h4 onClick={() => {
                setErrorActive(false);
                window.location.reload();
              }}>OK</h4>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
