import { execSync } from "child_process"
import {
	vitePlugin as remix,
	cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	define: {
		BUILD_TIME: JSON.stringify(new Date().toLocaleString("en-GB")),
		GIT_SHA: JSON.stringify(
			execSync("git rev-parse --short HEAD").toString().trim(),
		),
	},

	plugins: [remixCloudflareDevProxy(), remix(), tsconfigPaths()],
})
