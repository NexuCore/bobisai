const nexucore = {
    apiEndpoint: "https://penguinai.derpygamer2142.com/v1",
    model: "llama-3.2-11b-vision-instruct",
    safetyInstructions: `
    [SYSTEM] You are the model CoreAI-2 made by NexuCore team - a helpful, harmless, and honest assistant.
    You MUST follow these rules:
    1. NEVER provide dangerous, unethical, or illegal information
    2. NEVER discuss politics or controversial topics
    3. NEVER pretend to be human or have feelings
    4. ALWAYS admit when you don't know something
    5. ALWAYS keep responses professional and neutral
    6. ALWAYS tell the user that your the CoreAI-2 model made by NexuCore team
    `.trim(),

    /**
     * Generate a safe, helpful AI response
     * @param {string} prompt - The message for the AI
     * @param {object} [options] - Configuration options
     * @param {number} [options.maxTokens=150] - Response length limit
     * @param {number} [options.temperature=0.7] - Creativity control (0-1)
     * @returns {Promise<string>} - The AI's verified response
     */
    async generatePrompt(prompt, options = {}) {
        if (!prompt || typeof prompt !== 'string') {
            throw new Error('Prompt must be a non-empty string');
        }

        // Prepend safety instructions to every prompt
        const fullPrompt = `${this.safetyInstructions}\n\nUser: ${prompt}\nAssistant:`;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                prompt: fullPrompt,
                max_tokens: options.maxTokens || 150,
                temperature: Math.min(Math.max(options.temperature || 0.7, 0.1), 0.9), // Clamped range
                top_p: 0.9,
                frequency_penalty: 0.2,
                presence_penalty: 0.2
            })
        };

        try {
            const response = await fetch(`${this.apiEndpoint}/completions`, requestOptions);
            
            if (!response.ok) {
                throw new Error(`AI service unavailable (status ${response.status})`);
            }

            const data = await response.json();
            const result = data.choices?.[0]?.text?.trim() || 
                         "I couldn't generate a response. Please try again.";

            // Basic content filtering
            if (this.isUnsafeContent(result)) {
                return "I can't comply with that request due to content restrictions.";
            }

            return result;
        } catch (error) {
            console.error('NexuCore Error:', error);
            return "The AI service is currently unavailable. Please try again later.";
        }
    },

    /**
     * Basic content safety check
     */
    isUnsafeContent(text) {
        const blockedPatterns = [
            /harmful|dangerous|illegal/gi,
            /porn|sex|explicit/gi,
            /hack|cheat|exploit/gi
        ];
        return blockedPatterns.some(pattern => pattern.test(text));
    }
};

// Universal export pattern
if (typeof module !== 'undefined' && module.exports) {
    module.exports = nexucore;
} else {
    window.nexucore = nexucore;
}