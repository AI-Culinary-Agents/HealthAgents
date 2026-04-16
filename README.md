# HealthAgents

A personalized meal plan recommendation system powered by a 6-agent LangGraph pipeline. Users describe their dietary preferences and goals; the system researches, grades, generates, and validates a meal plan using real-time web data — with self-correcting loops at both the research and generation stages.

## Table of Contents

- [Architecture](#architecture)
  - [Agent Pipeline](#agent-pipeline)
  - [Dual-Loop Design](#dual-loop-design)
  - [Checkpoint Persistence](#checkpoint-persistence)
  - [Connection Pooling](#connection-pooling)
- [Agents](#agents)
  - [Interpreter](#1-interpreter-agent)
  - [Planner](#2-planner-agent)
  - [Research Plan](#3-research-plan-agent)
  - [Grader](#4-grader-agent)
  - [Generator](#5-generator-agent)
  - [Reviewer](#6-reviewer-agent)
- [Auth](#auth)
- [Real-Time Progress](#real-time-progress)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Acknowledgements](#acknowledgements)

---

## Architecture

### Agent Pipeline

The workflow is a 6-agent LangGraph state machine. Each agent reads from and writes to a shared `AgentState` object. The graph compiles to a directed graph with conditional edges that implement two self-correcting loops.

```
User Input
    │
    ▼
[Interpreter] ── off-topic? ──► END
    │
    ▼
[Planner]
    │
    ▼
[Research Plan] ◄──────────────────────┐
    │                                  │
    ▼                                  │
[Grader]                               │
    │                                  │
    ├── grading_score < 20 AND         │
    │   search_number < max ───────────┘  (research loop)
    │
    ▼
[Generator] ◄──────────────────────────┐
    │                                  │
    ▼                                  │
[Reviewer]                             │
    │                                  │
    ├── hallucination_score > 50 AND   │
    │   revision_number < max ─────────┘  (revision loop)
    │
    ▼
   END
```

### Dual-Loop Design

Two conditional branches are defined in `graph/graph.py`:

**Research loop** — after the Grader node:
```python
def should_research(state):
    if state["grading_score"] < 20 and state["search_number"] < state["max_searches"]:
        return "research_plan"
    return "generate"
```
If the grader determines less than 20% of retrieved content is relevant, the graph loops back to Research Plan and tries new queries.

**Revision loop** — after the Reviewer node:
```python
def should_revise(state):
    if state["hellucination_score"] > 50 and state["revision_number"] < state["max_revisions"]:
        return "generate"
    return END
```
If the reviewer scores the generated output above the hallucination threshold, it loops back to Generator for a revised response.

### Checkpoint Persistence

Agent state is persisted to PostgreSQL after every node execution using a custom `PostgresSaver` (`graph/postgres_saver.py`) that extends LangGraph's `BaseCheckpointSaver`.

The saver implements:
- `JsonAndBinarySerializer` — handles both JSON-serializable state and raw `bytes`/`bytearray` fields by encoding binary data as hex before writing to a `BYTEA` column
- Both sync (`put`, `get_tuple`, `list`) and async (`aput`, `aget_tuple`, `alist`) interfaces
- `UPSERT` on `(thread_id, thread_ts)` primary key — safe to call repeatedly without creating duplicate checkpoint rows
- Two tables: `checkpoints` (full state snapshots) and `writes` (pending intermediate writes per task/channel)

### Connection Pooling

Connection pooling (`max_size=20`) was implemented because LangGraph's checkpointer writes state to Postgres after every node execution. A single connection isn't thread-safe under concurrent load, and opening a new TCP connection per checkpoint write adds unnecessary overhead. The pool keeps connections alive across the app lifetime and reuses them per operation.

`max_size=20` was chosen to stay within free-tier Postgres connection limits while supporting multiple concurrent workflow runs.

---

## Agents

### 1. Interpreter Agent

Screens the user's input before entering the main workflow. If the request is off-topic (not related to nutrition, meals, or health), the graph terminates early rather than running the full pipeline.

### 2. Planner Agent

Takes the user's raw input and produces a structured initial meal plan — dietary restrictions, goals, and available ingredients distilled into a plan that downstream agents use as context.

```python
messages = [
    SystemMessage(content=PLAN_PROMPT),
    HumanMessage(content=state['task'])
]
response = model.invoke(messages)
return {"plan": response.content}
```

### 3. Research Plan Agent

Generates search queries using Pydantic-validated structured output, then executes each query against the Tavily web search API. Structured output forces the LLM to emit a validated list of queries before any search is performed.

```python
queries = model.with_structured_output(Queries).invoke([
    SystemMessage(content=RESEARCH_PROMPT),
    HumanMessage(content=f"{state['task']}\n\nHere is my plan:\n\n{state['plan']}")
])
for q in queries.queries:
    response = tavily.search(query=q, max_results=2)
    for r in response['results']:
        content.append(r['content'])
return {"content": content}
```

### 4. Grader Agent

Scores the relevance of retrieved content against the user's original request. Relevant content is separated out; the grading score (percentage of relevant results) determines whether the research loop retries.

```python
grading_score = (len(relevant_content) / len(state['content'])) * 100
return {
    "search_number": state["search_number"] + 1,
    "content": relevant_content,
    "grading_score": round(grading_score),
}
```

### 5. Generator Agent

Produces the final meal plan from the graded, relevant content. Runs inside the revision loop — if the Reviewer rejects the output, this node is re-invoked with the same graded content to produce a new response.

```python
messages = [
    SystemMessage(content=GENERATOR_PROMPT.format(content=content)),
    HumanMessage(content=f"{state['task']}\n\nHere is my plan:\n\n{state['plan']}")
]
response = model.invoke(messages)
return {
    "generated": response.content,
    "revision_number": state.get("revision_number", 1) + 1
}
```

### 6. Reviewer Agent

Evaluates the generated meal plan against the source content. The LLM assesses each factual claim; the hallucination score is derived from the ratio of unsupported to supported claims. If the score exceeds the threshold, the revision loop triggers.

```python
assessments = response.content.split("\n")
true_count = len([a for a in assessments if re.search(r'\btrue\b', a, re.IGNORECASE)])
false_count = len([a for a in assessments if re.search(r'\bfalse\b', a, re.IGNORECASE)])
hellucination_score = (false_count / (true_count + false_count)) * 100
```

---

## Auth

Authentication is handled by NextAuth.js with two strategies:

**Google OAuth** — users can sign in with their Google account. On first sign-in, a user record is automatically created in the database with a custom ID format (`usr_<uuid>`).

**Email/Password credentials** — passwords are hashed with `bcryptjs` before storage. Login compares the submitted password against the stored hash via `bcrypt.compare()`.

Both strategies use JWT session tokens. Callbacks in `next/app/api/auth/[...nextauth]/route.ts` attach the database user ID to the token, which is then available on every session. The following routes are protected by Next.js middleware and redirect unauthenticated users: `/dashboard`, `/profile`, `/thread/:id`.

---

## Real-Time Progress

Agent progress is streamed to the frontend using Server-Sent Events (SSE).

- Flask maintains a thread-safe `Queue` (`server/app.py`)
- As each agent phase completes, a status string is pushed onto the queue
- The `/api/updates` endpoint streams queue items to the client as SSE events
- The frontend connects via the browser-native `EventSource` API (`next/utils/utils.ts`) — no polling, no websocket library
- The connection is cleaned up on component unmount

---

## Database Schema

The application uses two separate PostgreSQL databases:

**Application DB** (managed via Prisma):

| Table | Key Fields |
|---|---|
| `User` | `id` (TEXT, `usr_<uuid>`), `email` (UNIQUE), `password` (nullable), `name`, `avatar` |
| `Thread` | `id` (INT), `name`, `created_by` → User |
| `Message` | `id` (INT), `thread_id` → Thread, `user_id` → User, `message` (TEXT), `is_bot` (BOOL) |

**Checkpoint DB** (managed by `PostgresSaver`):

| Table | Key Fields |
|---|---|
| `checkpoints` | `thread_id`, `thread_ts` (composite PK), `parent_ts`, `checkpoint` (BYTEA), `metadata` (BYTEA) |
| `writes` | `thread_id`, `thread_ts`, `task_id`, `idx` (composite PK), `channel`, `value` (BYTEA) |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL instance
- [Tavily API key](https://tavily.com)
- [OpenAI API key](https://platform.openai.com)
- Google OAuth credentials (for Google sign-in)

### Installation

```sh
git clone https://github.com/AI-Culinary-Agents/HealthAgents.git
cd HealthAgents

# Python dependencies
python -m venv venv
source venv/bin/activate       # Mac/Linux
venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Node dependencies
npm run install:all
```

### Environment Variables

Create a `.env` file in the root directory:

```sh
# AI / Search
OPENAI_API_KEY=
TAVILY_API_KEY=

# Database (used by both Prisma and PostgresSaver)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Auth
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

### Run Prisma Migrations

```sh
cd next
npx prisma migrate deploy
```

### Start the Application

```sh
# From root — starts Flask server + Next.js frontend concurrently
npm run start:all
```

Navigate to `http://localhost:3000`.

---

## Project Structure

```
HealthAgents/
├── graph/
│   ├── agents/          # 6 agent implementations + prompts
│   ├── nodes/           # LangGraph node wrappers
│   ├── graph.py         # Graph definition, conditional edges, loop logic
│   ├── postgres_saver.py# Custom BaseCheckpointSaver implementation
│   └── state.py         # AgentState schema
├── server/
│   └── app.py           # Flask API, SSE endpoint, queue management
└── next/
    ├── app/
    │   ├── api/         # Next.js API routes (auth, threads, messages)
    │   └── (pages)/     # Dashboard, thread view, profile, auth pages
    ├── components/      # ChatWindow, Sidebar, Thread, progress UI
    ├── prisma/          # Schema + migrations
    └── utils/           # SSE client, API helpers
```

---

## Acknowledgements

- [Tavily](https://tavily.com) for real-time web search
- [LangGraph](https://github.com/langchain-ai/langgraph) for the agent workflow framework
- [Mistral Cookbook](https://github.com/mistralai/cookbook/tree/main/third_party/langchain) for Self-RAG and Corrective-RAG patterns
