from psycopg_pool import ConnectionPool
from graph.agents import get_plan_node, get_research_plan_node, get_grader_node, get_generator_node, get_reviewer_node
from langgraph.graph import StateGraph, END
from graph import AgentState, send_data_to_server, retrieve_final_data  # avoid circular import
from .postgres_saver import PostgresSaver

def process_user_input(user_data):
    print("Starting process_user_input with:", user_data)
    planner = get_plan_node()
    researcher = get_research_plan_node()
    grader = get_grader_node()
    generator = get_generator_node()
    reviewer = get_reviewer_node()

    workflow = StateGraph(AgentState)

    workflow.add_node("planner", planner)
    workflow.add_node("research_plan", researcher)
    workflow.add_node("grader", grader)
    workflow.add_node("generate", generator)
    workflow.add_node("review", reviewer)

    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "research_plan")
    workflow.add_edge("research_plan", "grader")
    workflow.add_edge("grader", "generate")
    workflow.add_edge("generate", "review")

    def enough_content(state):
        if state['grading_score'] >= 20 and state["search_number"] < state["max_searches"]:
            return "research_plan"
        return "generate"
    
    workflow.add_conditional_edges("grader", enough_content, {"research_plan": "research_plan", "generate": "generate"})

    def should_continue(state):
        if state['hellucination_score'] <= 50 and state["revision_number"] < state["max_revisions"]:
            return "generate"
        return END

    workflow.add_conditional_edges("review", should_continue, {"generate": "generate", END: END})

    # Setup PostgreSQL checkpointer with sync connection pool
    DB_URI = "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"
    pool = ConnectionPool(conninfo=DB_URI, max_size=20)
    postgres_checkpointer = PostgresSaver(sync_connection=pool)

    postgres_checkpointer.create_tables(pool)
    
    graph = workflow.compile(checkpointer=postgres_checkpointer)

    thread = {"configurable": {"thread_id": "1"}}

    state = AgentState(
        task=user_data['text'],
        plan="",
        generated="", 
        content=[],
        grading_score=0, 
        revision_number=0, 
        final_review="",
        hellucination_score=0,  
        search_number=0,
        max_searches=1, # Adjust (2-3 recommended)
        max_revisions=1, # Adjust (2-3 recommended)
        use_saved_data=True 
    )

    for event in graph.stream(state, thread):
        print('------------------')
        # print(event)
        print('------------------')

    results = retrieve_final_data()

    # Send the saved data to the server
    send_data_to_server(results)

    # Return the processed result
    return results 

if __name__ == "__main__":
    # standalone Testing
    user_input = "I want to eat healthy and lose weight but I like eating out often, especially Chinese and Jamaican food. I have a preference for American food and I'm allergic to nuts and peaches."
    result = process_user_input(user_input)
    print(result)
