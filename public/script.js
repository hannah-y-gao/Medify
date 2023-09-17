const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');

messageForm.addEventListener('submit', async (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();
    
    // Get the user's message
    const userMessage = messageInput.value.trim();
    
    // If the user's message is empty, do nothing
    if (!userMessage) return;
    
    // Add the user's message to the messages container
    messages.innerHTML += `<div class="message user-message">${userMessage}</div>`;
    
    // Clear the input field
    messageInput.value = '';


    // Get the bot's response and image
    const [botMessage, imageURL] = await Promise.all([
      getBotResponse(userMessage),
    ]);

    // Split the botMessage string by the numbered items using a regular expression
    const numberedItems = botMessage.split(/\d+\./).filter(Boolean);


    // Create a new div element for each numbered item and append it to the messages container
    numberedItems.forEach((itemText) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "message bot-message";
      itemDiv.textContent = itemText.trim(); // Remove leading/trailing spaces
      messages.appendChild(itemDiv);
    });


    // Scroll to the bottom of the messages container
    messages.scrollTop = messages.scrollHeight;
});

// Function to get the chatbot's response using the GPT API
async function getBotResponse(message) {

    const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You are playing the role of an empathic general practitioner, Sue. Sue has many elderly patients who describe their symptoms to her. For each set of symptoms, you will suggest four possible ailments strongly associated with those symptoms, taking the patients' elderly age into account."
            },
            {
                role: "user",
                content: message
            }
        ],

        temperature: 0.3,
        max_tokens: 2000,
        //top_p: 0.9,
        //frequency_penalty: 0.5,
        //presence_penalty: 0.5
    };

    const response = await fetch('/api/completions', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
        const jsonResponse = await response.json();
        console.log("GPT Response")
        console.log(jsonResponse)
        const botMessage = jsonResponse.choices[0].message.content;
        return botMessage;
    } else {
        console.error('Error fetching GPT API response:', response);
        return 'An error occurred. Please try again.';
    }
}

// Function to get an image URL based on the bot's response using the DALL-E API
async function getImageForBotResponse(botMessage) {
  const prompt = botMessage + " in the style of a virtual reality game";
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const requestBody = {
    model: "image-alpha-001",
    prompt,
    num_images: 1,
    size: "256x256",
    response_format: "url",
  };

  try {
    const response = await fetch('/api/image_gen', {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      console.log("Dalle Response")
      console.log(jsonResponse)
      const imageURL = jsonResponse.data[0].url;
      return imageURL;
    } else {
      console.error("Error fetching DALL-E API response:", response.statusText);
      return "https://via.placeholder.com/256x256?text=Error+Generating+Image";
    }
  } catch (error) {
    console.error("Error fetching DALL-E API response:", error);
    return "https://via.placeholder.com/256x256?text=Error+Generating+Image";
  }
}
