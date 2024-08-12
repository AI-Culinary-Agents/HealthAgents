
import json
import os
from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

from .prompts import GRADER_PROMPT

def grader_node(state):
    from graph import model, add_history  # avoid circular import
    from graph.status_updates import update_server_during_grader
    
    directory = os.environ.get("GENERATED_DATA_DIR", "../tests/relevant_docs_save")
    filename = os.path.join(directory, "relevant_content.json")
    update_server_during_grader()
    
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    # Use saved data if available
    if state["use_saved_data"] and os.path.exists(filename):
        print("From saved data!")
        with open(filename, 'r') as file:
            saved_data = json.load(file)
            add_history(state, "grader", {"content": {'relevant documents from research' : saved_data["content"]}, "grading_score": saved_data["grading_score"]})
            return {
                'content' : saved_data["content"],
                'grading_score' : round(saved_data["grading_score"]),
                "search_number": state["search_number"] + 1,
                "history": state["history"]
            }
    
    content = "\n\n".join(state['content'] or [])
    messages = [
        SystemMessage(content=GRADER_PROMPT.format(content=content)),
        HumanMessage(content=state['task'])
    ]
    response = model.invoke(messages)
    
    # Split the response content by delimiter
    relevant_content = response.content.split('-----')
    
    # Filter relevant content based on a minimum length condition
    relevant_content = [doc.strip() for doc in relevant_content if len(doc.strip()) > 20]
    
    print('-------------------')
    print(len(state['content']), len(relevant_content))
    
    # Calculate the grading score as the percentage of relevant documents / total documents
    relevant_count = len(relevant_content)
    total_count = len(state['content'])
    grading_score = round((relevant_count / total_count) * 100 if total_count > 0 else 0)
    
    # Save the relevant content and grading score
    with open(filename, 'w') as file:
        json.dump({"content": relevant_content, "grading_score": grading_score}, file)
    
    # Update history with the relevant content and grading score
    add_history(state, "grader", {"content": {'relevant documents from research' : relevant_content}, "grading_score": round(grading_score)})
    
    print('---')
    print(grading_score)
    print("------GRADER------")
    
    return {
        "search_number": state["search_number"] + 1,
        "content": relevant_content,
        "grading_score": round(grading_score),
        "history": state["history"]
    }

# Test
if __name__ == "__main__":
    from graph import AgentState  # avoid circular import
