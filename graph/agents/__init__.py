# Delayed import to avoid circular dependencies

def get_interpreter_node():
    from .interpreter import interpreter_node
    return interpreter_node

def get_plan_node():
    from .planner import plan_node
    return plan_node

def get_research_plan_node():
    from .plan_researcher import research_plan_node
    return research_plan_node

def get_grader_node():
    from .document_grader import grader_node
    return grader_node

def get_generator_node():
    from .generator import generator_node
    return generator_node

def get_reviewer_node():
    from .hellucination_grader import reviewer_node
    return reviewer_node