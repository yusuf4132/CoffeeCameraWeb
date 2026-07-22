import { defineConfig } from 'vite'
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [basicSsl()],
  server: {
    host: true,
    https: true,
  },
});