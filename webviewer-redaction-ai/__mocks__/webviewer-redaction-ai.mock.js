// This file is used to mock the server responses for document analysis in testing scenarios.

// Mock responses for testing
const MOCK_RESPONSES = {
  analysis: '18th Floor, 2822 Glenoaks St.  \nMargaritaville, QJ  \nHarry Styles  \n291 555 5555  \n8710 Oakarum Bay  \nDotjayess, EH  \n427 555 5555  \nMary B. Dey  \nDamian Nowpleese  \ninfo@peadyeffwrighters.com  \nCarrie Underwood  \n1234-5678-3456-8494  \nJohn Smith  \n8374-3938-3198-0989  \nEdward Harrison  \n8937-1834-0934-1789  \nMary Wang  \n2233-7987-1235-9087  \nLisa Fay  \n6753-2654-0988-1123  \nBen Franklin  \n4455-346543-31003',
  documentId: 'mock-document-id'
};

// Check if mocking mode is enabled
export const isMockingModeEnabled = () => {
  if (typeof globalThis.window !== 'undefined')
    return globalThis.window.MODE_ENV === 'mocking';

  return process.env.NODE_ENV === 'mocking';
};

// Get mock response based on the requested type
export const getMockResponse = (responseType) => {
  switch (responseType) {
    case 'documentId':
      return { documentId: MOCK_RESPONSES.documentId };
    case 'analysis':
      return { analysis: MOCK_RESPONSES.analysis };
    default:
      throw new Error(`Unknown mock response type: ${responseType}`);
  }
};