
import json
import os
from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

from .prompts import PLAN_PROMPT

def plan_node(state, use_saved_data: bool = False):
    from graph import model, add_history  # avoid circular import
    from graph.status_updates import update_server_during_planner
    
    directory = os.environ.get("PLANNER_DATA_DIR", "../tests/plan_save")
    filename = os.path.join(directory, "plan_data.json")
    update_server_during_planner()

    if not os.path.exists(directory):
        os.makedirs(directory)
    
    # Use saved data if available
    if use_saved_data and os.path.exists(filename):
        print("From saved data!")
        with open(filename, 'r') as file:
            saved_data = json.load(file)
            add_history(state, "planner", saved_data["plan"])
            return {"plan": saved_data["plan"], "history": state["history"]}
    
    # Generate plan based on the task
    messages = [
        SystemMessage(content=PLAN_PROMPT), 
        HumanMessage(content=state['task'])
    ]
    response = model.invoke(messages)
    
    # Save the plan
    with open(filename, 'w') as file:
        json.dump({"plan": response.content}, file)
        
    # update history with user input 
    
    add_history(state, "USER INPUT", state['task'])

    # Update history with the plan
    add_history(state, "planner", response.content)
    

    print("-----PLANNER------")
    return {"plan": response.content, "history": state["history"]}

# Test
if __name__ == "__main__":
    from graph import AgentState  # avoid circular import


# from dotenv import load_dotenv
# from langchain_core.messages import SystemMessage, HumanMessage

# load_dotenv()

# from .prompts import PLAN_PROMPT
# def plan_node(state):
#     from graph import model, manage_saved_data # avoid circular import
#     from graph.status_updates import update_server_during_planner
#     update_server_during_planner()
#     response_content = None
#     if not state["use_saved_data"]:
#         messages = [
#             SystemMessage(content=PLAN_PROMPT),
#             HumanMessage(content=state['task'])
#         ]
#         response = model.invoke(messages)
#         response_content = response.content
    
#     state = manage_saved_data(
#         directory_env_var="PLANNER_DATA_DIR",
#         default_directory="../tests/plan_save",
#         filename="plan_data.json",
#         state=state,
#         key="plan",
#         response_content=response_content
#     )
#     print("-----PLANNER------")
#     return state

# # Test
# if __name__ == "__main__":
#     from graph import AgentState  # avoid circular import

#     state = AgentState(
#         task='I need a weekly meal plan with three meals a day: breakfast, lunch, and dinner. I follow a pescatarian diet and need to avoid dairy and gluten. I love Mexican and Mediterranean cuisines, and my goal is to maintain my current weight. My daily calorie intake should be around 1800 calories. Please exclude any red meat and poultry from the plan. I have the following ingredients at home: salmon, brown rice, black beans, avocados, bell peppers, spinach, olive oil, tomatoes, and corn tortillas.',
#         plan="",
#         generated="", 
#         content=[],
#         grading_score=0, 
#         revision_number=0, 
#         final_review="",
#         hellucination_score=0,  
#         search_number=0,
#         max_searches=1, # Adjust (2-3 recommendeded)
#         max_revisions=1, # Adjust (2-3 recommendeded)
#         use_saved_data=True
#     )

#     print(plan_node(state))