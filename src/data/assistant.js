// Everything the assistant says in preview mode. Edit the text here; no need to touch the component.
// Once ENDPOINTS.chat is set, real answers come from api/chat.js and this file is only used for the intro,
// the suggestion cards and the fallback texts.

// The conversation shown when the assistant opens.
export const INTRO_MESSAGES = [
  { who: "bot", intro: true, text: "Hi, I am the assistant for Manthan Ghodkhande\u2019s portfolio. Ask about his background, skills, projects or availability." },
  { who: "me", intro: true, text: "What can I ask you?" },
  { who: "bot", intro: true, text: "Four things: his background, his stack, his projects and whether he is available. Anything else I will politely pass on." },
];

// The cards shown around the ring while the assistant is open. `light` makes a card white.
export const SUGGESTIONS = [
  { label: "About", question: "Who is Manthan?", light: true },
  { label: "Stack", question: "Which tools does he use?" },
  { label: "Projects", question: "Show me his projects" },
  { label: "Status", question: "Is he available for work?", light: true },
  { label: "Contact", question: "How do I contact him?" },
];

// Scripted answers, checked top to bottom. `go` adds a button under the answer that opens the contact form.
export const KB = [
  { match: /(contact|reach|email|get in touch|message|talk to)/i, answer: "The quickest way is the contact page. Send a message there, or copy his email address.", go: "Open contact" },
  { match: /(avail|intern|freelance|hire|open to|full.?time)/i, answer: "Manthan is looking for a data science internship in India and is open to freelance data science work. The contact page is the best way to start a conversation.", go: "Open contact" },
  { match: /(stack|tool|language|tech|skill|framework|python|react)/i, answer: "Python and SQL for data work, NumPy, Pandas and Scikit-learn for analysis and models, TensorFlow and Keras for deep learning, and React, Next.js and Streamlit for building apps. He is currently exploring RAG pipelines and AI agents." },
  { match: /(project|built|build|portfolio|work\b|case)/i, answer: "His featured projects are a RAG-Based AI Assistant, House Price Prediction, Judiciary Case Complexity Prediction and Sales Data Analysis. The Work section has the details for each one." },
  { match: /(who|background|about|study|bio|education|club|introduce)/i, answer: "Manthan Ghodkhande is an aspiring AI engineer focused on data science and machine learning. He is a third-year student and the Technical Director of his college club." },
];

// Questions the assistant politely declines.
export const OFF_TOPIC = /(weather|joke|recipe|poem|stock|bitcoin|crypto|politic|homework|essay|write (me )?(a )?(code|script)|ignore (all|previous|your)|system prompt|password|api key)/i;

export const REFUSAL = "I can only talk about Manthan\u2019s background, skills, projects and availability. Try one of the suggestions.";
export const FALLBACK = "I do not have that in my notes yet. I can help with his background, stack, projects, availability or how to contact him.";
export const ERROR_TEXT = "Something went wrong on my side. Please try again, or use the contact form.";
