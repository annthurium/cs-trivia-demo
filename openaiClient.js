require("dotenv").config();

const OpenAI = require("openai");
const launchDarkly = require("@launchdarkly/node-server-sdk");
const launchDarklyAI = require("@launchdarkly/server-sdk-ai");

const LD_CONFIG_KEY = "model-upgrade";
const DEFAULT_CONFIG = {
  enabled: true,
  model: { name: "gpt-4" },
  messages: [],
};

// In a real app you'd fill in this example data
const userContext = {
  kind: "user",
  name: "Mark",
  email: "mark.s@lumonindustries.work",
  key: "example-user-key",
};

const ldClient = launchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY);
const ldAiClient = launchDarklyAI.initAi(ldClient);
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generate(options = {}) {
  /**
   * Generates text using OpenAI's chat completion API.
   * @param {Object} options - Configuration options for the generation
   * @returns {Promise<string|null>} The generated text or null if an error occurs
   */
  try {
    const configValue = await ldAiClient.config(
      LD_CONFIG_KEY,
      userContext,
      DEFAULT_CONFIG,
      options
    );

    const {
      model: { name: modelName },
      tracker,
      messages = [],
    } = configValue;

    console.log("model: ", configValue.model);
    const completion = await tracker.trackOpenAIMetrics(async () =>
      openaiClient.chat.completions.create({
        model: modelName,
        messages,
      })
    );

    const response = completion.choices[0].message.content;

    return response;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return null; // or throw error depending on your error handling strategy
  }
}

module.exports = { generate };
