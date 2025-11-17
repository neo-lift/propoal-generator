/* eslint-disable @typescript-eslint/no-require-imports */
// Load environment variables from .env.local
// This file runs before modules are imported (via setupFiles)
require('dotenv').config({ path: '.env.local' });

// Polyfill for TransformStream (needed for AI SDK in Jest)
// TransformStream is available in Node.js 16.5+ but may need polyfill for Jest
// Using require() here is necessary for conditional module loading
if (typeof globalThis.TransformStream === 'undefined') {
  try {
    // Try to use the built-in stream/web module (Node.js 18+)
    const { TransformStream } = require('stream/web');
    globalThis.TransformStream = TransformStream;
    global.TransformStream = TransformStream;
  } catch (streamModuleError) {
    // Fallback: use web-streams-polyfill
    console.warn('Falling back to web-streams-polyfill:', streamModuleError);
    const { TransformStream } = require('web-streams-polyfill/ponyfill/es2018');
    globalThis.TransformStream = TransformStream;
    global.TransformStream = TransformStream;
  }
}

