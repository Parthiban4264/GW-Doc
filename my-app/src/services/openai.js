const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export const generateRequirementsFromDescription = async (screenName, description, imageBase64) => {
  try {
    // Remove data URL prefix if present
    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview-1106",
        messages: [
          {
            role: "system",
            content: "You are a technical requirements analyst. Generate detailed requirements for UI screens based on descriptions and images."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Generate detailed requirements for a screen named "${screenName}" with this description: "${description}". Include sections for Purpose, User Actions, Technical Requirements, Data Requirements, Validation Rules, and Error Handling.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API call failed: ${response.statusText}\n${JSON.stringify(
          errorData,
          null,
          2
        )}`
      );
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenAI API");
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating requirements:", error);
    throw error;
  }
};

export const generateAPIDocumentation = async (appFlow) => {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an API documentation specialist. Generate comprehensive API documentation based on application flows.",
          },
          {
            role: "user",
            content: `Generate detailed API documentation including endpoints, request/response structures, and examples based on this application flow:\n\n${appFlow}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating API documentation:", error);
    throw error;
  }
};
