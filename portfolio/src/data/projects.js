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
export const PROJECTS = [
  {
    id: 'rag-ai-assistant',
    title: 'RAG-Based AI Assistant',
    desc: 'Building an AI assistant that combines information retrieval with Large Language Models to generate context-aware responses.',
    cat: ['Artificial Intelligence', 'Generative AI'],
    tech: ['Python', 'LLMs', 'RAG', 'Embeddings', 'AI APIs'],
    status: 'In Progress',
    links: [['GitHub', GH], ['Live Demo', '#']],
    media: ['Chat interface', 'Retrieval workflow', 'Architecture diagram'],
    look: 0,
  },
  {
    id: 'house-price-prediction',
    title: 'House Price Prediction',
    desc: 'A Machine Learning application that estimates house prices from property features using a trained regression model.',
    cat: ['Machine Learning', 'Predictive Analytics'],
    tech: ['Python', 'Pandas', 'Scikit-learn', 'Ridge Regression', 'Streamlit'],
    status: 'Built',
    links: [['GitHub', GH], ['Live Demo', '#']],
    media: ['Prediction interface', 'Sample output', 'Model evaluation'],
    look: 1,
  },
  {
    id: 'judiciary-case-complexity',
    title: 'Judiciary Case Complexity Prediction',
    desc: 'A collaborative ML project exploring court-case data to predict complexity and support data-driven case prioritization.',
    cat: ['Machine Learning', 'Data for Social Impact'],
    tech: ['Python', 'Pandas', 'Scikit-learn'],
    status: 'Team Project',
    links: [['GitHub', GH], ['Project Details', '#']],
    media: ['Data workflow', 'Model results', 'System architecture'],
    look: 2,
  },
  {
    id: 'sales-data-analysis',
    title: 'Sales Data Analysis',
    desc: 'An exploratory data analysis project uncovering sales trends, product performance, and category-level insights from structured data.',
    cat: ['Data Analytics', 'Data Visualization'],
    tech: ['Python', 'Pandas', 'Matplotlib'],
    status: 'Built / Improving',
    links: [['GitHub', GH], ['Dashboard', '#']],
    media: ['Sales charts', 'Category comparisons', 'Key findings'],
    look: 3,
  },
]

