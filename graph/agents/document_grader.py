import json
import os
from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

from .prompts import GRADER_PROMPT

def grader_node(state, use_saved_data: bool = False):
    from graph import model  # Import here to avoid circular import

    directory = os.environ.get("GENERATED_DATA_DIR", "../tests/relevant_docs_save")
    filename = os.path.join(directory, "relevant_content.json")
    
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    # Use saved data if available
    if use_saved_data and os.path.exists(filename):
        print("From saved data!")
        with open(filename, 'r') as file:
            saved_data = json.load(file)
            state['content'] = saved_data["content"]
            state['grading_score'] = saved_data["grading_score"]
            return state
        
    content = "\n\n".join(state['content'] or [])
    messages = [
        SystemMessage(content=GRADER_PROMPT.format(content=content)),
        HumanMessage(content=state['task'])
    ]
    response = model.invoke(messages)
    
    # Split the response content by delimiter
    relevant_content = response.content.split('-----')
    
    # Ensure the relevant content is meaningful
    relevant_content = [doc.strip() for doc in relevant_content if len(doc.strip()) > 20]
    
    # If insufficient relevant content, trigger re-research
    # print("content", content)
    # print('-------------------')
    # print("relevant_content", relevant_content)
    print('-------------------')
    print(len(state['content']), len(relevant_content))
    
    # Calculate the grading score as the percentage of relevant documents
    relevant_count = len(relevant_content)
    total_count = len(state['content'])
    grading_score = (relevant_count / total_count) * 100 if total_count > 0 else 0

    # # Update state with the new grading score
    # state['grading_score'] = round(grading_score)
    # state['content'] = relevant_content
    
    # Saving
    with open(filename, 'w') as file:
        json.dump({"content": relevant_content, "grading_score": grading_score}, file)
    
    print('---')
    print(grading_score)
    print("---GRADER---")
    
    return {
            "search_number": state["search_number"] + 1,
            "content": relevant_content,
            "grading_score": round(grading_score),
            }