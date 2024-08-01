from .CreateAgent import create_agent, agent_node
import functools
from .Tools import python_repl, llm

chart_agent = create_agent(
    llm,
    [python_repl],
    system_message="Any charts you display will be visible by the user.",
)
chart_node = functools.partial(agent_node, agent=chart_agent, name="chart_generator")