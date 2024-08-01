import sys
import os
from psycopg_pool import ConnectionPool
from graph.agents import get_grader_node, get_plan_node, get_research_plan_node, get_generator_node, get_reviewer_node
from langgraph.graph import StateGraph, END
from graph import AgentState, retrieve_final_data
from .postgres_saver import PostgresSaver

def setup_db():
    print("Setting up database connection...")
    DB_URI = "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"
    pool = ConnectionPool(conninfo=DB_URI, max_size=20)
    postgres_checkpointer = PostgresSaver(sync_connection=pool)
    postgres_checkpointer.create_tables(pool)
    print("Database tables created.")
    return postgres_checkpointer, pool

def define_workflow():
    print("Defining the workflow...")
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

    return workflow

def run_initial_workflow(graph, postgres_checkpointer, pool):
    print("Defining initial state...")
    initial_state = AgentState(
        task="I want to get fit and healthy. prefer Jamaican food and Chinese food and allergic to nuts",
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
        use_saved_data=True,
        id="initial_state_id",
        channel_values={},
        v=1,
        ts="",
        channel_versions={},
        versions_seen={},
        pending_sends=[]
    )

    config = {"configurable": {"thread_id": "1"}}

    print("Running initial workflow...")
    res = graph.invoke(initial_state, config)
    
    print('res',res)
 
    print("Initial workflow completed.")
    return config

def retrieve_and_continue_workflow(graph, postgres_checkpointer, config):
    checkpointer = postgres_checkpointer
    print(checkpointer.get(config))
    return config

def main_initial_run():
    postgres_checkpointer, pool = setup_db()
    workflow = define_workflow()
    graph = workflow.compile(checkpointer=postgres_checkpointer)  # Compile the workflow with the checkpointer
    config = run_initial_workflow(graph, postgres_checkpointer, pool)
    return config

def main_continue_run():
    postgres_checkpointer, pool = setup_db()
    workflow = define_workflow()
    graph = workflow.compile(checkpointer=postgres_checkpointer)  # Compile the workflow with the checkpointer
    config = {"configurable": {"thread_id": "1"}}  # Ensure this matches your initial config
    retrieve_and_continue_workflow(graph, postgres_checkpointer, config)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "continue":
        main_continue_run()
    else:
        main_initial_run()
