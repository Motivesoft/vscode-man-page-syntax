import * as vscode from 'vscode';

const MAN_PAGE_PATTERNS = [
    /^\.TH\s+[a-zA-Z]+\s+\d+/m,     // .TH TITLE SECTION (ideally should be uppercase, but often isn't)
    /^\.SH\s+[A-Z]+/m,              // Section headers (NAME, SYNOPSIS)
    /^\.B\s+[^\n]+/m,               // Bold text
    /^\.IP\s+\\fB[^\n]+\\fR/m,      // Indented paragraphs
    /^\.\\"[\s\S]*?$/m              // Comments
];

// Look for at least two different matches in a set of common man page patterns
// i.e. don't trigger on two '.SH' clauses, but do if we get a '.TH' and a '.SH'
function isManPage(content: string): boolean {
    let matchCount = 0;
    let result = false;

    for (let index = 0; index < MAN_PAGE_PATTERNS.length; index++) {
        if (MAN_PAGE_PATTERNS[index].test(content)) {
            matchCount++;

			if (matchCount >= 2) {
                result = true;
                break;
            }
        }
    }

    return result; // At least 2 patterns matched
}

export function activate(context: vscode.ExtensionContext) {
    // Whether to monitor document changes (edit, paste, ...) on plaintext documents to automatically
    // identify them as man page documents.
    // Read the setting on activation and then monitor for setting changes to update this flag
    let automaticDetection = vscode.workspace.getConfiguration('vscode-man-page-syntax').get('automaticDetection');

    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('vscode-man-page-syntax.automaticDetection')) {
            automaticDetection = vscode.workspace.getConfiguration('vscode-man-page-syntax').get('automaticDetection');
        }
    });

    // When the document changes, see if it is looking like a man page
    vscode.workspace.onDidChangeTextDocument(event => {
        // Check whether we should we be looking for relevant edits
        if (automaticDetection) {
            const editor = vscode.window.activeTextEditor;
            
            // Only perform the test while the document is plaintext. Once something different has been chosen,
            // assume it is correct and can only be changed by the user
            if (!editor || editor.document.languageId !== 'plaintext') {
                return;
            }
    
            // Scan the document for whether it looks like a man page
            const text = editor.document.getText();
            if (isManPage(text)) {
                // Set the document type
                vscode.languages.setTextDocumentLanguage(editor.document, 'man');
            }
        }
    });
}
