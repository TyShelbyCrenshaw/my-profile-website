const Skills = () => {
    return (     
    <div className="container mt-5" style={{width: "100vw", minHeight: "100vh", overflow: "auto"}}>
        <h1 className="text-accent">Skills</h1>

        <div className="mt-5 card w-75 shadow">
            <div className="card-header bg-primary text-tertiary">
            What are the main programming languages, tools, and frameworks that you use in your work?
            </div>
            <div className="card-body card- bg-tertiary">
                <blockquote className="blockquote mb-0">
                <p>I am a .NET developer who uses C# as my primary programming language. I use the MVC pattern to create web applications that separate the presentation, business logic, and data access layers. I use SQL Server Management Studio (SSMS) as my database management tool, and SQL as my query language to interact with the data stored in the back end of my applications.</p>
                </blockquote>
            </div>
        </div>

        <div className="mt-5 card w-75 shadow">
            <div className="card-header bg-primary text-tertiary">
            What are the main types of software applications or systems that you develop or maintain?
            </div>
            <div className="card-body bg-tertiary">
                <blockquote className="blockquote mb-0">
                <p>I develop and maintain in-house projects that offer affiliate marketing services to other businesses. Affiliate marketing is a type of online marketing where affiliates earn commissions for referring customers or leads to a business. My projects provide tools for tracking, reporting, analytics, lead generation, and more to help my clients improve their marketing strategies and results.</p>
                </blockquote>
            </div>
        </div>

        <div className="mt-5 card w-75 shadow">
            <div className="card-header bg-primary text-tertiary">
            How do you collaborate with other developers, designers, testers, or stakeholders in your projects? What are the tools or methods that you use for communication and coordination?
            </div>
            <div className="card-body bg-tertiary">
                <blockquote className="blockquote mb-0">
                <p>I use Jira as my project management tool to keep track of tasks, features, bugs, and progress. I follow the agile methodology to deliver software in short and iterative cycles. I have daily stand-up meetings with my team to share what I have done, what I plan to do, and what challenges I face. I also have weekly sizing meetings with my team and stakeholders to estimate the effort and complexity of future features, and prioritize them according to the client’s needs and expectations.</p>
                </blockquote>
            </div>
        </div>

        <div className="mt-5 card w-75 shadow">
            <div className="card-header bg-primary text-tertiary">
            What are some of the most challenging or interesting projects that you have worked on or contributed to? What were the goals, challenges, solutions, and outcomes of those projects?
            </div>
            <div className="card-body bg-tertiary">
                <blockquote className="blockquote mb-0">
                <p>One of my most challenging projects was the partner sign-up project. The goal was to create a customizable sign-up page for each client that allows them to collect different information from their affiliates based on their requirements. Some of the challenges that I faced were handling a lot of variation and validation for each field, ensuring security and privacy of the data, and integrating with other systems or services. Some of the solutions that I came up with were creating a configurable interface for each client that allows them to specify what fields they want to include in their sign-up page, using standard hashing algorithms to encrypt sensitive data. Some of the outcomes or benefits of my project were increasing the conversion rate of affiliates, improving the user experience of the sign-up process, and enhancing the Client satisfaction.</p>
                </blockquote>
            </div>
        </div>

        <div className="mt-5 card w-75 shadow">
            <div className="card-header bg-primary text-tertiary">
            How do you keep your skills and knowledge up to date? What are some of the sources or resources that you use for learning new technologies or best practices?
            </div>
            <div className="card-body bg-tertiary">
                <blockquote className="blockquote mb-0">
                <p>I am always eager to learn new skills and technologies that are relevant to my work. Some of the sources or resources that I use for learning new technologies or best practices are online courses from Pluralsight, Podcasts, and videos from Youtube. Some of the topics or areas that I am interested in or curious about are AI, machine learning, cloud computing, etc. Some of the ways that I apply my learning to my work are experimenting with new tools or frameworks, such as React, Bootstrap, Generative AI, implementing new features or functionalities, such as Ad Listing, Creation, and Organization, improving existing code or processes, such as Partner Sign Up, and our Link Generator.</p>
                </blockquote>
            </div>
        </div>
    </div> );
}
 
export default Skills;