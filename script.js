const client = ZAFClient.init();

async function updateSummary() {
  console.log('Updating summary...');
  try {
    const convo = await getTicketConvo();
    const prompt = await getPrompt(convo);
    const summary = await getSummary(prompt);
    const container = document.getElementById("container");
    if (container) {
      container.innerText = summary;
      console.log('Summary updated.');
    } else {
      console.log('Container element not found.');
    }
  } catch (error) {
    const container = document.getElementById("container");
    container.innerText = "Error generating summary";
    console.error(error);
  }
}
async function getTicketConvo() {
  console.log('Getting ticket conversation...');
  const ticketConvo = await client.get("ticket.conversation");
  console.log('Ticket conversation response:', ticketConvo);
  return JSON.stringify(ticketConvo.ticket.conversation);
}
async function getPrompt(convo) {
  console.log('Generating prompt...');
  return `
Summarize the following customer service interaction and detect the customer's sentiment in the following format:
Summary:
Customer sentiment:
Key Information:
${JSON.parse(convo)}`;
}
async function getSummary(prompt) {
  console.log('Generating summary...');
  const options = {
    url: "https://api.openai.com/v1/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + client.get("settings.openAiApiToken"),
    },
    data: JSON.stringify({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.6,
      max_tokens: 200,
    }),
  };
  try {
    const response = await client.request(options);
    console.log('Summary generation response:', response);
    return response.choices[0].text.trim();
  } catch (error) {
    const container = document.getElementById("container");
    container.innerText = "Error generating summary";
    console.error(error);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  client.invoke("resize", { width: "100%", height: "400px" });
  updateSummary();
});
client.on("ticket.conversation.changed", () => {
  updateSummary();
});
