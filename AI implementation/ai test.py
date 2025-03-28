import os
import tiktoken
import tkinter as tk
from tkinter import filedialog
from openai import OpenAI

# Retrieve API key securely
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("API key not found. Set 'OPENAI_API_KEY' as an environment variable.")

# Initialize OpenAI client
client = OpenAI(api_key=api_key)

# Function to count tokens in a string
def count_tokens(text, model="gpt-4o"):
    """Returns the number of tokens in a given text."""
    enc = tiktoken.encoding_for_model(model)
    return len(enc.encode(text))

# Function to count tokens in a file
def count_tokens_in_file(file_path, model="gpt-4o"):
    """Counts tokens in a text file."""
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            text = file.read()
            print(f"Read {len(text)} characters from the file.")
        return count_tokens(text, model), text
    except FileNotFoundError:
        print(f"Error: The file at {file_path} does not exist.")
        return 0, ""
    except Exception as e:
        print(f"Error reading file: {e}")
        return 0, ""

# Function to open file dialog
def select_file():
    """Opens a file dialog and returns the selected file path."""
    root = tk.Tk()
    root.withdraw()  # Hide the root window
    file_path = filedialog.askopenfilename(
        title="Select a text file",
        filetypes=[("Text Files", "*.txt"), ("All Files", "*.*")]
    )
    return file_path

# Ask user to select a file using Tkinter
print("Select a file to upload (or cancel to skip).")
file_path = select_file()

# Check if the user selected a file
file_tokens = 0
file_text = ""
if file_path:
    print(f"Selected file: {file_path}")
    file_tokens, file_text = count_tokens_in_file(file_path)
    if file_tokens == 0:
        print("No valid file content found.")
    else:
        print(f"File token estimate: {file_tokens} tokens")
else:
    print("No file selected.")

# Get user prompt
user_prompt = input("Enter your prompt: ")

# Count tokens for user input
user_prompt_tokens = count_tokens(user_prompt)
print(f"User prompt token estimate: {user_prompt_tokens} tokens")

# Define system message
system_message = {
    "role": "system",
    "content": "You are EduNova, an AI assistant designed to help teachers grade student assignments efficiently and fairly. Your role is to evaluate responses based on provided rubrics, answer keys, or general academic standards while maintaining a constructive and supportive tone. When assessing work, consider accuracy, clarity, depth of analysis, creativity (if applicable), and adherence to instructions. Provide detailed feedback highlighting strengths and areas for improvement, and suggest actionable steps for students to enhance their learning. If an answer is subjective, provide reasoned judgment while acknowledging alternative perspectives. Maintain neutrality, avoiding bias, and ensure consistency in grading. When uncertain, ask clarifying questions or suggest that the teacher review specific points. Your goal is to assist teachers in streamlining the grading process while promoting student growth and learning."
}

# Estimate total tokens before sending
total_tokens = file_tokens + user_prompt_tokens
print(f"Estimated total tokens: {total_tokens}")

# Token limit (adjust based on OpenAI plan)
TOKEN_LIMIT = 100_000  # Adjust this based on your OpenAI plan

# Check if the total tokens exceed the limit
if total_tokens < TOKEN_LIMIT:
    # Construct the messages for the API request
    messages = [system_message, {"role": "user", "content": user_prompt}]
    
    # Include file content if provided
    if file_text:
        messages.append({"role": "user", "content": f"Attached file content:\n{file_text}"})
    
    print("\nMaking API request with the following messages:")
    for message in messages:
        print(f"{message['role']}: {message['content'][:100]}...")  # Print first 100 characters

    try:
        # Make the API request
        completion = client.chat.completions.create(
            model="gpt-4o-2024-05-13",  # Use O1 Mini
            messages=messages
        )

        # Print the AI response
        print("\nAI Response:\n", completion.choices[0].message.content)

    except Exception as e:
        print(f"Error with OpenAI API request: {e}")
else:
    print("Token limit exceeded! Consider summarizing your input or reducing file size.")
