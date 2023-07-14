const vscode = require('vscode');
const path = require('path');
const express = require('express');
const { OpenAIApi, Configuration } = require('openai');

function activate(context) {
  let panel;

  let disposable = vscode.commands.registerCommand('extension.renderFrontend', () => {
    // Create and show a new webview panel
    panel = vscode.window.createWebviewPanel(
      'frontendPreview', // Unique identifier
      'Frontend Preview', // Title displayed in UI
      vscode.ViewColumn.One, // Editor column to show the webview panel
      {
        enableScripts: true, // Enable JavaScript in the webview
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'frontend'))] // Allow local resource access
      }
    );

    // Get the HTML content from the frontend file
    const frontendPath = vscode.Uri.file(path.join(context.extensionPath, 'frontend', 'index.html')).with({ scheme: 'vscode-resource' });
    panel.webview.html = getWebviewContent(context, frontendPath);
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(context, frontendPath) {
  const app = express();

  app.use(express.json());

  // Set up your OpenAI API key
  const api_key = "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";
  const configuration = new Configuration({ apiKey: api_key });
  const openai = new OpenAIApi(configuration);

  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.post('/review', async (req, res) => {
    const codeReview = req.body.codeReview;

    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: ` Use code review practices and provide a detailed review of the following code:\n${codeReview}`,
        temperature: 0,
        max_tokens: 1024,
        n: 1,
        stop: '?'
      });

      const review = response.data.choices[0].text;
      res.json({ review });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred during code review.' });
    }
  });

  app.use('/', express.static(path.join(context.extensionPath, 'frontend')));

  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Frontend Preview</title>
      <style>
        body {
          margin: 0;
        }

        #content {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        #iframeContainer {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      </style>
    </head>
    <body>
      <div id="content">
        <div id="iframeContainer">
          <iframe src="http://localhost:3000" frameborder="0" scrolling="no"></iframe>
        </div>
      </div>
    </body>
  </html>
  `;
}

module.exports = {
  activate
};
