from .CreateAgent import create_agent, agent_node
import functools
from .Tools import call_openai
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo")

planner_agent = create_agent(
    llm,
    [call_openai],
    system_message="You are a culinary expert tasked with creating a high-level meal plan."
                   " Based on the user's input, generate a detailed outline for a weekly meal plan."
                   " Include relevant notes, instructions, and considerations for each meal to ensure they are balanced, nutritious, and delicious."
                   " Consider dietary preferences and nutritional goals in your outline."
)

planner_node = functools.partial(agent_node, agent=planner_agent, name="planner")
