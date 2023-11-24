import picture from './pictures/atSymbol.png';
//this is be tring to get a form they could fill out and it would
//send me an email. I still think this would be neet but it is a lot of work
//meaning idk how to do it and it was taking alot of time.
// import { render } from '@react-email/render';
// import AWS from 'aws-sdk';

// AWS.config.update({ region: process.env.AWS_SES_REGION });

// const emailHtml = render();

// const options = {
//   RawMessage: {
//     Data: Buffer.from(
//       `From: ${process.env.SOURCE_EMAIL}\r\n` +
//         `To: ${process.env.DESTINATION_EMAIL}\r\n` +
//         'Subject: hello world\r\n' +
//         'MIME-Version: 1.0\r\n' +
//         'Content-Type: multipart/mixed; boundary="NextPart"\r\n' +
//         '\r\n' +
//         '--NextPart\r\n' +
//         'Content-Type: text/html; charset=us-ascii\r\n' +
//         '\r\n' +
//         `${emailHtml}\r\n` +
//         '--NextPart--'
//     ),
//   },
// };

// const sendPromise = new AWS.SES({ apiVersion: '2010-12-01' })
//   .sendRawEmail(options)
//   .promise();

// sendPromise
//   .then((data) => {
//     console.log(data.MessageId);
//   })
//   .catch((err) => {
//     console.error(err, err.stack);
//   });

const ContactPage = () => {
  return ( 
        <div className="container mt-5" style={{width: "100vw", minHeight: "100vh", overflow: "auto"}}>
            <div className='mt-5 p-3 bg-tertiary shadow'> 
                <div className='bg-secondary m-3 p-5 shadow'>
                    <h1>
                        Contact Me
                    </h1>
                    <div className="mt-5">Email: linxtree
                    <img src={picture}/>
                    gmail.com</div>
                    <div className="mt-3">linkedin: <a href="https://www.linkedin.com/in/ty-crenshaw-641941108/">Ty Crenshaw</a></div>
                </div>
            </div>
      </div>
   );
}

export default ContactPage;