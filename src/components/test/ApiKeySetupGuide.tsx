import React, { useState } from 'react';

const ApiKeySetupGuide: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px' }}>
      <h1>🔧 Resend API Key Setup Guide</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '5px' }}>
        <h3>⚠️ 401 Error Fix</h3>
        <p>The 401 error means your API key is either missing, invalid, or expired. Follow these steps to fix it:</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Step 1: Get Your API Key</h2>
        <ol>
          <li>Go to <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer">Resend API Keys</a></li>
          <li>Sign in to your Resend account</li>
          <li>Click "Create API Key"</li>
          <li>Give it a name (e.g., "LSR Transport")</li>
          <li>Copy the generated key (it starts with <code>re_</code>)</li>
        </ol>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Step 2: Add to Environment File</h2>
        <ol>
          <li>Open your <code>.env</code> file in your project root</li>
          <li>Add this line (replace with your actual key):</li>
        </ol>
        <pre style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', border: '1px solid #dee2e6' }}>
VITE_RESEND_API_KEY=re_your_actual_key_here
        </pre>
        <p><strong>Important:</strong> Don't include quotes around the API key!</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Step 3: Restart Development Server</h2>
        <ol>
          <li>Stop your development server (Ctrl+C)</li>
          <li>Run <code>npm run dev</code> again</li>
          <li>This ensures the new environment variable is loaded</li>
        </ol>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Step 4: Test Your Configuration</h2>
        <ol>
          <li>Go to <a href="/api-diagnostic">API Diagnostic Tool</a></li>
          <li>Run the diagnostics to verify your setup</li>
          <li>If successful, test email sending</li>
        </ol>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Common Issues & Solutions</h2>
        
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '5px' }}>
          <h4>❌ "API key not found"</h4>
          <p><strong>Solution:</strong> Make sure your <code>.env</code> file is in the project root and contains the correct variable name.</p>
        </div>

        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '5px' }}>
          <h4>❌ "Invalid API key format"</h4>
          <p><strong>Solution:</strong> API keys must start with <code>re_</code>. Check that you copied the full key.</p>
        </div>

        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#d1ecf1', border: '1px solid #bee5eb', borderRadius: '5px' }}>
          <h4>❌ "401 Unauthorized"</h4>
          <p><strong>Solution:</strong> Your API key is invalid or expired. Generate a new one from the Resend dashboard.</p>
        </div>

        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '5px' }}>
          <h4>❌ "CORS error"</h4>
          <p><strong>Solution:</strong> This usually means the API key is invalid. Double-check your key and restart the dev server.</p>
        </div>
      </div>

      <button 
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{ 
          backgroundColor: '#6c757d', 
          color: 'white', 
          border: 'none', 
          padding: '10px 20px', 
          borderRadius: '5px', 
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Configuration
      </button>

      {showAdvanced && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '5px' }}>
          <h3>Advanced Configuration</h3>
          
          <h4>Environment File Location</h4>
          <p>Your <code>.env</code> file should be in the same directory as your <code>package.json</code> file.</p>
          
          <h4>File Structure</h4>
          <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '3px' }}>
your-project/
├── .env                    ← Your API key goes here
├── package.json
├── src/
└── ...
          </pre>

          <h4>Environment Variable Format</h4>
          <p>For Vite projects, environment variables must be prefixed with <code>VITE_</code>:</p>
          <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '3px' }}>
# ✅ Correct
VITE_RESEND_API_KEY=re_1234567890abcdef

# ❌ Wrong (no VITE_ prefix)
RESEND_API_KEY=re_1234567890abcdef

# ❌ Wrong (quotes around value)
VITE_RESEND_API_KEY="re_1234567890abcdef"
          </pre>

          <h4>Verification Commands</h4>
          <p>You can verify your environment variables are loaded:</p>
          <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '3px' }}>
# Check if .env file exists
ls -la .env

# View .env contents (be careful not to share this)
cat .env

# Check if Vite is loading the variable
echo $VITE_RESEND_API_KEY
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '5px' }}>
        <h3>✅ Next Steps</h3>
        <ol>
          <li>Follow the setup steps above</li>
          <li>Test with the <a href="/api-diagnostic">API Diagnostic Tool</a></li>
          <li>Try sending a test email</li>
          <li>If you still have issues, check the Resend documentation</li>
        </ol>
      </div>
    </div>
  );
};

export default ApiKeySetupGuide;
