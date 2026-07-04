import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON parsing with a larger limit for screenshots
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Initialize Google Gen AI
function getAiClient(req: express.Request) {
  let key = req.headers['x-gemini-api-key'] as string;
  
  if (!key || key === 'undefined' || key === 'null') {
    key = process.env.GEMINI_API_KEY || '';
  }
  
  if (!key.trim() || key === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY যুক্ত করা নেই! এটি ঠিক করতে Google AI Studio-এর Settings > Secrets প্যানেলে যান এবং GEMINI_API_KEY নামের সিক্রেট তৈরি করে আপনার API Key বসান। অথবা এই ওয়েবসাইটের নিচে 'ডেভেলপার সেটিংস' প্যানেলে সরাসরি আপনার API Key দিতে পারেন।");
  }

  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// --------------------------------------------------------
// API ENDPOINTS
// --------------------------------------------------------

// 1. Identify Screenshot (Extract info from Fiverr review/profile image)
app.post("/api/identify-screenshot", async (req, res) => {
  try {
    const { image } = req.body; // base64 image data without prefix "data:image/...;base64,"
    if (!image) {
      return res.status(400).json({ error: "Image data is required" });
    }

    const ai = getAiClient(req);

    // Setup the image part for Gemini
    const imagePart = {
      inlineData: {
        mimeType: "image/png",
        data: image.replace(/^data:image\/\w+;base64,/, "")
      }
    };

    const textPart = {
      text: `Analyze this screenshot of a Fiverr review or client profile page. 
Extract the following information to help us find their real social media profiles (e.g. LinkedIn, Twitter, Facebook, Instagram):

1. Client Username: This is the Fiverr buyer's handle (e.g., lily_s4, hanvepro, satisfaction). Look for reviewer usernames.
2. Client Country: The country shown under the reviewer's name (e.g., United States, United Kingdom, Canada, Bangladesh).
3. Review Text: The actual text written by the client as a review (e.g., "Had a great experience..."). 
4. Gig Niche/Category: The context of the service (e.g., Video Editing, Logo Design, Web Development). Look at review text, headers, or any clues in the screenshot.
5. Profile Picture Visual Description: Briefly describe the client's profile picture if visible (e.g. "Woman with dark hair, outdoor setting", "Graphic abstract avatar", or "No picture").
6. Freelancer's Name/Alias: If there is any mention of the freelancer/seller's name (e.g., Abdul, Hanan, etc.), capture it so we don't mistake them for the client.

Return the result STRICTLY as a JSON object with this exact schema:
{
  "username": "string (the client's Fiverr username)",
  "country": "string (client's country, empty if not found)",
  "niche": "string (gig niche/topic, e.g. 'Video Editing')",
  "reviewText": "string (the actual text of the review, empty if none)",
  "imageDescription": "string (brief visual description of profile photo, empty if none)",
  "freelancerName": "string (the seller's name/username if identified, empty if none)"
}`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, textPart],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            username: { type: Type.STRING, description: "Fiverr buyer's username" },
            country: { type: Type.STRING, description: "Country of the buyer" },
            niche: { type: Type.STRING, description: "Service niche (e.g., Video Editing, Logo Design)" },
            reviewText: { type: Type.STRING, description: "Text of the review" },
            imageDescription: { type: Type.STRING, description: "Visual description of the buyer's profile image" },
            freelancerName: { type: Type.STRING, description: "Name of the freelancer/seller if mentioned" },
          },
          required: ["username"]
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/identify-screenshot:", error);
    res.status(500).json({ error: error.message || "Failed to analyze screenshot" });
  }
});

// 2. Search Client (Search social media profiles using Google Search Grounding)
app.post("/api/search-client", async (req, res) => {
  try {
    const { username, country, niche, reviewText } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Fiverr Username is required to search" });
    }

    const ai = getAiClient(req);

    // We formulate a detailed prompt instructing Gemini to run search queries.
    // We want it to look for exact handles on LinkedIn, Twitter, Facebook, Instagram, GitHub, etc.,
    // matching the username, country, and niche of the client.
    const prompt = `Search the internet for the real social media profiles of a person who uses the Fiverr username/buyer handle "${username}".
Here are the clues to identify them and filter out incorrect matches:
- Fiverr Handle: ${username}
- Client Location/Country: ${country || "Unknown"}
- Freelance Service Niche: ${niche || "Freelance work"}
- Client's Review Content: ${reviewText ? `"${reviewText}"` : "None"}

Please execute Google search queries using the googleSearch tool to locate:
1. LinkedIn profiles (look for the handle "${username}" in the URL or name, or search LinkedIn for users named "${username}" or containing "${username}" associated with "${country}" and "${niche}").
2. Twitter / X profiles matching "${username}" or similar handle.
3. GitHub profile (especially if technical niche).
4. Facebook and Instagram profiles with the handle "${username}".
5. Any personal or corporate website referencing "${username}".

Analyze the search results carefully. Determine which profiles are most likely to belong to this Fiverr client. 
Calculate a confidence score (HIGH, MEDIUM, LOW) for each match. Write a rationale explaining why you think it's a match (e.g., "Username matches exactly", "Location matches United States and industry matches Video Production").

Provide your final response STRICTLY in the following JSON format:
{
  "results": [
    {
      "platform": "linkedin | twitter | facebook | instagram | github | web",
      "url": "full URL of the social profile",
      "displayName": "The name shown on the profile (e.g. John Doe)",
      "handle": "The social handle or username (e.g. johndoe)",
      "confidence": "HIGH | MEDIUM | LOW",
      "matchReason": "Brief explanation of the matching signals (e.g., exact username match, location matching)",
      "summary": "Short 1-sentence bio or context extracted from search results"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            results: {
              type: Type.ARRAY,
              description: "List of found social media profiles with high similarity matching",
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING, description: "Must be one of: linkedin, twitter, facebook, instagram, github, web" },
                  url: { type: Type.STRING, description: "Direct URL link to the profile" },
                  displayName: { type: Type.STRING, description: "Name of the person on this platform" },
                  handle: { type: Type.STRING, description: "The handle or username on this platform" },
                  confidence: { type: Type.STRING, description: "HIGH, MEDIUM, or LOW confidence" },
                  matchReason: { type: Type.STRING, description: "Why this profile is a match" },
                  summary: { type: Type.STRING, description: "Short bio or description of the profile" }
                },
                required: ["platform", "url", "displayName", "confidence", "matchReason"]
              }
            }
          },
          required: ["results"]
        }
      }
    });

    const resultText = response.text || '{"results": []}';
    let parsedData;
    try {
      parsedData = JSON.parse(resultText);
    } catch (e) {
      console.error("Failed to parse JSON response from Gemini:", resultText);
      // Fallback extraction logic using Regex if JSON schema fails or gets truncated
      parsedData = { results: [] };
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/search-client:", error);
    res.status(500).json({ error: error.message || "Search failed" });
  }
});


// --------------------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// --------------------------------------------------------

async function startServer() {
  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server loaded as middleware");
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production files from dist/");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fiverr Client Social Identifier server running on http://localhost:${PORT}`);
  });
}

startServer();
