const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const OpenAI = require("openai");
require("dotenv").config();

// Validate required environment variables
function validateEnvironment() {
  const required = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  };

  const missing = [];
  for (const [key, value] of Object.entries(required)) {
    if (!value || value.trim() === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => {
      console.error(`   - ${key}`);
    });
    console.error("\n💡 Fix this by:");
    console.error(
      "   1. Setting environment variables in your deployment platform"
    );
    console.error(
      "   2. For Railway: Go to Dashboard → Variables → Add Variable"
    );
    console.error(
      "   3. For local development: Create a .env file (see .env.example)"
    );
    console.error(
      "\n🔑 Your OpenAI API key should start with 'sk-' and be from https://platform.openai.com/api-keys"
    );

    process.exit(1);
  }

  // Validate OpenAI API key format
  if (!process.env.OPENAI_API_KEY.startsWith("sk-")) {
    console.error(
      "❌ Invalid OpenAI API key format. It should start with 'sk-'"
    );
    process.exit(1);
  }

  console.log("✅ Environment variables validated successfully");
}

// Run validation before initializing the app
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Security middleware
app.use(helmet());

// CORS configuration - update with your frontend domain
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://chrisforti.github.io", "https://your-custom-domain.com"] // Add your actual domains
      : [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://127.0.0.1:5173",
        ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

// Rate limiting - 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: "Too many requests, please try again later.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Logo generation endpoint
app.post("/api/generate-logo", async (req, res) => {
  try {
    const { prompt, logoSettings } = req.body;

    // Validate request
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({
        error: "Prompt is required and must be a non-empty string",
      });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({
        error: "Prompt too long. Maximum 1000 characters.",
      });
    }

    console.log(`🎨 Logo generation request: ${prompt.substring(0, 50)}...`);

    // Enhanced prompt for professional logo generation
    const enhancedPrompt = createLogoPrompt(prompt, logoSettings);

    // Generate 4 logo variations with different styles
    const styles = ["vivid", "natural"];
    const promises = Array.from({ length: 4 }, (_, index) =>
      generateSingleLogo(enhancedPrompt, styles[index % 2])
    );

    const results = await Promise.allSettled(promises);

    const successfulResults = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    const failedCount = results.filter(
      (result) => result.status === "rejected"
    ).length;

    if (failedCount > 0) {
      console.warn(
        `⚠️ ${failedCount} logo generations failed, got ${successfulResults.length} successful results`
      );
    }

    if (successfulResults.length === 0) {
      throw new Error("All logo generation attempts failed");
    }

    console.log(`✅ Generated ${successfulResults.length} logos successfully`);

    res.json({
      success: true,
      images: successfulResults,
      count: successfulResults.length,
      failedCount: failedCount,
    });
  } catch (error) {
    console.error("❌ Logo generation error:", error);

    // Handle specific OpenAI errors
    if (error.status === 429) {
      return res.status(429).json({
        error: "OpenAI rate limit exceeded. Please try again later.",
        type: "rate_limit",
      });
    }

    if (error.status === 401) {
      return res.status(500).json({
        error: "Authentication failed with OpenAI service.",
        type: "auth_error",
      });
    }

    if (error.message?.includes("billing")) {
      return res.status(500).json({
        error: "OpenAI billing limit reached. Please contact administrator.",
        type: "billing_error",
      });
    }

    res.status(500).json({
      error: "Failed to generate logo. Please try again.",
      type: "generation_error",
    });
  }
});

// Generate single logo with OpenAI DALL-E 3
async function generateSingleLogo(prompt, style) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    style: style,
    response_format: "url",
    quality: "standard",
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error("No image URL returned from OpenAI");
  }

  return imageUrl;
}

// Enhanced prompt creation for professional logos
function createLogoPrompt(userPrompt, logoSettings = {}) {
  const {
    logoColor = "#3b82f6",
    backgroundColor = "#ffffff",
    typography = "Arial",
    shape = "circle",
  } = logoSettings;

  return `Create a professional business logo for "${userPrompt}". Include the text "LOGO" prominently in the logo design. Use ${logoColor} (hex: ${logoColor}) as the primary brand color. Apply ${typography} typography style. Incorporate ${shape} geometric shapes or elements. Place on a clean ${backgroundColor} background.

Design requirements:
- Modern, clean, and minimalist aesthetic
- Vector-style with crisp edges and clean geometry
- Professional appearance suitable for corporate branding
- High contrast and excellent readability
- Scalable design that works from business cards to billboards
- Memorable and distinctive visual identity
- Appropriate negative space usage
- Balanced composition and visual hierarchy

Style guidelines:
- Avoid overly complex details or photorealistic elements
- Use flat design principles with subtle depth if needed
- Ensure the logo works in both color and monochrome versions
- Create a timeless design that won't quickly become dated
- Focus on symbolic representation rather than literal imagery`;
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    error: "Internal server error",
    requestId: req.id,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    availableEndpoints: ["/api/health", "/api/generate-logo"],
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Logo API server running on port ${PORT}`);
  console.log(`🔑 OpenAI API configured: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
