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

from .prompts import APP_INFO, INTERPRETER_PROMPT



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
    print('------')
    return {"interpreted": response.content}

# Test
if __name__ == "__main__":
    from graph import AgentState  # avoid circular import

    state = AgentState(
        task='what did i previously ask you?',
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
