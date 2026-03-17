import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import dotenv from 'dotenv';

dotenv.config();

// LLMManager - Manages LLM initialization, configuration, and execution
// Handles OpenAI chat models, token counting, and text processing
class LLMManager {
  constructor() {
    this.llm = null;
    this.parser = null;
  }

  // Initialize LangChain components (LLM and parser)
  initialize() {
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY in .env file');
      return;
    }

    try {
      this.llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: process.env.OPENAI_MODEL,
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE)
      });

      this.parser = new StringOutputParser();

      if (!this.llm || !this.parser) {
        console.error('Failed to initialize LangChain components');
        return;
      }

      console.log('LangChain initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LangChain components:', error);
    }
  }

  // Check LangChain initialization status
  // @returns {boolean} True if initialized, false otherwise
  isInitialized() {
    if (!this.llm || !this.parser)
      return false;

    return true;
  }

  // Execute messages with LLM and parse response
  // @param {Array} messages - Array of message objects
  // @returns {Promise<string|null>} Parsed response or null if failed
  async executeMessages(messages) {
    if (!this.isInitialized()) {
      console.error('Unable to execute messages - LangChain components are not initialized');
      return null;
    }

    const response = await this.llm.invoke(messages);
    if (!response) {
      console.error('LLM invocation returned no response');
      return null;
    }

    const parsedResponse = await this.parser.parse(response);
    if (!parsedResponse) {
      console.error('Parsing LLM response returned no result');
      return null;
    }

    return parsedResponse;
  }
}

export default LLMManager;