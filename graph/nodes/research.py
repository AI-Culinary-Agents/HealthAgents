# from .CreateAgent import create_agent, agent_node
# import functools
# from .Tools import python_repl, tavily_tool, llm

# # Research agent and node
# research_agent = create_agent(
#     llm,
#     [tavily_tool],
#     system_message="You should provide accurate data for the chart_generator to use.",
# )
# research_node = functools.partial(agent_node, agent=research_agent, name="Researcher")

# # chart_generator
# chart_agent = create_agent(
#     llm,
#     [python_repl],
#     system_message="Any charts you display will be visible by the user.",
# )
# chart_node = functools.partial(agent_node, agent=chart_agent, name="chart_generator")