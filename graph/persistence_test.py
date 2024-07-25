import sys
import os

# Ensure the project root is in the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import asyncio
import psycopg
from psycopg_pool import ConnectionPool
from graph.agents import get_plan_node, get_research_plan_node
from langgraph.graph import StateGraph, END
from graph import AgentState, retrieve_final_data
from graph.postgres_saver import PostgresSaver

def setup_db():
    # Initialize database connection
    DB_URI = "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"
    pool = ConnectionPool(conninfo=DB_URI, max_size=20)
    postgres_checkpointer = PostgresSaver(sync_connection=pool)

    # Create tables
    postgres_checkpointer.create_tables(pool)

    return postgres_checkpointer, pool

def define_workflow():
    # Define a simplified workflow
    workflow = StateGraph(AgentState)
    workflow.add_node("planner", get_plan_node())
    workflow.add_node("research_plan", get_research_plan_node())
    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "research_plan")

    return workflow

def run_initial_workflow(graph, postgres_checkpointer, pool):
    # Define initial state
    initial_state = AgentState(
        task="Test task",
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
        use_saved_data=False
    )

    # Define a thread configuration
    thread = {"configurable": {"thread_id": "test_thread"}}

    # Run the workflow and save the state
    print("Running initial workflow...")
    for event in graph.stream(initial_state, thread):
        print(event)
        if event.get("planner"):  # Stop after seeing the planner event
            break

    return thread

def retrieve_and_continue_workflow(graph, postgres_checkpointer, thread):
    # Retrieve the saved state from the database
    print("Retrieving saved state...")
    retrieved_state = postgres_checkpointer.get_tuple(thread)
    print("Retrieved state:", retrieved_state)

    # Verify if the retrieved state matches the expected state
    if retrieved_state:
        print("State retrieved successfully.")
    else:
        print("Failed to retrieve state.")
        return

    # Continue the workflow from the retrieved state
    print("Continuing workflow from retrieved state...")
    for event in graph.stream(retrieved_state.checkpoint, thread):
        print(event)

def main():
    postgres_checkpointer, pool = setup_db()
    workflow = define_workflow()

    # Compile the workflow with the checkpointer
    graph = workflow.compile(checkpointer=postgres_checkpointer)

    # Run initial workflow
    thread = run_initial_workflow(graph, postgres_checkpointer, pool)

    # Simulate stopping the application (e.g., restart)

    # Retrieve and continue workflow
    retrieve_and_continue_workflow(graph, postgres_checkpointer, thread)

    # Verify the final results
    results = retrieve_final_data()
    print("Final results:", results)

    # Cleanup: Drop tables after the test
    postgres_checkpointer.drop_tables(pool)

if __name__ == "__main__":
    main()
