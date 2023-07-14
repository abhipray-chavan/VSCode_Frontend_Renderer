(function () {
    const vscode = acquireVsCodeApi();
  
    window.addEventListener('DOMContentLoaded', () => {
      const codeReviewTextarea = document.getElementById('codeReview');
      const reviewButton = document.querySelector('button');
  
      reviewButton.addEventListener('click', () => {
        const codeReview = codeReviewTextarea.value;
        vscode.postMessage({ type: 'reviewCode', codeReview });
      });
    });
  
    vscode.postMessage({ type: 'ready' });
  })();
  