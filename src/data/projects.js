// YOUR CONTENT — add a new project = add one object to PROJECTS. Nothing else needs to change.

export const PROFILE = {
  name: 'Manthan Ghodkhande',
  email: 'manthanghodkhande786@gmail.com',
  github: 'https://github.com/manthan707-ds',
}

const GH = PROFILE.github

/*
  Fields
  id      unique slug (used in the URL hash when syncHash is on)
  title   project name
  desc    1-2 sentence summary
  cat     categories; the first one is shown on the card
  tech    tech stack pills
  status  e.g. 'Built', 'In Progress', 'Team Project'
  links   [label, url] pairs. Use '#' while a link is not ready: it shows as "soon"
  media   captions for the 3 image slots in the detail panel
  images  OPTIONAL real screenshots, same order as media, e.g. ['/work/rag-1.webp', '/work/rag-2.webp']
          (leave out or leave a slot empty to keep the gradient placeholder)
  look    0-3: which gradient layout the card uses (all colours come from --accent)
*/
// Extra fields (accent, metrics, problem, approach, does, role, highlight, who, challenge, learned,
// decisions, tryText, samples, note) are used by public/work-preview/index.html. Work.jsx ignores them for now.
export const PROJECTS = [
  {
    "id": "rag-based-assistant",
    "title": "RAG Based Assistant",
    "desc": "Lecture Seek: ask a question about the course and get the exact video and timestamp where it is answered.",
    "cat": [
      "Artificial Intelligence",
      "Generative AI"
    ],
    "tech": [
      "Python",
      "LLMs",
      "RAG",
      "Embeddings",
      "AI APIs"
    ],
    "status": "Live",
    "links": [
      [
        "Live Demo",
        "https://rag-based-assistant-psi.vercel.app"
      ],
      ["GitHub", "https://github.com/manthan707-ds/RAG-Based-Assistant-"]
    ],
    "media": [
      "Lecture Seek: chat with timestamps"
    ],
    "look": 0,
    "accent": "#C6FF3D",
    "problem": "Finding the exact moment in a long course video takes forever.",
    "approach": "Retrieval over lecture topics and timestamps, so every answer points to a video and a time instead of a guess.",
    "does": [
      "Answers course questions with the video and start time",
      "Google sign-in keeps your questions",
      "Add lectures and uploads to make them searchable"
    ],
    "metrics": [
      [
        "4",
        "lectures in the demo"
      ],
      [
        "V2 · 0:00",
        "sample answer"
      ]
    ],
    "role": "Designed, built and deployed end to end",
    "highlight": "Timestamps, not guesses.",
    "who": "Students who want the exact lecture moment, fast.",
    "challenge": "Keeping every answer tied to a real video and time, instead of a general reply.",
    "learned": "Good retrieval matters more than a bigger model when answers have to be checkable.",
    "decisions": [
      "Retrieve from lecture topics and timestamps before answering",
      "Link every answer to a video and a start time",
      "Let users add their own lectures and uploads"
    ],
    "tryText": "Ask one of these in the live demo:",
    "samples": [
      "What is the box model?",
      "How do I add a link?",
      "What is a function?"
    ],
    "note": "Preview: uploaded files stay in your browser.",
    "images": [
      "/work/rag-based-assistant.webp"
    ]
  },
  {
    "id": "judicial-triage",
    "title": "JudicialTriage",
    "desc": "A case prioritisation platform that turns judicial pendency data into an overview, case queue and analytics to support informed triage.",
    "cat": [
      "Machine Learning",
      "Data for Social Impact"
    ],
    "tech": [
      "Python",
      "Pandas",
      "Scikit-learn"
    ],
    "status": "Live",
    "links": [
      [
        "Live Demo",
        "https://judicial-triage.vercel.app"
      ],
      ["GitHub", "https://github.com/manthan707-ds/Judicial-Triage"]
    ],
    "media": [
      "Overview dashboard"
    ],
    "look": 2,
    "accent": "#FF9933",
    "problem": "Pending cases pile up, and it is hard to see which matters need attention first.",
    "approach": "One workspace that turns pendency data into an overview, a case queue and analytics, with human oversight kept in the loop.",
    "does": [
      "Overview of pending, priority and undertrial matters",
      "Case queue and analytics views",
      "Alerts for matters that need immediate review"
    ],
    "metrics": [
      [
        "42,581",
        "pending matters"
      ],
      [
        "8,294",
        "priority cases"
      ],
      [
        "1,248",
        "immediate review"
      ]
    ],
    "role": "Designed, built and deployed end to end",
    "highlight": "Human oversight stays in the loop.",
    "who": "Court administrators prioritising pending matters.",
    "challenge": "Showing a lot of case data without burying the matters that need attention first.",
    "learned": "A clear overview and a few strong signals beat a wall of numbers.",
    "decisions": [
      "Lead with an overview of pending, priority and undertrial matters",
      "Keep the case queue and analytics as separate views",
      "Flag matters for immediate review, with human oversight on every recommendation"
    ],
    "tryText": "Explore these areas in the live demo:",
    "samples": [
      "Overview",
      "Case Queue",
      "Analytics",
      "Alerts"
    ],
    "note": "Human oversight remains required for all triage recommendations.",
    "images": [
      "/work/judicial-triage.webp"
    ]
  },
  {
    "id": "offercheck",
    "title": "OfferCheck",
    "desc": "Paste an internship or job message, or upload a screenshot. It flags risky phrases, shows the evidence behind each call and gives a risk score.",
    "cat": [
      "Artificial Intelligence",
      "Trust & Safety"
    ],
    "tech": [
      "RAG",
      "AI APIs",
      "Vercel"
    ],
    "status": "Live",
    "links": [
      [
        "Live Demo",
        "https://offercheck-rag-based.vercel.app"
      ],
      ["GitHub", "https://github.com/manthan707-ds/Offercheck-RAG-based"]
    ],
    "media": [
      "Verdict and flagged phrases"
    ],
    "look": 1,
    "accent": "#2DD4BF",
    "problem": "Fake internship and job offers ask for money and look convincing.",
    "approach": "Scans the message for risky phrases and shows the evidence behind every call, not just a score.",
    "does": [
      "Paste a message or upload a screenshot",
      "Highlights risky phrases with numbered evidence",
      "Gives a risk score, a verdict and what to do next"
    ],
    "metrics": [
      [
        "87",
        "sample risk score"
      ],
      [
        "4",
        "signals flagged in the sample"
      ]
    ],
    "role": "Designed, built and deployed end to end",
    "highlight": "Shows the evidence behind every call.",
    "who": "Students and job seekers checking internship or job messages.",
    "challenge": "Explaining a risk score so people can trust it and check it themselves.",
    "learned": "People act on a verdict when they can see exactly which phrases triggered it.",
    "decisions": [
      "Highlight the exact risky phrases with numbered evidence",
      "Accept a pasted message or a screenshot upload",
      "Give a plain-language next step with every verdict"
    ],
    "tryText": "Paste this into the live demo:",
    "samples": [
      "Congratulations! You are selected for the Data Science Internship. To activate your LMS access, pay dues of Rs 1,499 within 24 hours. Contact us on WhatsApp only."
    ],
    "note": "Avoid pasting passwords, OTPs or payment details.",
    "images": [
      "/work/offercheck.webp"
    ]
  }
]
