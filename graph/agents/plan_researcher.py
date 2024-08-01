import json
import os
from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

from .prompts import RESEARCH_PROMPT

def research_plan_node(state):
    from graph import AgentState, model, Queries, tavily  # avoid circular import
    from graph.status_updates import update_server_during_research
    directory = os.environ.get("DOCUMENTS_DATA_DIR", "../tests/documents_save")
    filename = os.path.join(directory, "documents.json")
    update_server_during_research()
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    # use saved data if available
    if state["use_saved_data"] and os.path.exists(filename):
        print("From saved data!")
        with open(filename, 'r') as file:
            saved_data = json.load(file)
            return {"content": saved_data["content"]}
    
    queries = model.with_structured_output(Queries).invoke([
        SystemMessage(content=RESEARCH_PROMPT),
        # Giving researcher the plan and the task 
        HumanMessage(content=f"{state['task']}\n\nHere is my plan:\n\n{state['plan']}")
    ])
    print(queries)

    # Check if content is a string and convert it to a list if necessary
    # during recurses, content can become a string
    if isinstance(state['content'], str):
        content = [state['content']]
    else:
        content = state['content'] or []

    for q in queries.queries:
        response = tavily.search(query=q, max_results=2)
        for r in response['results']:
            content.append(r['content'])
 
    # Saving
    with open(filename, 'w') as file:
        json.dump({"content": content}, file) 
        
    # return combo of original content and new content
    
    state['search_number'] += 1
    print("-----RESEARCHER------")
    return {"content": content}

# Test
# if __name__ == "__main__":
#     from graph import AgentState  # Import here to avoid circular import
    
#     state: AgentState = {
#         "task": "I want to eat healthy and lose weight but I like pizza and donuts. I have a preference for greasy meals and I'm allergic to nuts and bananas.",
#         "plan": "**Weekly Meal Plan:**\n\n**Day 1:**\n- **Breakfast:** Greek yogurt with mixed berries and a sprinkle of chia seeds.\n  - *Note:* Greek yogurt provides protein and probiotics, while berries offer antioxidants and fiber.\n- **Lunch:** Quinoa salad with roasted vegetables (bell peppers, zucchini, cherry tomatoes) and a lemon vinaigrette.\n  - *Note:* Quinoa is a great source of plant-based protein and fiber, while roasted vegetables add flavor and nutrients.\n- **Dinner:** Lentil and vegetable stir-fry with brown rice.\n  - *Note:* Lentils are high in protein and fiber, and the stir-fry provides a variety of vegetables for vitamins and minerals.\n\n**Day 2:**\n- **Breakfast:** Avocado toast on whole grain bread with a side of sliced tomatoes.\n  - *Note:* Avocado is rich in healthy fats and fiber, while whole grain bread offers complex carbohydrates.\n- **Lunch:** Chickpea and vegetable curry with a side of steamed broccoli.\n  - *Note:* Chickpeas are a good source of protein and fiber, and the curry provides flavorful spices and vegetables.\n- **Dinner:** Stuffed bell peppers with quinoa, black beans, corn, and salsa.\n  - *Note:* Bell peppers are packed with vitamins, and the quinoa and black beans offer a complete protein source.\n\n**Day 3:**\n- **Breakfast:** Smoothie bowl made with spinach, mango, and coconut milk, topped with granola.\n  - *Note:* Spinach adds nutrients, mango provides natural sweetness, and coconut milk offers healthy fats.\n- **Lunch:** Spinach and feta stuffed mushrooms with a side salad.\n  - *Note:* Mushrooms are low in calories and high in nutrients, while feta adds flavor and protein.\n- **Dinner:** Vegetable stir-fried noodles with tofu.\n  - *Note:* Tofu is a good source of plant-based protein, and the vegetables add color and texture.\n\n**Day 4:**\n- **Breakfast:** Oatmeal topped with sliced strawberries and a drizzle of honey.\n  - *Note:* Oatmeal is a filling breakfast option, and strawberries provide vitamin C and antioxidants.\n- **Lunch:** Caprese salad with fresh mozzarella, tomatoes, basil, and balsamic glaze.\n  - *Note:* Mozzarella offers protein, while tomatoes and basil add freshness and flavor.\n- **Dinner:** Eggplant parmesan with a side of mixed greens salad.\n  - *Note:* Eggplant is a low-calorie vegetable, and the salad adds fiber and nutrients.\n\n**Day 5:**\n- **Breakfast:** Whole grain pancakes with maple syrup and a side of fresh fruit.\n  - *Note:* Whole grain pancakes offer complex carbs, while fruit adds natural sweetness and vitamins.\n- **Lunch:** Lentil soup with a side of whole grain bread.\n  - *Note:* Lentils are high in protein and fiber, making them a filling and nutritious choice.\n- **Dinner:** Zucchini noodles with marinara sauce and grilled portobello mushrooms.\n  - *Note:* Zucchini noodles are a low-carb alternative, and portobello mushrooms provide a meaty texture.\n\n**Day 6:**\n- **Breakfast:** Chia seed pudding with sliced peaches and a sprinkle of cinnamon.\n  - *Note:* Chia seeds are rich in omega-3 fatty acids and fiber, while peaches offer vitamins and minerals.\n- **Lunch:** Black bean and corn salad with a lime-cilantro dressing.\n  - *Note:* Black beans are a good source of plant-based protein, and the salad is refreshing and flavorful.\n- **Dinner:** Vegetable and tofu stir-fry with quinoa.\n  - *Note:* Tofu provides protein, while the stir-fry offers a variety of vegetables for nutrients.\n\n**Day 7:**\n- **Breakfast:** Scrambled eggs with sautéed spinach and whole grain toast.\n  - *Note:* Eggs are a good source of protein, and spinach adds vitamins and minerals.\n- **Lunch:** Roasted vegetable wrap with hummus in a whole wheat tortilla.\n  - *Note:* Roasted vegetables provide flavor and nutrients, while hummus adds protein and creaminess.\n- **Dinner:** Cauliflower crust pizza with assorted vegetables and a side salad.\n  - *Note:* Cauliflower crust is a low-carb alternative, and the vegetables offer a variety of nutrients.\n\n**Notes:**\n- Stay hydrated throughout the day by drinking plenty of water.\n- Portion control is key for weight loss, so be mindful of serving sizes.\n- Incorporate a variety of colorful fruits and vegetables for a range of nutrients.\n- Consider incorporating physical activity into your routine for overall health and weight loss.",
#         "generated": "",
#         "content": [],
#         "revision_number": 0,
#         "max_revisions": 2
#     }

#     print(research_plan_node(state, use_saved_data=False))


# print("-----RESEARCHER------")