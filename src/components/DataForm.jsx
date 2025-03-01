import React, { useState } from 'react';
import './DataForm.css';

const DataForm = () => {
  const [formData, setFormData] = useState({
    country: '',
    name: '',
    isContentCreator: false,
    youtubeChannel: '',
    os: '',
    email: '',
    phone: '',
    language: '',
    acceptTerms: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const countries = [
    "Afghanistan", "Åland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", 
    "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", 
    "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", 
    "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", 
    "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", 
    "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", 
    "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", 
    "Colombia", "Comoros", "Congo", "Congo, The Democratic Republic of The", "Cook Islands", 
    "Costa Rica", "Cote D'ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", 
    "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", 
    "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", 
    "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", 
    "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", 
    "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", 
    "Guinea-bissau", "Guyana", "Haiti", "Heard Island and Mcdonald Islands", 
    "Holy See (Vatican City State)", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", 
    "Indonesia", "Iran, Islamic Republic of", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", 
    "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", 
    "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan", 
    "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", 
    "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", 
    "Macedonia, The Former Yugoslav Republic of", "Madagascar", "Malawi", "Malaysia", "Maldives", 
    "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", 
    "Mexico", "Micronesia, Federated States of", "Moldova, Republic of", "Monaco", "Mongolia", 
    "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", 
    "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", 
    "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", 
    "Palau", "Palestinian Territory, Occupied", "Panama", "Papua New Guinea", "Paraguay", "Peru", 
    "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", 
    "Russian Federation", "Rwanda", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia", 
    "Saint Pierre and Miquelon", "Saint Vincent and The Grenadines", "Samoa", "San Marino", 
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", 
    "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
    "South Georgia and The South Sandwich Islands", "Spain", "Sri Lanka", "Sudan", "Suriname", 
    "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", 
    "Taiwan", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Timor-leste", "Togo", 
    "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", 
    "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", 
    "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay", 
    "Uzbekistan", "Vanuatu", "Venezuela", "Viet Nam", "Virgin Islands, British", 
    "Virgin Islands, U.S.", "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"
  ];

  const languages = [
    "English",
    "Hindi",
    "Spanish",
    "French",
    "Arabic",
    "Bengali",
    "Russian",
    "Portuguese",
    "Indonesian",
    "Urdu",
    "German",
    "Japanese",
    "Swahili",
    "Marathi",
    "Telugu",
    "Turkish",
    "Tamil",
    "Vietnamese",
    "Korean",
    "Italian",
    "Thai",
    "Persian",
    "Polish"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      alert("Please accept the terms and conditions to proceed.");
      return;
    }

    const existingSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    
    const newSubmission = {
      ...formData,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('formSubmissions', JSON.stringify([...existingSubmissions, newSubmission]));
    
    setShowSuccess(true);
    setFormData({
      country: '',
      name: '',
      isContentCreator: false,
      youtubeChannel: '',
      os: '',
      email: '',
      phone: '',
      language: '',
      acceptTerms: false
    });
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="registration-form">
      <div className="form-banner">
        <img 
          src="https://picsum.photos/800/200" 
          alt="Registration Banner" 
          className="banner-image" 
        />
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">Select Country</label>
          <select 
            id="country" 
            name="country" 
            value={formData.country} 
            onChange={handleChange}
            required
          >
            <option value="">Select a country</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="language">Preferred Language</label>
          <select 
            id="language" 
            name="language" 
            value={formData.language} 
            onChange={handleChange}
            required
          >
            <option value="">Select a language</option>
            {languages.map(language => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="Enter your phone number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email address"
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="isContentCreator"
              checked={formData.isContentCreator}
              onChange={handleChange}
            />
            Are You a Content Creator?
          </label>
        </div>

        {formData.isContentCreator && (
          <div className="form-group">
            <label htmlFor="youtubeChannel">Provide Your YouTube Channel Link</label>
            <input
              type="url"
              id="youtubeChannel"
              name="youtubeChannel"
              value={formData.youtubeChannel}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
            />
          </div>
        )}

        <div className="form-group">
          <label>Which OS does your phone have?</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="os"
                value="Android"
                checked={formData.os === 'Android'}
                onChange={handleChange}
                required
              />
              Android
            </label>
            <label>
              <input
                type="radio"
                name="os"
                value="iOS"
                checked={formData.os === 'iOS'}
                onChange={handleChange}
                required
              />
              iOS
            </label>
          </div>
        </div>

        <div className="form-group terms-group">
          <label>
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              required
            />
            I understand and accept the terms and conditions
          </label>
          <button 
            type="button" 
            className="terms-link"
            onClick={() => setShowTerms(true)}
          >
            View Terms
          </button>
        </div>

        <div className="form-message">
          You will get an email with the download link within the next 5-10 days. 
          After that, you can download the game with the 3 steps below.
        </div>

        <button type="submit" className="submit-button">Submit</button>

        {showSuccess && (
          <div className="success-message">
            Registration successful! Check your email for further instructions.
          </div>
        )}
      </form>

      {showTerms && (
        <div className="terms-modal">
          <div className="terms-content">
            <h2>Terms and Conditions</h2>
            <div className="terms-text">
              <p>1. By registering, you agree to receive updates and notifications about the game.</p>
              <p>2. Your personal information will be handled according to our privacy policy.</p>
              <p>3. The download link will be sent to your email within 5-10 days.</p>
              <p>4. This is an alpha version of the game and may contain bugs.</p>
              <p>5. You agree not to share or distribute the game without permission.</p>
            </div>
            <button onClick={() => setShowTerms(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataForm; 