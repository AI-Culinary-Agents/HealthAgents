from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.tools import tool
from typing import Annotated, Literal
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import ToolNode
from langchain_experimental.utilities import PythonREPL

llm = ChatOpenAI(model="gpt-3.5-turbo")

tavily_tool = TavilySearchResults(max_results=5)
repl = PythonREPL()

@tool
def call_openai(messages: Annotated[list, "List of messages to pass to OpenAI"]):
    """Invoke OpenAI's model with the provided messages and return the response content."""
    # Ensure messages have the correct structure
    structured_messages = [
        {"role": "user", "content": message} if isinstance(message, str) else message
        for message in messages
    ]
    response = llm(structured_messages)
    print('------FROM CALLOPENAIFUNCTION------')
    return response.content
@tool
def python_repl(
    code: Annotated[str, "The python code to execute to generate your chart."],
):
    """Execute the provided Python code and return the output."""
    try:
        result = repl.run(code)
    except BaseException as e:
        return f"Failed to execute. Error: {repr(e)}"
    result_str = f"Successfully executed:\n```python\n{code}\n```\nStdout: {result}"
    return (
        result_str + "\n\nIf you have completed all tasks, respond with FINAL ANSWER."
    )

tools = [tavily_tool, python_repl]
tool_node = ToolNode(tools)

# Either agent can decide to end
def router(state) -> Literal["call_tool", "__end__", "continue"]:
    """Route the next action based on the current state of messages."""
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        # The previous agent is invoking a tool
        return "call_tool"
    if "FINAL ANSWER" in last_message.content:
        # Any agent decided the work is done
        return "__end__"
    return "continue"
