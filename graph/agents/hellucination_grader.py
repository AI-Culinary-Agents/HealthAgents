
import json
import os
from dotenv import load_dotenv
from langchain_core.messages import SystemMessage
import re

load_dotenv()

# DEBUG need to calculate hallucination score earlier and not sure though
from .prompts import HALLUCINATION_GRADER_PROMPT

def reviewer_node(state, use_saved_data=False):
    from graph import model  # avoid circular import
    from graph.status_updates import update_server_during_reviewer
    from graph import add_history  # Import the add_history function
    
    directory = os.environ.get("REVIEW_DATA_DIR", "../tests/review_save")
    filename = os.path.join(directory, "review_results.json")
    update_server_during_reviewer()

    if not os.path.exists(directory):
        os.makedirs(directory)
    
    # Use saved data if available
    
    # if state["use_saved_data"] and os.path.exists(filename):
    #     print("From saved data!")
    #     with open(filename, 'r') as file:
    #         saved_data = json.load(file)
            
    #         # Use add_history to update the state
    #         add_history(state, "reviewer", {"review": saved_data['review'], "hellucination_score": saved_data['hellucination_score']})
            
    #         print('*****HISTORY ADDED*****')
    #         print(state['history'])
    #         print('*****HISTORY ADDED*****')
    #         return {
    #             "final_review": saved_data["review"],
    #             "hellucination_score": saved_data["hellucination_score"] + 50,
    #             'generated': saved_data['generated'],
    #             "history": state['history']
    #         }
    
    # Combine content and generated text for the prompt
    content = "\n\n".join(state['content'] or [])
    messages = [
        SystemMessage(content=HALLUCINATION_GRADER_PROMPT.format(content=content, generated=state['generated']))
    ]
    response = model.invoke(messages)
    print('-------------------')
    
    # Process the response
    assessments = response.content.split("\n")
    
    # Use regex to detect "true" and "false" in assessments
    true_count = len([assessment for assessment in assessments if re.search(r'\btrue\b', assessment, re.IGNORECASE)])
    false_count = len([assessment for assessment in assessments if re.search(r'\bfalse\b', assessment, re.IGNORECASE)])
    total_count = true_count + false_count
    hellucination_score = (false_count / total_count) * 100 if total_count > 0 else 0
    
    # Save the review results
    with open(filename, 'w') as file:
        json.dump({
            "generated": state['generated'],
            "review": assessments,
            "hellucination_score": hellucination_score,
            "grading_score": state['grading_score'],
            "history": state['history']
        }, file)
    
    # Use add_history to update the state with the new review result and hallucination score
    add_history(state, "reviewer", f"review result: {assessments}, hallucination score: {hellucination_score}")
    
    print(hellucination_score)
    print("ASSESSMENTS:", assessments)
    print("----------")
    print("------REVIEWER------")
    
    return {
        "final_review": assessments,
        "hellucination_score": state["hellucination_score"] + round(hellucination_score),
        'generated': state['generated'],
        "history": state['history']
    }

# Test
if __name__ == "__main__":
    from graph import AgentState  # avoid circular import