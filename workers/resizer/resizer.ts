/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */


export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return handleRequest(request);
  },
};

/** GLOBALS */
// URL prefix for origin requests
const CDN_URL: string = "https://raw.githubusercontent.com/danreeves/darktide-images/main/pngs";
const DEFAULT_IMAGE: string = CDN_URL + "/images/image-placeholder.webp";

/** Environment bindings */
interface Env {
  // Add any environment variables or bindings here if needed
}

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request: Request): Promise<Response> {
  // Parse request URL to get access to query string
  const url: URL = new URL(request.url);

  // Validate URL pathname
  if (!url.pathname || !url.pathname.length) {
    return new Response("Missing image path!", { status: 404 });
  }

  const imageURL: string = CDN_URL + url.pathname.replace("/resize", ""); // Prefix image path with CDN URL

  // Validation options
  const whRange: [number, number] = [50, 3000]; // Width and height range limit
  const formats: string[] = ['webp', 'avif', 'json'];
  const fitVals: string[] = ['scale-down', 'contain', 'cover', 'crop', 'pad'];
  const gravityVals: string[] = ['left', 'right', 'top', 'bottom', 'center', 'auto']; // Also can be object int {x, y}
  const qualityRange: [number, number] = [60, 90]; // Actually 0-100 but 60-90 is usable range
  const rotateVals: number[] = [90, 180, 270]; // Only multiples of 90 allowed
  const sharpenRange: [number, number] = [0, 10]; // Float: 1.0 recommended for down-scaled images
  const blurRange: [number, number] = [0, 250];

  // Cloudflare-specific options are in the cf object.
  const options: { cf: { image: Record<string, unknown> } } = { cf: { image: {} } };

  // Copy parameters from query string to request options.
  if (url.searchParams.has("fit")) options.cf.image.fit = url.searchParams.get("fit");
  if (url.searchParams.has("w")) options.cf.image.width = parseInt(url.searchParams.get("w") || "0", 10);
  if (url.searchParams.has("h")) options.cf.image.height = parseInt(url.searchParams.get("h") || "0", 10);
  if (url.searchParams.has("q")) options.cf.image.quality = parseInt(url.searchParams.get("q") || "0", 10);
  if (url.searchParams.has("r")) options.cf.image.rotate = parseInt(url.searchParams.get("r") || "0", 10);
  if (url.searchParams.has("sharpen")) options.cf.image.sharpen = parseFloat(url.searchParams.get("sharpen") || "0");
  if (url.searchParams.has("blur")) options.cf.image.blur = parseFloat(url.searchParams.get("blur") || "0");
  if (url.searchParams.has("t")) options.cf.image.trim = url.searchParams.get("t");
  if (url.searchParams.has("g")) options.cf.image.gravity = url.searchParams.get("g");

// https://developers.cloudflare.com/images/transform-images/draw-overlays/
//   options.cf.image.draw = [{
//     url: "some-url",
//     // width: 10, height:270, opacity: 0.5,
//     // bottom:0, left:0
//   }]

  // Validate parameters
  if (options.cf.image.fit && !fitVals.includes(options.cf.image.fit as string)) {
    return new Response("Invalid value for fit!", { status: 400 });
  }
  if (options.cf.image.width && !inRange(options.cf.image.width as number, whRange)) {
    return new Response(`Invalid width range [${whRange.join("-")}]`, { status: 400 });
  }
  if (options.cf.image.height && !inRange(options.cf.image.height as number, whRange)) {
    return new Response(`Invalid height range [${whRange.join("-")}]`, { status: 400 });
  }
  if (options.cf.image.quality && !inRange(options.cf.image.quality as number, qualityRange)) {
    return new Response(`Invalid quality range [${qualityRange.join("-")}]`, { status: 400 });
  }
  if (options.cf.image.rotate && !rotateVals.includes(options.cf.image.rotate as number)) {
    return new Response(`Invalid rotate value [${rotateVals.join("|")}]`, { status: 400 });
  }
  if (options.cf.image.sharpen && !inRange(options.cf.image.sharpen as number, sharpenRange)) {
    return new Response(`Invalid sharpen range [${sharpenRange.join("-")}]`, { status: 400 });
  }
  if (options.cf.image.blur && !inRange(options.cf.image.blur as number, blurRange)) {
    return new Response(`Invalid blur range [${blurRange.join("-")}]`, { status: 400 });
  }

  // Your Worker is responsible for automatic format negotiation. Check the Accept header.
  const accept: string | null = request.headers.get("Accept");
  if (/image\/webp/.test(accept || "")) {
    options.cf.image.format = 'webp';
  } else if (/image\/avif/.test(accept || "")) {
    options.cf.image.format = 'avif';
  }

  try {
    const { hostname, pathname } = new URL(imageURL);

    // Only allow URLs with JPEG, PNG, GIF, or WebP file extensions
    if (!/\.(jpe?g|png|gif|webp)$/i.test(pathname)) {
      return new Response('Disallowed file extension', { status: 400 });
    }
  } catch (err) {
    return new Response('Invalid "image" value', { status: 400 });
  }

  // Build a request that passes through request headers
  const imageRequest: Request = new Request(imageURL, {
    headers: request.headers,
  });

  console.log(options);

  // Returning fetch() with resizing options will pass through response with the resized image.
  return fetch(imageRequest, options);
}

function inRange(v: number, range: [number, number]): boolean {
    const [x, y] = range;
    return v >= x && v <= y;
}
