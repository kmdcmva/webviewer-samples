// This file provides mock implementations for the webviewer-ask-ai module,
// allowing developers to test and develop features without relying on actual
// API calls.

// The mock responses are predefined based on specific prompt lines,
// simulating the behavior of the real module in a controlled environment.
const MOCK_RESPONSES = {
  DOCUMENT_QUESTION: 'In 2011, Rosneft undertook several social responsibility initiatives, including: 1. Support for education by providing RUB 141 million to higher education institutions and extending loans totaling RUB 3.6 million to 97 workers for educational courses. 2. Charity efforts focused on socio-economic projects, healthcare, education, culture, and sports, with a total spending of RUB 2.9 billion on charity. 3. Maintenance of social infrastructure, with spending of RUB 1.0 billion aimed at optimizing facilities for employees and communities [14][15].',
  SELECTED_TEXT_SUMMARY: 'The Tuapse license area covers 12,000 square km in the Black Sea and has geological similarities to the West-Kuban Trough, a historic oil production region in Russia [6]. The Tuapse Block has undergone comprehensive 2D seismic work, with the most promising areas also analyzed using 3D seismic technology [6]. Current data indicates the presence of 20 promising structures with an estimated 8.9 billion barrels of recoverable oil resources [6].'
};

// Checks if the application is running in mocking mode,
// which can be determined by checking a specific environment variable.
// This allows developers to easily switch between real and mock 
// implementations based on their development needs.
export const isMockingModeEnabled = () => {
  if (typeof window !== 'undefined')
    return window.MODE_ENV === 'mocking';

  return process.env.NODE_ENV === 'mocking';
};

// Simulates an API call to get a chat response based on
// the provided prompt line. It returns a promise that 
// resolves with the corresponding mock response after a delay,
// mimicking the asynchronous nature of real API calls.
export const getMockChatResponse = (promptLine) => {
  const mockResponse = MOCK_RESPONSES[promptLine] || '';

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockResponse);
    }, 1000);
  });
};