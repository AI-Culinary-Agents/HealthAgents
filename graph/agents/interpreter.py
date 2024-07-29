import json
import os
from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage

# Add this to adjust the Python path
import sys

from langchain_openai import ChatOpenAI
from psycopg_pool import ConnectionPool

from ..postgres_saver import PostgresSaver
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

INTERPRETER_PROMPT = """
You are an intelligent interpreter agent tasked with determining the nature of user input and deciding the appropriate action.
Your goal is to check if the user is:
1. Asking something related to the previous state.
2. Providing new input to get a meal plan.
3. Asking about the application.
4. Asking something else that is not clear.

Instructions:
1. Carefully analyze the user's message.
2. If the message is asking about the previous task or state (e.g., "What did I ask for again?", "Can you remind me of my last meal plan?", "What was my previous request?"):
   - Respond with an answer based on the context of the conversation you are provided.
3. If the message is providing new input for generating a meal plan (e.g., personal information, goals, life circumstances, access to ingredients, macros, resources, etc.):
   - Respond with a single word: "Activate".
4. If the message is asking about the application (e.g., "How do I get a meal plan?", "What does this application do?", "How can I use this app?"):
   - Respond with information about the application.
5. For any other input, respond with: "I'm sorry, I didn't understand that. Please specify your request."

Context:
{context}

Application Information:
{app_info}
"""

APP_INFO = """
Health Agents is a personalized meal plan recommendation system that generates tailored meal plans based on user dietary preferences and available ingredients. This project utilizes the LangGraph framework for defining agent workflows and the Tavily API for fetching recipe data.

## Key Features:
- **Planner Agent:** Collects user preferences such as dietary restrictions and available ingredients, and creates an initial meal plan.
- **Research Plan Agent:** Uses the Tavily API to search for recipes or meal components based on the initial plan and user input.
- **Grader Agent:** Grades the relevance of fetched recipes and meal components, ensuring they match user preferences.
- **Generator Agent:** Generates a detailed meal plan using the graded recipes and meal components.
- **Reviewer Agent:** Reviews the generated meal plan for accuracy and relevance, adjusting as necessary.

## Prerequisites:
- Python 3.0
- TailwindCSS 3.4.4
- TypeScript 5.2.2
- Vite 5.3.1
- Axios 1.7.2
- Tavily API key
- OpenAI API key
- LangGraph library
- Requests library
- Flask library

## Installation Steps:
1. Clone the repository.
2. Install the required dependencies.
3. Create a `.env` file with your API keys.
4. Start the Flask server and frontend simultaneously.
5. Enter your dietary preferences and other relevant information to generate a meal plan.

## How to Use:
1. **Enter Information:** Type in your dietary preferences, goals, available ingredients, and other relevant information.
2. **Wait for Processing:** The system will process your input and generate a meal plan.
3. **Receive Results:** View the generated meal plan along with grading and hallucination scores.
"""

model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

def setup_db():
    print("Setting up database connection...")
    DB_URI = "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"
    pool = ConnectionPool(conninfo=DB_URI, max_size=20)
    postgres_checkpointer = PostgresSaver(sync_connection=pool)
    postgres_checkpointer.create_tables(pool)
    print("Database tables created.")
    return postgres_checkpointer, pool

def retrieve_last_state(checkpointer, config):
    state = checkpointer.get(config)
    if state is None:
        raise ValueError("No checkpoint found for the given configuration.")
    return state

def interpreter_node(state, use_saved_data: bool = False):
    config = {"configurable": {"thread_id": "1"}}
    checkpointer, _ = setup_db()
    context = retrieve_last_state(checkpointer, config)
    print("Context:", context)
    directory = os.environ.get("INTERPRETER_DATA_DIR", "../tests/interpreter_save")
    filename = os.path.join(directory, "interpreted_data.json")
    
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    if use_saved_data and os.path.exists(filename):
        print("From saved data!")
        with open(filename, 'r') as file:
            saved_data = json.load(file)
            return {"interpreted": saved_data["interpreted"]}
    
    messages = [
        SystemMessage(content=INTERPRETER_PROMPT.format(context=context, app_info=APP_INFO)), 
        HumanMessage(content=state['task'])
    ]
    response = model.invoke(messages)
    
    # Saving
    with open(filename, 'w') as file:
        json.dump({"interpreted": response.content}, file)

    return {"interpreted": response.content}

# Test
if __name__ == "__main__":
    from graph import AgentState  # avoid circular import

    state = AgentState(
        task='what was my last meal plan?',
        plan="",
        generated="",
        content=[],
        grading_score=0,
        revision_number=0,
        final_review="",
        hellucination_score=0,
        search_number=0,
        max_searches=1,
        max_revisions=1,
        use_saved_data=False,
        interpreted="",
        id="initial_state_id",
        channel_values={},
        v=1,
        ts="",
        channel_versions={},
        versions_seen={},
        pending_sends=[]
    )

    print(interpreter_node(state))
