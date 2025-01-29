require("dotenv").config();

const OpenAI = require("openai");
const launchDarkly = require("@launchdarkly/node-server-sdk");
const launchDarklyAI = require("@launchdarkly/server-sdk-ai");

const ldClient = launchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY);
const ldAiClient = launchDarklyAI.initAi(ldClient);
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generate(kwargs) {
  /**
   * Calls OpenAI's chat completion API to generate some text based on a prompt.
   */

  const context = {
    kind: "user",
    name: "Sandy",
    key: "example-user-key",
  };

  try {
    const aiConfigKey = "diane-tilde-test";
    const defaultValue = new launchDarklyAI.AIConfig({
      enabled: true,
      model: new launchDarklyAI.ModelConfig({ name: "gpt-4" }),
      messages: [],
    });

    const [configValue, tracker] = await ldAiClient.config(
      aiConfigKey,
      context,
      defaultValue,
      kwargs
    );

    const modelName = configValue.model.name;
    console.log("CONFIG VALUE: ", configValue);
    console.log("MODEL NAME: ", modelName);

    const messages = configValue.messages || [];
    const completion = await tracker.trackOpenAIMetrics(async () => {
      return await openaiClient.chat.completions.create({
        model: modelName,
        messages: messages.map((message) => message.toObject()),
      });
    });

    const response = completion.choices[0].message.content;
    console.log("Success.");
    console.log("AI Response:", response);
    return response;
  } catch (error) {
    console.error(error);
  }
}

module.exports = { generate };
