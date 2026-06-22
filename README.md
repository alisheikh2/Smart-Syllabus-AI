SmartSyllabusAI
SmartSyllabusAI is an advanced AI-powered educational platform designed to help students optimize their course content and generate intelligent assessments efficiently.

🚀 Features
AI-Powered Course Generation: Organize and generate structured course content and syllabi using AI.

Smart Assessment System: Automatically generate tests and assessments based on specific course material.

Math & Formula Rendering: Seamless integration with KaTeX for high-quality, accurate rendering of complex mathematical equations.

Performance Optimized: Built with efficient browser-based caching to ensure fast loading and a smooth user experience.

🛠 Tech Stack
Frontend: React.js

Styling: CSS

Math Rendering: KaTeX

API Communication: Axios

Storage: LocalStorage (for data caching)

⚙️ Setup Instructions
1. Prerequisites
Ensure you have Node.js installed on your system.

2. Installation
Clone the repository and install the required dependencies:

Bash
git clone https://github.com/alisheikh2/Smart-Syllabus-AI.git
cd SmartSyllabusAI
npm install
3. Configuration
To get the application up and running:

Navigate to src/services/api.js.

Update the baseURL to point to your backend server.

Important: You will need to use your own personal AI API key to access AI services. Please configure this key within your backend environment variables to ensure the system functions correctly.

4. Running the App
To start the development server:

Bash
npm start
The application will be accessible at http://localhost:3000.

💡 Key Highlights
Rendering Engine: Integrated with KaTeX to provide a professional, readable interface for mathematical content.

Caching Strategy: Implemented LocalStorage caching to minimize redundant network requests, improving both speed and reliability.

🤝 Support
If you encounter any bugs or would like to suggest new features, please feel free to open an issue on GitHub.

Developed by Ali.
