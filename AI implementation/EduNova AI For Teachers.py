import os
import tkinter as tk
from tkinter import filedialog
import PyPDF2
import tiktoken
import speech_recognition as sr
from openai import OpenAI
import datetime

# Retrieve API key securely
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("API key not found. Set 'OPENAI_API_KEY' as an environment variable.")


client = OpenAI(api_key=api_key)


def get_time_based_greeting():
    current_hour = datetime.datetime.now().hour
    if 5 <= current_hour < 12:
        return "Good morning!"
    elif 12 <= current_hour < 17:
        return "Good afternoon!"
    elif 17 <= current_hour < 22:
        return "Good evening!"
    else:
        return "Good night!"


def select_files():
    root = tk.Tk()
    root.withdraw()
    file_paths = filedialog.askopenfilenames(filetypes=[("Text files", "*.txt"), ("PDF files", "*.pdf")])
    return file_paths


def read_file(file_path):
    if file_path.endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()
    elif file_path.endswith(".pdf"):
        with open(file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            return "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
    return ""


def estimate_tokens(text):
    enc = tiktoken.get_encoding("cl100k_base")
    return len(enc.encode(text))


def speech_to_text():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Say something...")
        audio = recognizer.listen(source)
    try:
        return recognizer.recognize_google(audio)
    except sr.UnknownValueError:
        return "Could not understand audio."
    except sr.RequestError:
        return "Could not request results. Check internet connection."


def generate_quiz(content):
    quiz_prompt = f"Generate a 5-question quiz based on the following content: {content[:1000]}"
    response = client.chat.completions.create(
        model="gpt-4o-2024-05-13",
        messages=[{"role": "system", "content": "You generate educational quizzes based on given text."},
                  {"role": "user", "content": quiz_prompt}]
    )
    return response.choices[0].message.content


def show_help():
    help_text = """ 
    EduNova Chatbot Features:
    1️⃣ **Rubric Upload:** Upload grading rubrics (TXT/PDF) for AI-assisted grading.
    2️⃣ **Bulk Grading:** Select multiple student assignments for quick evaluation.
    3️⃣ **Export Feedback:** Save feedback as TXT, CSV, or PDF.
    4️⃣ **Speech-to-Text:** Use voice input instead of typing prompts.
    5️⃣ **Quiz Generation:** AI creates quizzes based on uploaded material.
    """
    print(help_text)


if __name__ == "__main__":
    greeting = get_time_based_greeting()
    print(f"{greeting} Welcome to EduNova! Type 'help' for a list of features.")
    user_choice = input("Would you like to upload a file for grading? (yes/no/help): ").strip().lower()

    if user_choice == "help":
        show_help()
    elif user_choice == "yes":
        files = select_files()
        for file_path in files:
            content = read_file(file_path)
            token_estimate = estimate_tokens(content)
            print(f"Processing {file_path} (Estimated Tokens: {token_estimate})...\n")
            
            
            system_message = {"role": "system", "content": "You assist teachers in grading assignments fairly and efficiently."}
            completion = client.chat.completions.create(
                model="gpt-4o-2024-05-13",
                messages=[system_message, {"role": "user", "content": content}]
            )
            
            feedback = completion.choices[0].message.content
            print(f"Feedback for {file_path}:\n{feedback}\n")
            
            
            save_option = input("Save feedback to file? (yes/no): ").strip().lower()
            if save_option == "yes":
                with open(file_path + "_feedback.txt", "w", encoding="utf-8") as f:
                    f.write(feedback)
                print(f"Feedback saved as {file_path}_feedback.txt")
    else:
        user_prompt = input("Enter your prompt (or say 'voice' for speech input): ")
        if user_prompt.lower() == "voice":
            user_prompt = speech_to_text()

        system_message = {"role": "system", "content": "You assist teachers in grading and educational support."}
        completion = client.chat.completions.create(
            model="gpt-4o-2024-05-13",
            messages=[system_message, {"role": "user", "content": user_prompt}]
        )
        print(completion.choices[0].message.content)
