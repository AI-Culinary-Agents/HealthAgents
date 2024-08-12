import json
import os
from typing import List
from langchain_core.pydantic_v1 import BaseModel
from langchain_openai import ChatOpenAI
import requests
from tavily import TavilyClient
# Enforces Model Output to be a List of Strings
class Queries(BaseModel):
    queries: List[str]
    
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

tavily = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])

def send_data_to_server(data):
    print("Sending data to server:", data) 
    response = requests.post('http://127.0.0.1:5000/api/processed', json=data)
    if response.status_code == 200:
        print("Processed data sent successfully:", response.json())
    else:
        print("Error sending processed data:", response.status_code, response.text)

def retrieve_final_data():
    # Retrieve the review data from the file
    directory = os.environ.get("REVIEW_DATA_DIR", "../tests/review_save")
    filename = os.path.join(directory, "review_results.json")
    with open(filename, 'r') as file:
        saved_data = json.load(file)

    # Prepare the data to send
    data_to_send = {
        "generated": saved_data["generated"],
        "grading_score": saved_data["grading_score"],
        "hellucination_score": saved_data["hellucination_score"],
    }
    return data_to_send


# Saved Data Management . Full Implementation Later On.
def ensure_directory_exists(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def load_saved_data(filename):
    if os.path.exists(filename):
        with open(filename, 'r') as file:
            return json.load(file)
    return None

def save_data(filename, data):
    with open(filename, 'w') as file:
        json.dump(data, file)

def manage_saved_data(directory_env_var, default_directory, filename, state, key, response_content=None):
    directory = os.environ.get(directory_env_var, default_directory)
    filename = os.path.join(directory, filename)
    ensure_directory_exists(directory)
    
    # Use saved data if available
    if state["use_saved_data"]:
        saved_data = load_saved_data(filename)
        if saved_data:
            print("From saved data!")
            state[key] = saved_data[key]
            return state
    
    # Save new data
    if response_content is not None:
        save_data(filename, {key: response_content})
        state[key] = response_content
    
    return state

def add_history(state,agent, history):
    state['history'].append(f'Agent: {agent} - {history}')
    return state