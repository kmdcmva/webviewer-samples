import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import LLMManager from './llmManager.js';
import InMemoryStore from './inMemoryStore.js';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

// Load configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, './config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const { guardRail } = config;

// Create LLMManager instance
const llmManager = new LLMManager();
// Create InMemoryStore instance for managing documents and analysis results with TTL and max entry limits to optimize memory usage and ensure timely cleanup of stale data.
const inMemoryStore = new InMemoryStore();

export default function registerHandlers(app) {
  // Initialize LangChain on startup
  llmManager.initialize();

  // Prepare assistant prompt with PII classifications and guardrail rules
  let prepareAssistantPrompt = (guardRail) => {
    let prompt = guardRail.assistantPrompt.replace('PIICLASSIFICATIONSPLACEHOLDER', guardRail.piiClassifications.flatMap(item => item.details).join(', '));
    prompt += guardRail.rulesSet.map(rule => `${rule}`).join(' ');
    return prompt;
  };

  // Create system prompt message
  let systemMessage = prepareAssistantPrompt(guardRail);
  systemMessage = new SystemMessage(systemMessage);

  // Endpoint to receive document text from client
  app.post('/api/send-text', async (request, response) => {
    try {
      const { documentText } = request.body;

      if (!documentText) {
        return response.status(400).json({
          error: 'No document text provided',
          success: false
        });
      }

      // Generate unique document ID
      const documentId = `doc_${Date.now()}_${randomBytes(9).toString('base64url')}`;

      // Store raw document text in memory with associated metadata such as text length.
      // This allows for later retrieval and analysis while optimizing memory usage by not retaining the raw text longer than necessary.
      inMemoryStore.storeDocument(documentId, documentText);

      response.json({
        success: true,
        message: 'Document text received successfully',
        documentId: documentId,
        textLength: documentText.length,
        receivedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error receiving document text:', error);
      response.status(500).json({
        error: 'Failed to receive document text',
        details: error.message,
        success: false
      });
    }
  });

  // Endpoint to analyze document for PII
  app.post('/api/analyze-pii', async (request, response) => {
    try {
      const { documentId } = request.body;

      if (!documentId) {
        return response.status(400).json({
          error: 'No document ID provided',
          success: false
        });
      }

      // Retrieve document from storage
      const document = inMemoryStore.getDocument(documentId);
      if (!document) {
        return response.status(404).json({
          error: 'Document not found',
          success: false
        });
      }

      // Check if LangChain is ready for AI processing
      if (!llmManager.isInitialized())
        return response.status(500).json({
          error: 'LangChain not available. Please check server configuration.'
        });

      // AI processing with LangChain for PII detection
      const humanMessage = new HumanMessage(document.text);
      const aiResult = await llmManager.executeMessages([systemMessage, humanMessage]);

      // Store analysis results
      const analysisData = {
        success: true,
        message: 'Document analyzed successfully with AI',
        documentId: documentId,
        aiProcessing: true,
        analyzedAt: new Date().toISOString(),
        analysis: aiResult
      };

      // Store analysis results in memory and release raw document text to optimize memory usage
      inMemoryStore.storeAnalysis(documentId, analysisData);

      response.json({
        success: true,
        message: 'PII analysis completed',
        documentId: documentId,
        analyzedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error analyzing document for PII:', error);
      response.status(500).json({
        error: 'Failed to analyze document for PII',
        details: error.message,
        success: false
      });
    }
  });

  // Endpoint to send results back to client
  app.get('/api/get-results/:documentId', async (request, response) => {
    try {
      const { documentId } = request.params;

      if (!documentId) {
        return response.status(400).json({
          error: 'No document ID provided',
          success: false
        });
      }

      // Retrieve analysis results from storage
      const results = inMemoryStore.getAnalysis(documentId);
      if (!results) {
        return response.status(404).json({
          error: 'Analysis results not found',
          success: false,
          message: 'Document may not have been analyzed yet or analysis failed'
        });
      }

      response.json(results);
    } catch (error) {
      console.error('Error retrieving analysis results:', error);
      response.status(500).json({
        error: 'Failed to retrieve analysis results',
        details: error.message,
        success: false
      });
    }
  });
}