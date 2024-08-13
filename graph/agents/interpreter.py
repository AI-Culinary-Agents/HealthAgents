import json
import os
import pickle
from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage

# Add this to adjust the Python path
import sys

from langchain_openai import ChatOpenAI
from psycopg_pool import ConnectionPool
from ..postgres_saver import PostgresSaver, SafeConnectionPool, JsonAndBinarySerializer
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

from .prompts import APP_INFO, INTERPRETER_PROMPT

# Initialize the ChatOpenAI model
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

# Set up the database connection
def setup_db():
    print("Setting up database connection...")
    DB_URI = "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"
    pool = SafeConnectionPool(conninfo=DB_URI, max_size=20)
    postgres_checkpointer = PostgresSaver(sync_connection=pool)
    postgres_checkpointer.create_tables(pool)
    print("Database tables created.")
    return postgres_checkpointer, pool

# Retrieve the last state from the checkpoint
def retrieve_last_state(checkpointer, config):
    # Use the get_tuple method from PostgresSaver to retrieve and deserialize the checkpoint
    checkpoint_tuple = checkpointer.get_tuple(config)

    if checkpoint_tuple:
        state = checkpoint_tuple.checkpoint
        print("🚀 ~ Retrieved state:", state)
        if 'history' not in state.get('channel_values', {}):
            print(f"History not found in checkpoint for thread_id: {config['configurable']['thread_id']}")
            return {}

        return state
    else:
        # Log that no checkpoint was found and return an empty context
        print(f"No checkpoint found for thread_id: {config['configurable']['thread_id']}. Continuing without context.")
        return {}


# Interpreter node function to process user input
def interpreter_node(state, use_saved_data: bool = False):
    checkpointer, connection = setup_db()
    config = {"configurable": {"thread_id": state['thread_id']}}

    # Get context using the retrieve_last_state function
    context = retrieve_last_state(checkpointer, config)
    history = context.get('channel_values', {}).get('history', []) if context else []

    print("🚀 ~ Retrieved context:", context)
    print("History:", history)

    directory = os.environ.get("INTERPRETER_DATA_DIR", "../tests/interpreter_save")
    filename = os.path.join(directory, "interpreted_data.json")

    if use_saved_data and os.path.exists(filename):
        print("Loading from saved data!")
        with open(filename, 'r') as file:
            saved_data = json.load(file)
            return {"interpreted": saved_data["interpreted"]}

    messages = [
        SystemMessage(content=INTERPRETER_PROMPT.format(context=history, app_info=APP_INFO)),
        HumanMessage(content=state['task'])
    ]
    response = model.invoke(messages)

    print('------')
    return response.content