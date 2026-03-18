import React from 'react' // Import the React library to use JSX and React features
import ReactDOM from 'react-dom/client' // Import the ReactDOM library to render our app into the web browser
import { BrowserRouter } from 'react-router-dom' // Import BrowserRouter to enable multi-page navigation (routing)
import App from './App.jsx' // Import the main App component where our application logic lives
import './index.css' // Import global styles that apply to the entire application

// This line finds a <div> with the ID 'root' in index.html and tells React to use it as the starting point
ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode is a tool for highlighting potential problems in an application during development
  <React.StrictMode>
    {/* BrowserRouter tracks the URL in the browser and decides which page/component to show based on that URL */}
    <BrowserRouter>
      {/* Our main application component is rendered here inside the router */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
