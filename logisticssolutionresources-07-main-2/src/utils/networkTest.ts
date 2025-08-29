// Network connectivity test utility
export const testNetworkConnectivity = async () => {
  const tests = [
    {
      name: 'Supabase API',
      test: async () => {
        const response = await fetch('https://dznbihypzmvcmradijqn.supabase.co/rest/v1/', {
          method: 'HEAD',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQ1NzQsImV4cCI6MjA3MDUzMDU3NH0.dS4mQBL0q_JhsZQF14KKB0nL2f3H--2hPoxXzitPOgo'
          }
        });
        return response.ok;
      }
    },
    {
      name: 'DNS Resolution',
      test: async () => {
        const response = await fetch('https://1.1.1.1/dns-query?name=dznbihypzmvcmradijqn.supabase.co&type=A', {
          method: 'GET',
          headers: {
            'Accept': 'application/dns-json',
          }
        });
        return response.ok;
      }
    },
    {
      name: 'Google Fonts',
      test: async () => {
        const response = await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap', {
          method: 'HEAD'
        });
        return response.ok;
      }
    }
  ];

  const results = [];
  for (const test of tests) {
    try {
      const success = await Promise.race([
        test.test(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      results.push({ name: test.name, status: success ? 'OK' : 'FAILED' });
    } catch (error) {
      results.push({ name: test.name, status: 'ERROR', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  console.table(results);
  return results;
};