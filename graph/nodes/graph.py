from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.tools import tool
from typing import Annotated, Literal, TypedDict, Sequence
import operator
from langchain_openai import ChatOpenAI
from langchain_core.messages import (
    BaseMessage,
    HumanMessage
)
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from .Tools import python_repl, tavily_tool, llm, call_openai
from .planner import planner_node
from langgraph.graph import END, StateGraph, START
from .Tools import router
# from .research import research_node
# from .chart import chart_node
from langgraph.prebuilt import ToolNode

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    sender: str

workflow = StateGraph(AgentState)
workflow.add_node("planner", planner_node)
workflow.add_node("call_tool", ToolNode([call_openai]))
workflow.add_conditional_edges(
    "planner",
    router,
    {"continue": "planner", "call_tool": "call_tool", "__end__": END},
)
print('Condtional EDGE')
workflow.add_conditional_edges(
    "call_tool",
    lambda x: x["sender"],
    {"planner": "planner"},
)

workflow.add_edge(START, "planner")

graph = workflow.compile()

if __name__ == "__main__":
    user_input = "I need a weekly meal plan with three meals a day: breakfast, lunch, and dinner. I follow a pescatarian diet and need to avoid dairy and gluten. I love Mexican and Mediterranean cuisines, and my goal is to maintain my current weight. My daily calorie intake should be around 1800 calories. Please exclude any red meat and poultry from the plan. I have the following ingredients at home: salmon, brown rice, black beans, avocados, bell peppers, spinach, olive oil, tomatoes, and corn tortillas."

    # Initial state
    state = {
        "messages": [
            HumanMessage(content=user_input)
        ],
        "sender": "user"
    }
    
    # Thread configuration
    thread = {"configurable": {"thread_id": "1"}}

    # Stream the events in the graph
    for event in graph.stream(state, thread):
        print('------------------')
        print(event)
        print('------------------')

    print('yes')