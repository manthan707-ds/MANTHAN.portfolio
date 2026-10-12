// Contact details and backend switches for the Contact + Assistant section.
// If you already keep your name and links in src/data/profile.js, import them from there instead.

export const CONTACT = {
  name: "Manthan Ghodkhande",
  email: "manthanghodkhande786@gmail.com",
  links: {
    linkedin: "https://www.linkedin.com/in/manthan-ghodkhande/",
    github: "https://github.com/manthan707-ds",
    resume: "", // put your resume URL here (e.g. "/Manthan_Resume.pdf") and a Resume card appears
  },
  handles: { linkedin: "manthan-ghodkhande", github: "manthan707-ds" },
};

// Leave both empty to run in preview mode (the form sends nothing, the assistant uses the scripted
// answers in assistant.js). When api/contact.js and api/chat.js exist, set them to "/api/contact" and "/api/chat".
export const ENDPOINTS = {
  contact: "", // expects POST { name, email, message } -> 200 on success
  chat: "/api/chat", // expects POST { messages: [{ role, content }] } -> { reply, go? }
};
