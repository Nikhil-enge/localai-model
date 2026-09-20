import {
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  completion,
  unloadModel,
} from "@qvac/sdk";

async function main() {
  let modelId;

  try {
    console.log("Loading QVAC model...");

    modelId = await loadModel({
      modelSrc: LLAMA_3_2_1B_INST_Q4_0,
      onProgress: (progress) => {
        console.log(
          `Downloading: ${progress.percentage.toFixed(0)}%`
        );
      },
    });

    console.log("Model loaded successfully!");

    const result = completion({
      modelId,
      history: [
        {
          role: "user",
          content:
            "Explain JavaScript in two simple sentences.",
        },
      ],
      stream: true,
    });

    console.log("\nAI Response:\n");

    for await (const token of result.tokenStream) {
      process.stdout.write(token);
    }

    console.log("\n\nQVAC inference completed!");
  } catch (error) {
    console.error("QVAC Error:", error);
  } finally {
    if (modelId) {
      await unloadModel({ modelId });
      console.log("\nModel unloaded.");
    }
  }
}

main();