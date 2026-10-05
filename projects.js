window.PROJECTS = [
  {
    title: "AI Deck Studio",
    tier: "featured",
    category: "Applied AI / LLM",
    blurb: "A document-to-deck studio: an LLM drafts the slides and a fine-tuned XTTS v2 voice narrates them. Clone a voice from a short clip, narrate per slide, and export to .pptx or a narrated walkthrough video.",
    tags: ["XTTS v2", "Voice Cloning", "LLM", "PPTX", "FastAPI"],
    repo: null,
    detail: "projects/aippt.html",
    link: null,
    electric: true
  },
  {
    title: "Generative Unit Testing",
    tier: "featured",
    category: "Applied AI / LLM",
    blurb: "A RAG system that indexes a codebase into a vector store, retrieves the most relevant context for a target, and has an LLM draft unit tests grounded in real usage. Prototyped during a data-engineering internship.",
    tags: ["RAG", "LangChain", "Pinecone", "Embeddings", "LLM"],
    repo: null,
    detail: "projects/generative-unit-testing.html",
    link: null
  },
  {
    title: "Game Data Pipeline",
    tier: "featured",
    category: "Data Engineering",
    blurb: "Refactored a games-data ingestion pipeline from row-by-row Pandas to set-based SQL on Redshift and moved derived tables to dbt, feeding a recommendation engine with fresher, more stable data.",
    tags: ["Redshift", "SQL", "dbt", "Prefect", "S3"],
    repo: null,
    detail: "projects/game-data-pipeline.html",
    link: null
  },
  {
    title: "Enterprise Document Search",
    tier: "featured",
    category: "Full-Stack",
    blurb: "Backend for an enterprise web app on a microservice architecture: an ML-powered document search on AWS Kendra (custom S3 connector, suggestions, relevance tuning), a recently-viewed-documents feature, and Mockito test coverage.",
    tags: ["Java", "Spring Boot", "AWS Kendra", "AWS S3", "Microservices", "Mockito"],
    repo: null,
    detail: "projects/enterprise-search.html",
    link: null
  },
  {
    title: "Agentic Graph RAG",
    tier: "featured",
    category: "Applied AI / LLM",
    blurb: "A tool-calling agent that inspects a live knowledge-graph schema, plans and self-corrects read-only Cypher, and grounds every answer in a FalkorDB graph. Model-agnostic across Ollama, OpenAI, and Anthropic.",
    tags: ["Python", "FastAPI", "FalkorDB", "LangChain", "LLM Tool-Calling", "Streamlit"],
    repo: "https://github.com/jerome-neo/agentic-graph-rag",
    detail: "projects/agentic-graph-rag.html",
    link: null
  },
  {
    title: "Self-Hosted Data Lakehouse",
    tier: "featured",
    category: "Data Engineering",
    blurb: "An on-premise, Kubernetes-native data lakehouse platform: a governed catalog (Apache Polaris), SQL warehouses (Trino), elastic Spark, Delta/Iceberg tables on MinIO, and a natural-language (NL-to-SQL) assistant — no SaaS control plane.",
    tags: ["Kubernetes", "Spark", "Trino", "Iceberg", "Delta Lake", "FastAPI", "Next.js"],
    repo: null,
    detail: "projects/data-lakehouse.html",
    link: null
  },
  {
    title: "LiftSim",
    tier: "earlier",
    category: "Full-Stack",
    blurb: "A containerized full-stack Python application for discrete-event elevator simulation, built with an 8-member team on real traffic data collected in NUS's S16 building to compare a proposed dispatch algorithm against the building's baseline.",
    tags: ["Python", "SimPy", "Flask", "Docker", "R"],
    repo: "https://github.com/jerome-neo/LiftSim",
    detail: "projects/liftsim.html",
    link: null
  },
  {
    title: "Moodal",
    tier: "earlier",
    category: "Full-Stack",
    blurb: "A React Native mood-tracking app for students: it detects distress via the Kessler (K10) scale and connects students to help through Psychological First Aid and telemedicine. Third place at NUS Makerthon.",
    tags: ["React Native", "JavaScript", "Mobile"],
    repo: "https://github.com/jerome-neo/Makerthon-2022",
    detail: "projects/moodal.html",
    link: null
  },
  {
    title: "Stock Prediction",
    tier: "earlier",
    category: "Data Engineering",
    blurb: "A comparison of a KNN-style baseline, auto-tuned ARIMA, and a stacked LSTM for AAPL stock price forecasting — including a walk-forward vs. static evaluation of ARIMA. An NUS CS3244 machine-learning project.",
    tags: ["Python", "ARIMA", "LSTM", "KNN"],
    repo: "https://github.com/jerome-neo/Stock-Prediction",
    detail: "projects/stock-prediction.html",
    link: null
  },
  {
    title: "Intermittent Demand Forecasting",
    tier: "earlier",
    category: "Data Engineering",
    blurb: "A*STAR SIMTech research forecasting intermittent military spare-parts demand across 1,998 parts, comparing EEMD-LSTM and EEMD-GRU models at different window sizes.",
    tags: ["Python", "LSTM", "GRU", "EEMD", "R"],
    repo: null,
    detail: "projects/astar-demand-forecasting.html",
    link: "Poster.pdf"
  }
];
