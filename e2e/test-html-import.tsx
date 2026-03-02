import React from "react";
import ReactDOM from "react-dom/client";
import EmailEditor from "../src/app";
import theme from "../src/theme";

const HTML_CONTENT = `
<h1 style="color: #333;">Welcome to our service</h1>
<p>This is a <strong>raw HTML</strong> email template that was imported as a string.</p>
<p>It should be editable in the Html block editor.</p>
`;

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

ReactDOM.createRoot(root).render(
  <EmailEditor
    theme={theme}
    initialTemplate={HTML_CONTENT}
    minHeight="100vh"
    samplesDrawerEnabled={false}
  />,
);
