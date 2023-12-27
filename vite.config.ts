import { execSync } from "child_process"
import { unstable_vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	plugins: [remix(), tsconfigPaths()],
	define: {
		BUILD_TIME: JSON.stringify(new Date().toLocaleString("en-GB")),
		GIT_SHA: JSON.stringify(
			execSync("git rev-parse --short HEAD").toString().trim(),
		),
	},
})
