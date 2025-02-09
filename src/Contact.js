import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import picture from './pictures/porfolio_photos/atSymbol.png';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    from_name: '',
    to_name: 'Ty',
    message: ''
  });
  
  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, submitted: false, error: null });

    const templateParams = {
      from_name: formData.from_name,
      to_name: formData.to_name,
      message: formData.message
    };

    try {
      await emailjs.send(
        'service_gpbeg2o',
        'template_p5fuu5u',
        templateParams,
        'LXR5pEwAxnbEtCvOP'
      );

      setStatus({
        submitting: false,
        submitted: true,
        error: null
      });

      // Clear form
      setFormData({
        from_name: '',
        to_name: 'Ty',
        message: ''
      });

    } catch (error) {
        debugger;
      console.error('EmailJS Error:', error);
      setStatus({
        submitting: false,
        submitted: false,
        error: 'Failed to send message. Please try again.'
      });
    }
  };

  return ( 
    <div className="container mt-5" style={{width: "100vw", minHeight: "100vh", overflow: "auto"}}>
      <div className='mt-5 p-3 bg-tertiary shadow'> 
        <div className='bg-secondary m-3 p-5 shadow'>
          <h1 className="text-accent mb-4">Contact Me</h1>
          
          {/* Contact Info */}
          <div className="mb-5">
            <div className="mt-5">Email: linxtree<img src={picture} style={{height: "13px"}}/>gmail.com</div>
            <div className="mt-3">LinkedIn: <a href="https://www.linkedin.com/in/ty-crenshaw-641941108/" 
               className="text-accent text-decoration-none">
              Ty Crenshaw
            </a></div>
          </div>

          {/* Contact Form */}
          <div className="bg-tertiary p-4 rounded shadow-sm">
            <h4 className="text-accent mb-4">Send Me a Message</h4>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="from_name" className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="from_name"
                  name="from_name"
                  value={formData.from_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea
                  className="form-control"
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              {status.error && (
                <div className="alert alert-danger" role="alert">
                  {status.error}
                </div>
              )}

              {status.submitted && (
                <div className="alert alert-success" role="alert">
                  Message sent successfully!
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={status.submitting}
              >
                {status.submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;