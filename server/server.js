
import express from "express";
import cors from "cors";

import {
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  completion,
  unloadModel,
} from "@qvac/sdk";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Store the loaded model ID
let modelId = null;

// Load QVAC model
async function initializeModel() {
  console.log("Loading QVAC model...");

  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    onProgress: (progress) => {
      console.log(
        `Downloading: ${progress.percentage.toFixed(0)}%`
      );
    },
  });

  console.log("QVAC model loaded successfully!");
}

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "LocalStudy AI backend is running!",
    qvacLoaded: modelId !== null,
  });
});

// Summarize notes endpoint
app.post("/api/summarize", async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes || !notes.trim()) {
      return res.status(400).json({
        error: "Please provide study notes.",
      });
    }

    if (!modelId) {
      return res.status(503).json({
        error: "QVAC model is not ready yet.",
      });
    }

    console.log("Generating summary...");

    const result = completion({
      modelId,
      history: [
        {
          role: "user",
          content: `Summarize the following study notes
in simple, clear language.

Study Notes:
${notes}`,
        },
      ],
      stream: true,
    });

    let summary = "";

    for await (const token of result.tokenStream) {
      summary += token;
    }

    console.log("Summary generated successfully!");

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Summarization error:", error);

    res.status(500).json({
      error: "Failed to generate summary.",
      details: error.message,
    });
  }
});

// Start server after loading model
async function startServer() {
  try {
    await initializeModel();

    app.listen(PORT, () => {
      console.log(`\nLocalStudy AI server running at:`);
      console.log(`http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  console.log("\nShutting down server...");

  if (modelId) {
    await unloadModel({ modelId });
    console.log("QVAC model unloaded.");
  }

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();