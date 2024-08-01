APP_INFO = """
Health Agents is a personalized meal plan recommendation system that generates tailored meal plans based on user dietary preferences and available ingredients. This project utilizes the LangGraph framework for defining agent workflows and the Tavily API for fetching recipe data.

## Key Features:
- **Planner Agent:** Collects user preferences such as dietary restrictions and available ingredients, and creates an initial meal plan.
- **Research Plan Agent:** Uses the Tavily API to search for recipes or meal components based on the initial plan and user input.
- **Grader Agent:** Grades the relevance of fetched recipes and meal components, ensuring they match user preferences.
- **Generator Agent:** Generates a detailed meal plan using the graded recipes and meal components.
- **Reviewer Agent:** Reviews the generated meal plan for accuracy and relevance, adjusting as necessary.

## Prerequisites:
- Python 3.0
- TailwindCSS 3.4.4
- TypeScript 5.2.2
- Vite 5.3.1
- Axios 1.7.2
- Tavily API key
- OpenAI API key
- LangGraph library
- Requests library
- Flask library

## Installation Steps:
1. Clone the repository.
2. Install the required dependencies.
3. Create a `.env` file with your API keys.
4. Start the Flask server and frontend simultaneously.
5. Enter your dietary preferences and other relevant information to generate a meal plan.

## How to Use:
1. **Enter Information:** Type in your dietary preferences, goals, available ingredients, and other relevant information.
2. **Wait for Processing:** The system will process your input and generate a meal plan.
3. **Receive Results:** View the generated meal plan along with grading and hallucination scores.
"""