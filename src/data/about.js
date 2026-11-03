// Edit this file only. All About section text lives here.
export const about = {
  headline: "Not here to fit in. Here to build what\u2019s next.",
  facts: [
    { label: "Name", text: "Manthan Ghodkhande", strong: true },
    { label: "Technically", text: "Third-year data science student and Technical Director of my college club. I build with Python, SQL, ML and React." },
    { label: "Strengths", text: "Leadership, ownership, and learning fast." },
    { label: "Moving towards", text: "AI, deeper every month: RAG and LLM-powered apps." },
  ],
  closing: "I\u2019d rather ship a rough version today than a perfect one never.",
  availability: "Open to internships and freelance, India",
  // Put your resume PDF in /public (for example public/resume.pdf) and keep this path.
  resume: { label: "Download r\u00e9sum\u00e9", href: "/resume.pdf" },
  treeTitle: "How it all connects",
  treeHint: "Pick a node to open that branch. Move your cursor through the leaves.",
  panelIdle: { title: "Start anywhere", text: "Each node opens one part of my story." },
  // x / y are percentages of the tree box. "pills" are optional; give href to make one a link.
  nodes: [
    { label: "Education", x: 14, y: 30, text: "Third-year student, fifth semester. Data science and machine learning is the main track, with web development alongside it." },
    { label: "Projects", x: 72, y: 16, text: "Three things I\u2019ve shipped.",
      pills: [
        { label: "RAG Based Assistant", href: "#work" },
        { label: "OfferCheck", href: "#work" },
        { label: "Judicial triage (SIH 2026)", href: "#work" },
      ] },
    { label: "Club", x: 12, y: 62, text: "Technical Director of my college club. I lead the tech side and push the team to ship real things." },
    { label: "Goals", x: 46, y: 90, text: "A data science internship in India, plus freelance data work. Keep shipping in public." },
  ],
};
