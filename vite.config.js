import { defineConfig } from 'vite' // Import the function to define Vite configuration
import react from '@vitejs/plugin-react' // Import the Vite plugin for React support
import tailwindcss from '@tailwindcss/vite' // Import the Vite plugin for Tailwind CSS support

// This file configures Vite, our build tool and development server
// https://vite.dev/config/
export default defineConfig({
  // Plugins are extra tools that Vite uses to understand different file types or features
  plugins: [
    react(), // Enables React-specific features like Fast Refresh (hot reloading)
    tailwindcss() // Enables Tailwind CSS v4 support in the build pipeline
  ],
})
