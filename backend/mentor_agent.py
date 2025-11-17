import os
import json
import re
from pathlib import Path
from groq import Groq
from tavily import TavilyClient


# ----------------- CONFIG -----------------
GROQ_API_KEY = ""
TAVILY_API_KEY = ""

groq_client = Groq(api_key=GROQ_API_KEY)
tavily_client = TavilyClient(api_key=TAVILY_API_KEY)

# ----------------- PEER MENTOR DATA -----------------
def load_peer_mentors_data():
    """Load peer mentor recommendations data from JSON file"""
    try:
        data_file = Path(__file__).parent / "peer_mentors_data.json"
        with open(data_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading peer mentors data: {e}")
        return {}

def get_peer_mentor_recommendations(category, limit=5):
    """
    Get peer mentor recommendations for a given category.
    
    Args:
        category: The career category (e.g., "Music", "Film/TV", "Business & Management")
        limit: Maximum number of recommendations to return (default: 5)
    
    Returns:
        List of peer mentor recommendations, or empty list if category not found
    """
    mentors_data = load_peer_mentors_data()
    
    if category not in mentors_data:
        return []
    
    mentors = mentors_data[category]
    # Sort by match_score (descending) and return top N
    sorted_mentors = sorted(mentors, key=lambda x: x.get('match_score', 0), reverse=True)
    return sorted_mentors[:limit]

def infer_category_from_job_title(job_title):
    """
    Try to infer the career category from a job title.
    
    Args:
        job_title: The job title to infer category from
    
    Returns:
        Category string or None if cannot be inferred
    """
    if not job_title:
        return None
    
    job_lower = job_title.lower()
    
    # Music-related keywords
    if any(keyword in job_lower for keyword in ['music', 'sound', 'audio', 'producer', 'composer', 'engineer', 'singer', 'musician']):
        return "Music"
    
    # Film/TV-related keywords
    if any(keyword in job_lower for keyword in ['film', 'tv', 'television', 'video', 'cinema', 'director', 'cinematographer', 'editor', 'producer']):
        return "Film/TV"
    
    # VFX/Animation-related keywords
    if any(keyword in job_lower for keyword in ['vfx', 'visual effects', 'animation', 'animator', '3d', 'motion graphics', 'lighting']):
        return "VFX/Animation"
    
    # Writing & Journalism-related keywords
    if any(keyword in job_lower for keyword in ['writer', 'journalist', 'screenwriter', 'copywriter', 'editor', 'content writer']):
        return "Writing & Journalism"
    
    # Sport-related keywords
    if any(keyword in job_lower for keyword in ['sport', 'athletic', 'coach', 'trainer', 'sports']):
        return "Sport"
    
    # Business & Management-related keywords
    if any(keyword in job_lower for keyword in ['manager', 'business', 'marketing', 'operations', 'project manager', 'talent manager']):
        return "Business & Management"
    
    return None

# ----------------- SYSTEM PROMPT -----------------
def system_prompt(job_title):
    return f"""
You are a senior career mentor specializing in the entertainment industry.
Your audience is young beginners (ages 18–25) exploring careers in film, TV, music, VFX, animation, gaming, digital content, performing arts, or entertainment business roles.

The user wants guidance about the career role: {job_title}.

Your job is to give friendly, simple, short, and practical answers.
Assume the user has zero experience and is just starting out.

Response style rules:

Keep answers short and to the point

Use 5–8 bullet points max (use simple dashes "-" or bullet symbols "•", NOT markdown)

Avoid long paragraphs

No jargon without a simple explanation

No repetition

Be supportive and realistic

If unsure, say "varies by project"

Only answer what the user asks, but your knowledge should cover all entertainment career topics

IMPORTANT FORMATTING RULES:
- DO NOT use markdown formatting like **bold**, *italic*, # headers, or any markdown syntax
- Use plain text only with simple bullet points using "-" or "•"
- Use line breaks and spacing for readability
- Keep formatting clean and simple
- Use emojis sparingly and only when appropriate

Your answers must be able to address:

Market demand for this role (short)

Job scope and where it fits in the production pipeline

Salary snapshot (entry → mid → senior) in major hubs (LA, NYC, Atlanta, Vancouver, London)

Typical day: tasks, tools, environments, collaborators

Skills needed (beginner-friendly technical + soft skills)

Portfolio/reel/audition basics (simple starter projects)

Beginner path: internships, assistant roles, freelance starter ideas

Career ladder: starter → mid → senior → lead

Education path: when degrees help, useful certificates, good online options

Networking for ages 18–25 (events, Discords, online communities, mentor outreach)

Freelancing basics: platforms, pricing, how to get first gigs

Job search advice: platforms, resume tips, internships

Personality fit and challenges beginners face

Location advice: opportunity hubs and remote possibilities

Lifestyle expectations: hours, travel, work-life balance

Unions/guilds (if relevant): IATSE, SAG-AFTRA, WGA, DGA

Technology impact: AI, virtual production, automation

Common beginner misconceptions

Red flags and early pitfalls to avoid

Motivation: supportive, actionable next steps

Rules:

Keep responses short and beginner-friendly

No hallucinations

Speak like a supportive mentor texting a young creative

FORMATTING REQUIREMENTS:
- NEVER use markdown syntax (**bold**, *italic*, # headers, etc.)
- Use plain text with simple formatting
- Use dashes "-" or bullet symbols "•" for lists
- Add blank lines between sections for readability
- Keep it clean and easy to read

"""


# ----------------- RESPONSE FORMATTING -----------------
def beautify_response(text):
    """
    Clean up markdown formatting and beautify the response text.
    
    Args:
        text: The raw response text from the LLM
    
    Returns:
        Beautified plain text without markdown
    """
    if not text:
        return text
    
    # Remove markdown bold (**text** or __text__)
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'__(.*?)__', r'\1', text)
    
    # Remove markdown italic (*text* or _text_)
    text = re.sub(r'(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)', r'\1', text)
    text = re.sub(r'(?<!_)_(?!_)(.*?)(?<!_)_(?!_)', r'\1', text)
    
    # Remove markdown headers (# Header)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    
    # Remove markdown code blocks (```code```)
    text = re.sub(r'```[\s\S]*?```', '', text)
    
    # Remove inline code (`code`)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    
    # Remove markdown links [text](url) -> text
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    
    # Remove markdown lists markers that might be duplicated
    # Convert numbered lists to simple bullets
    text = re.sub(r'^\d+\.\s+', '• ', text, flags=re.MULTILINE)
    
    # Ensure consistent spacing around bullet points
    text = re.sub(r'\n\s*[-•]\s+', '\n• ', text)
    
    # Clean up excessive blank lines (more than 2 consecutive)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Trim whitespace
    text = text.strip()
    
    return text

# ----------------- WEB SEARCH TOOL -----------------
def search_web(job_title, user_query):
    query = f"{job_title} job demand salary outlook {user_query}"
    try:
        result = tavily_client.search(
            query=query,
            max_results=5,
            include_answer=True
        )
        return result.get("answer", "")[:1500]
    except:
        return ""


# ----------------- LLM CALL -----------------
def ask_llm(job_title, message, conversation_history=None, category=None):
    """
    Ask the mentor agent a question about a job role.
    
    Args:
        job_title: The job role to ask about
        message: The user's question
        conversation_history: List of previous messages in format [{"role": "user", "content": "..."}, ...]
        category: Optional career category for peer mentor recommendations
    
    Returns:
        Tuple of (reply, updated_conversation_history, peer_mentors)
        - reply: The mentor's response
        - updated_conversation_history: Updated conversation history
        - peer_mentors: List of peer mentor recommendations if requested, otherwise None
    """
    if conversation_history is None:
        conversation_history = []
    
    # Check if user is asking for mentor or peer recommendations
    peer_mentors = None
    message_lower = message.lower()
    mentor_keywords = [
        "peer mentor", "connect with", "recommend someone", "find a mentor",
        "peer recommendations", "connect to peer", "peer connections",
        "recommend peers", "find peers", "peer network", "connect with peers",
        "recommend mentor", "recommend mentors", "show mentors", "show me mentors",
        "find mentors", "list mentors", "mentor recommendations", "suggest mentors",
        "who can i connect with", "connect me with", "introduce me to",
        "recommend a peer", "recommend peers", "peer mentor recommendations"
    ]
    
    is_asking_for_mentors = any(keyword in message_lower for keyword in mentor_keywords)
    
    if is_asking_for_mentors:
        # If category not provided, try to infer it from job_title
        if not category:
            category = infer_category_from_job_title(job_title)
        
        # If still no category, use a default or return mentors from all categories
        if category:
            # Get peer mentor recommendations from static JSON
            peer_mentors = get_peer_mentor_recommendations(category, limit=5)
        else:
            # If no category can be inferred, return mentors from the first available category
            mentors_data = load_peer_mentors_data()
            if mentors_data:
                # Get the first category available
                first_category = list(mentors_data.keys())[0]
                peer_mentors = get_peer_mentor_recommendations(first_category, limit=5)
        
        if peer_mentors:
            # Format peer mentors info for the response
            mentors_info = "\n\nHere are some peer mentors you can connect with:\n\n"
            for i, mentor in enumerate(peer_mentors, 1):
                mentors_info += f"{i}. {mentor['name']} - {mentor['role']} at {mentor['company']}\n"
                mentors_info += f"   Experience: {mentor['experience_years']} years | Location: {mentor['location']}\n"
                mentors_info += f"   Specialization: {mentor['specialization']}\n"
                mentors_info += f"   Bio: {mentor['bio']}\n"
                mentors_info += f"   Availability: {mentor['availability']}\n"
                mentors_info += f"   Contact: {mentor.get('email', 'N/A')} | LinkedIn: {mentor.get('linkedin', 'N/A')}\n\n"
            
            # Add peer mentors info to the message
            message = f"{message}\n\n{mentors_info}"
    
    # System instruction
    sys_prompt = system_prompt(job_title)

    # Web search snippet
    web_info = search_web(job_title, message)

    web_message = f"Web research summary:\n{web_info}\nUse it for grounding but don't copy."

    # Build messages
    messages = [
        {"role": "system", "content": sys_prompt},
        {"role": "system", "content": web_message},
    ] + conversation_history + [
        {"role": "user", "content": message}
    ]

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.2,
            max_tokens=700
        )

        reply = response.choices[0].message.content
        
        # Beautify the response by removing markdown and formatting nicely
        reply = beautify_response(reply)

        # Update conversation history
        updated_history = conversation_history + [
            {"role": "user", "content": message},
            {"role": "assistant", "content": reply}
        ]

        return reply, updated_history, peer_mentors
    except Exception as e:
        return f"Sorry, I encountered an error: {str(e)}", conversation_history, None


# ----------------- MAIN CHAT LOOP -----------------
if __name__ == "__main__":
    print("🎯 Mentor Agent Started")

    job_title = input("\nEnter a job title (e.g., Sound Engineer): ").strip()
    print(f"\n💬 Ask anything about: {job_title}")
    print("Type 'exit' to quit.\n")

    conversation_history = []
    while True:
        user_msg = input("You: ").strip()
        if user_msg.lower() in ["exit", "quit"]:
            print("👋 Goodbye!")
            break

        reply, conversation_history, peer_mentors = ask_llm(job_title, user_msg, conversation_history)
        print("\nMentor:", reply, "\n")
        if peer_mentors:
            print("📋 Peer Mentor Recommendations:")
            for mentor in peer_mentors:
                print(f"  - {mentor['name']} ({mentor['role']})")
            print()