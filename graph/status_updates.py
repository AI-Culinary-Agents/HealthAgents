import requests
import time

def send_data_to_server(data):
    print("SENDING STATUS UPDATE TO SERVER:", data)
    response = requests.post('http://127.0.0.1:5000/api/processed', json=data)
    if response.status_code == 200:
        print("STATUS SENT SUCCESSFULLY", response.json())
    else:
        print("ERROR SENDING STATUS:", response.status_code, response.text)

def update_server_with_status(phase, message, delay=2):
    data = {
        "phase": phase,
        "status": message
    }
    # time.sleep(delay)  #  delay to simulate
    send_data_to_server(data)

def update_server_during_planner():
    update_server_with_status("planner", "Planner agent is working.", delay=2)  # 2 seconds delay

def update_server_during_research():
    update_server_with_status("research", "Task passed to Researcher agent.", delay=2)  # 2 seconds delay

def update_server_during_grader():
    update_server_with_status("grader", "Grader agent is evaluating the results.", delay=2)  # 2 seconds delay

def update_server_during_generator():
    update_server_with_status("generator", "Generator agent is generating content.", delay=2)  # 2 seconds delay

def update_server_during_reviewer():
    update_server_with_status("reviewer", "Reviewer agent is reviewing the content.", delay=2)  # 2 seconds delay

# Example usage
if __name__ == "__main__":
    update_server_during_planner()
    update_server_during_research()
    update_server_during_grader()
    update_server_during_generator()
    update_server_during_reviewer()
