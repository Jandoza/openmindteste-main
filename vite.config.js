import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ajusta caminhos para publicação em GitHub Pages (repo: openmindteste-main)
export default defineConfig({
	plugins: [react()],
	base: '/openmindteste-main/'
})


