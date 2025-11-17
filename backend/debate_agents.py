import json
import textwrap
import os
import logging
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from llm_classifier import classify_user_persona

# Google API Key - should be set via environment variable
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)

# Gemini model name - can be configured via environment variable
# Valid paid models: 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')

# Debug logging configuration
DEBUG_MODE = os.getenv('DEBUG_DEBATE', 'false').lower() in ('true', '1', 'yes', 'on')
LOG_LEVEL = logging.DEBUG if DEBUG_MODE else logging.INFO

# Configure logging with explicit console handler to ensure output to terminal
logger = logging.getLogger(__name__)
logger.setLevel(LOG_LEVEL)

# Remove existing handlers to avoid duplicates
logger.handlers = []

# Create console handler that outputs to stderr (visible in terminal)
console_handler = logging.StreamHandler()
console_handler.setLevel(LOG_LEVEL)

# Create formatter
formatter = logging.Formatter(
    '%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
console_handler.setFormatter(formatter)

# Add handler to logger
logger.addHandler(console_handler)

# Prevent propagation to root logger to avoid duplicate messages
logger.propagate = False

# Print debug status immediately to terminal
if DEBUG_MODE:
    print("🐛 DEBUG MODE ENABLED - Detailed logging active", flush=True)
    logger.info("🐛 DEBUG MODE ENABLED - Detailed logging active")
    logger.debug(f"Using Gemini model: {GEMINI_MODEL}")
    logger.debug(f"Google API Key configured: {'Yes' if GOOGLE_API_KEY else 'No'}")
else:
    print(f"ℹ️  Debug mode is OFF. Set DEBUG_DEBATE=true to enable detailed logs", flush=True)

# Role mapping for each career category
CATEGORY_ROLES = {
    "Business & Management": [
        "Project Manager",
        "Event Coordinator",
        "Talent Manager",
        "Production Manager",
        "Marketing Manager",
        "Business Development Manager",
        "Operations Manager",
        "Content Strategist",
        "Brand Manager",
        "Account Executive"
    ],
    "Sport": [
        "Athletic Trainer",
        "Sports Coach",
        "Sports Analyst",
        "Sports Journalist",
        "Fitness Instructor",
        "Sports Marketing Specialist",
        "Sports Event Coordinator",
        "Athletic Director",
        "Sports Agent",
        "Performance Analyst"
    ],
    "Music": [
        "Music Producer",
        "Sound Engineer",
        "Music Composer",
        "Music Director",
        "Audio Mixer",
        "Music Arranger",
        "Recording Engineer",
        "Music Supervisor",
        "Live Sound Technician",
        "Music Programmer"
    ],
    "Film/TV": [
        "Film Director",
        "Cinematographer",
        "Video Editor",
        "TV Producer",
        "Script Supervisor",
        "Camera Operator",
        "Production Assistant",
        "Film Editor",
        "TV Director",
        "Content Creator"
    ],
    "VFX/Animation": [
        "3D Animator",
        "VFX Artist",
        "Motion Graphics Designer",
        "Character Animator",
        "Visual Effects Supervisor",
        "Compositor",
        "Rigging Artist",
        "Texture Artist",
        "Lighting Artist",
        "Storyboard Artist"
    ],
    "Writing & Journalism": [
        "Screenwriter",
        "Content Writer",
        "Journalist",
        "Copywriter",
        "Script Writer",
        "Editor",
        "Technical Writer",
        "Creative Writer",
        "News Reporter",
        "Content Editor"
    ]
}

@dataclass
class DebateAgent:
    """An agent that participates in a debate about career paths."""
    name: str
    role: str
    model: genai.GenerativeModel
    position: str
    arguments: List[str] = None
    persona: str = "neutral"
    
    def prepare_arguments(self, user_persona: Dict[str, Any]) -> None:
        """Prepare initial arguments based on the user's persona and the agent's role."""
        prompt = f"""You are a {self.persona} career advisor arguing for the role of {self.role}.
        
User's profile:
{json.dumps(user_persona, indent=2)}

Present 1 strong argument why the user would be successful as a {self.role}.
Focus on how their skills and personality align with this role.
Keep your response concise and to the point.
"""
        try:
            logger.debug(f"[{self.name}] Preparing arguments for role: {self.role}")
            logger.debug(f"[{self.name}] Prompt length: {len(prompt)} characters")
            if DEBUG_MODE:
                logger.debug(f"[{self.name}] Prompt preview: {prompt[:200]}...")
            
            response = self.model.generate_content(prompt)
            
            if DEBUG_MODE:
                logger.debug(f"[{self.name}] API Response received")
                logger.debug(f"[{self.name}] Response text length: {len(response.text) if response.text else 0} characters")
                if response.usage_metadata:
                    logger.debug(f"[{self.name}] Token usage: {response.usage_metadata}")
            
            self.arguments = [response.text.strip()]
            logger.debug(f"[{self.name}] Arguments prepared successfully: {self.arguments[0][:100]}...")
        except Exception as e:
            logger.error(f"[{self.name}] Error preparing arguments: {str(e)}", exc_info=DEBUG_MODE)
            print(f"Error preparing arguments for {self.name}: {str(e)}")
            self.arguments = [f"I believe the user would excel as a {self.role}."]

    def rebut(self, opponent_arguments: List[str], opponent_role: str) -> str:
        """Generate a rebuttal to the opponent's arguments."""
        prompt = f"""You are a {self.persona} career advisor arguing for the role of {self.role}.
        
Your opponent, who supports the role of {opponent_role}, made these points:
{chr(10).join(opponent_arguments)}

Provide a 1-sentence counter-argument explaining why {self.role} is still the better choice.
"""
        try:
            logger.debug(f"[{self.name}] Generating rebuttal against {opponent_role}")
            logger.debug(f"[{self.name}] Opponent arguments: {opponent_arguments}")
            
            response = self.model.generate_content(prompt)
            
            if DEBUG_MODE:
                logger.debug(f"[{self.name}] Rebuttal response received")
                if response.usage_metadata:
                    logger.debug(f"[{self.name}] Token usage: {response.usage_metadata}")
            
            rebuttal = response.text.strip()
            logger.debug(f"[{self.name}] Rebuttal generated: {rebuttal[:100]}...")
            return rebuttal
        except Exception as e:
            logger.error(f"[{self.name}] Error generating rebuttal: {str(e)}", exc_info=DEBUG_MODE)
            print(f"Error generating rebuttal for {self.name}: {str(e)}")
            return f"While {opponent_role} has merit, {self.role} is still the better fit."

@dataclass
class ModeratorAgent:
    """An agent that reviews the debate and makes a final recommendation."""
    name: str = "Moderator"
    model: genai.GenerativeModel = None
    
    def review_debate(self, debate_transcript: str, user_persona: Dict[str, Any]) -> Dict[str, Any]:
        """Review the debate and make a final recommendation.
        
        Args:
            debate_transcript: Full transcript of the debate
            user_persona: Dictionary containing user's profile information
            
        Returns:
            Dictionary containing the moderator's recommendation and analysis
        """
        prompt = f"""You are a career advisor moderating a debate about the best career path for a user.

User Profile:
{json.dumps(user_persona, indent=2)}

Debate Transcript:
{debate_transcript}

Your task is to:
1. Analyze the arguments presented by each debater
2. Consider the user's personality traits and preferences
3. Recommend the most suitable role for the user
4. Provide a brief explanation for your recommendation

Format your response as a JSON object with these keys:
- "recommended_role": The role you recommend
- "confidence": Your confidence level (1-10)
- "reason": Your explanation
- "pros": List of strengths for this role
- "considerations": Any important factors to consider

IMPORTANT: Your response MUST be valid JSON. Only output the JSON object, nothing else.
"""
        try:
            logger.debug("[Moderator] Reviewing debate and generating recommendation")
            logger.debug(f"[Moderator] Debate transcript length: {len(debate_transcript)} characters")
            if DEBUG_MODE:
                logger.debug(f"[Moderator] Prompt preview: {prompt[:300]}...")
            
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            if DEBUG_MODE:
                logger.debug(f"[Moderator] Raw response: {response_text}")
                if response.usage_metadata:
                    logger.debug(f"[Moderator] Token usage: {response.usage_metadata}")
            
            # Clean the response
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            logger.debug(f"[Moderator] Cleaned response: {response_text}")
            
            result = json.loads(response_text)
            logger.debug(f"[Moderator] Parsed recommendation: {result}")
            return result
            
        except Exception as e:
            logger.error(f"[Moderator] Error in review: {str(e)}", exc_info=DEBUG_MODE)
            print(f"Error in moderator review: {str(e)}")
            print(f"Raw response: {getattr(response, 'text', 'No response text')}")
            return {
                "recommended_role": "Unknown",
                "confidence": 0,
                "reason": f"Error in processing debate: {str(e)}",
                "pros": [],
                "considerations": []
            }

def conduct_debate(agents: List[DebateAgent], user_persona: Dict[str, Any], category: str = None, verbose: bool = True, stream_callback: callable = None) -> Dict[str, Any]:
    """Conduct a debate between multiple agents and include moderator review.
    
    Args:
        agents: List of DebateAgent instances
        user_persona: Dictionary containing user's profile information
        category: Optional predicted career category
        verbose: Whether to print detailed output (default: True)
        stream_callback: Optional callback function(event_type, data) to stream events
    
    Returns:
        Dictionary containing the moderator's review and recommendation
    """
    def emit(event_type, data):
        """Helper to emit events to both callback and print"""
        if stream_callback:
            stream_callback(event_type, data)
        if verbose:
            if event_type == "header":
                print("=" * 80)
                print(data.get("message", ""))
                print("=" * 80)
            elif event_type == "info":
                print(data.get("message", ""))
            elif event_type == "agent_argument":
                print(f"\n{data.get('agent_name', '')} ({data.get('role', '')}) presents their case:")
                print(f"- {data.get('argument', '')}")
            elif event_type == "rebuttal":
                print(f"\n{data.get('agent_name', '')} responds to {data.get('opponent_name', '')}:")
                print(textwrap.fill(data.get('rebuttal', ''), width=80))
            elif event_type == "moderator_review":
                print("\n" + "="*30 + " MODERATOR REVIEW " + "="*30)
                print("\nAnalyzing the debate and user profile...\n")
            elif event_type == "conclusion":
                print(f"\n🎯 FINAL RECOMMENDATION: {data.get('recommended_role', '')}")
                print(f"   Confidence: {'⭐' * int(data.get('confidence', 0))} ({data.get('confidence', 0)}/10)")
                print(f"\n📝 Reason: {data.get('reason', '')}")
                if data.get('pros'):
                    print("\n✅ Key Strengths:")
                    for pro in data.get('pros', []):
                        print(f"   • {pro}")
                if data.get('considerations'):
                    print("\nℹ️  Considerations:")
                    for consideration in data.get('considerations', []):
                        print(f"   • {consideration}")
                print("\n" + "="*30 + " DEBATE CONCLUDED " + "="*30)
    
    emit("header", {"message": "DEBATE: Best Career Path for the User"})
    if category:
        emit("info", {"message": f"Category: {category}"})
    emit("info", {"message": f"User Profile: {user_persona.get('user_input_summary', 'No profile available')}\n"})
    
    debate_transcript = []
    
    # Initial arguments
    for agent in agents:
        emit("info", {"message": f"\nPreparing arguments for {agent.name} ({agent.role})..."})
        agent.prepare_arguments(user_persona)
        for arg in agent.arguments:
            debate_transcript.append(f"{agent.name}: {arg}")
            emit("agent_argument", {
                "agent_name": agent.name,
                "role": agent.role,
                "argument": arg
            })
    
    # Rebuttal round
    emit("header", {"message": "REBUTTAL ROUND"})
    for agent in agents:
        opponents = [a for a in agents if a != agent]
        for opponent in opponents:
            emit("info", {"message": f"\n{agent.name} preparing rebuttal to {opponent.name}..."})
            rebuttal = agent.rebut(opponent.arguments, opponent.role)
            debate_transcript.append(f"{agent.name} (rebuttal to {opponent.name}): {rebuttal}")
            emit("rebuttal", {
                "agent_name": agent.name,
                "opponent_name": opponent.name,
                "rebuttal": rebuttal
            })
    
    # Add moderator review
    moderator = ModeratorAgent(model=agents[0].model)
    emit("moderator_review", {"message": "Moderator is analyzing the debate..."})
    
    review = moderator.review_debate("\n".join(debate_transcript), user_persona)
    
    # Emit conclusion
    emit("conclusion", {
        "recommended_role": review.get('recommended_role', ''),
        "confidence": review.get('confidence', 0),
        "reason": review.get('reason', ''),
        "pros": review.get('pros', []),
        "considerations": review.get('considerations', [])
    })
    
    # Show all debated roles for reference
    emit("info", {"message": "\nRoles considered in this debate:"})
    for i, agent in enumerate(agents, 1):
        emit("info", {"message": f"{i}. {agent.role} (presented by {agent.name})"})
    
    # Return the review along with debated roles
    return {
        "moderator_review": review,
        "debated_roles": [agent.role for agent in agents],
        "debate_transcript": debate_transcript
    }

@dataclass
class RoleSelector:
    """Agent responsible for selecting top 3 roles for the user based on predicted category."""
    model: genai.GenerativeModel
    
    def select_top_roles(self, user_persona: Dict[str, Any], category: str) -> List[str]:
        """Select top 3 roles based on user persona and predicted category.
        
        Args:
            user_persona: Dictionary containing user's profile information
            category: The predicted career category from LLM classifier
            
        Returns:
            List of 3 role names ordered by suitability
        """
        # Get available roles for the category
        available_roles = CATEGORY_ROLES.get(category, [])
        
        if not available_roles:
            print(f"⚠️  Warning: No roles found for category '{category}'. Using default roles.")
            # Fallback to Business & Management roles
            available_roles = CATEGORY_ROLES.get("Business & Management", [])
        
        if len(available_roles) < 3:
            print(f"⚠️  Warning: Only {len(available_roles)} roles available for category '{category}'.")
            return available_roles[:3] if available_roles else ["Unknown Role 1", "Unknown Role 2", "Unknown Role 3"]
        
        prompt = f"""Analyze the following user profile and select the top 3 most suitable roles from the available roles for the category: {category}.

User Profile:
{json.dumps(user_persona, indent=2)}

Available Roles for {category}:
{chr(10).join(f"{i+1}. {role}" for i, role in enumerate(available_roles))}

Your response must be a valid JSON array of exactly 3 role names (matching exactly from the list above), ordered by suitability.
Example: ["Role 1", "Role 2", "Role 3"]

IMPORTANT: 
- Only output the JSON array, with no additional text, markdown, or formatting.
- The role names must match exactly from the available roles list above.
"""
        try:
            logger.debug(f"[RoleSelector] Selecting top 3 roles for category: {category}")
            logger.debug(f"[RoleSelector] Available roles: {available_roles}")
            if DEBUG_MODE:
                logger.debug(f"[RoleSelector] Prompt preview: {prompt[:300]}...")
            
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            if DEBUG_MODE:
                logger.debug(f"[RoleSelector] Raw response: {response_text}")
                if response.usage_metadata:
                    logger.debug(f"[RoleSelector] Token usage: {response.usage_metadata}")
            
            # Clean the response
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            logger.debug(f"[RoleSelector] Cleaned response: {response_text}")
            
            # Parse the JSON
            roles = json.loads(response_text)
            logger.debug(f"[RoleSelector] Parsed roles: {roles}")
            
            # Ensure we have exactly 3 roles
            if not isinstance(roles, list) or len(roles) != 3:
                raise ValueError("Expected exactly 3 roles")
            
            # Validate that all roles are in the available roles list
            valid_roles = []
            for role in roles:
                if role in available_roles:
                    valid_roles.append(role)
                else:
                    # Try to find a close match
                    for available_role in available_roles:
                        if role.lower() in available_role.lower() or available_role.lower() in role.lower():
                            valid_roles.append(available_role)
                            break
                    else:
                        print(f"⚠️  Warning: Role '{role}' not found in available roles. Skipping.")
            
            # If we don't have 3 valid roles, fill with available roles
            while len(valid_roles) < 3 and len(valid_roles) < len(available_roles):
                for role in available_roles:
                    if role not in valid_roles:
                        valid_roles.append(role)
                        break
            
            return valid_roles[:3]
            
        except Exception as e:
            logger.error(f"[RoleSelector] Error selecting roles: {str(e)}", exc_info=DEBUG_MODE)
            print(f"Error selecting roles: {str(e)}")
            try:
                raw_response = getattr(response, 'text', 'No response text')
                logger.debug(f"[RoleSelector] Raw response on error: {raw_response}")
                print(f"Raw response: {raw_response}")
            except:
                logger.debug("[RoleSelector] Raw response not available")
                print("Raw response: Not available")
            # Fallback to first 3 roles from the category
            return available_roles[:3]

def main(user_persona: Dict[str, Any] = None, user_persona_file: str = None, predicted_category: str = None, verbose: bool = True, stream_callback: callable = None) -> Dict[str, Any]:
    """Main function to execute the debate simulation.
    
    Args:
        user_persona: Optional dictionary containing user persona data. If not provided, will load from file.
        user_persona_file: Optional path to user persona JSON file. Defaults to 'Test/uuid003_final_userpersona.json'
    
    Returns:
        Dictionary containing debate results including predicted category, selected roles, and moderator recommendation
    """
    try:
        # Initialize the Gemini model (using paid model)
        logger.info(f"🤖 Initializing Gemini model: {GEMINI_MODEL}")
        print(f"🤖 Initializing Gemini model: {GEMINI_MODEL}")
        model = genai.GenerativeModel(GEMINI_MODEL)
        logger.debug(f"Model initialized successfully: {GEMINI_MODEL}")
        
        # Load user persona if not provided
        if user_persona is None:
            if user_persona_file is None:
                user_persona_file = 'Test/uuid003_final_userpersona.json'
            
            logger.info(f"Loading user persona from: {user_persona_file}")
            print(f"Loading user persona from: {user_persona_file}")
            with open(user_persona_file, 'r') as f:
                user_persona = json.load(f)
            logger.debug(f"User persona loaded: {len(str(user_persona))} characters")
        else:
            logger.debug(f"User persona provided directly: {len(str(user_persona))} characters")
        
        # Helper function to emit step events
        def emit_step(event_type, data):
            if stream_callback:
                stream_callback(event_type, data)
            if verbose:
                if event_type == "step_header":
                    print("\n" + "=" * 80)
                    print(data.get("message", ""))
                    print("=" * 80)
                elif event_type == "step_info":
                    print(data.get("message", ""))
                elif event_type == "step_success":
                    print(f"\n✅ {data.get('message', '')}")
        
        # Step 1: Classify user persona using LLM classifier (if not provided)
        if predicted_category is None:
            logger.info("STEP 1: Classifying user persona")
            emit_step("step_header", {"message": "STEP 1: CLASSIFYING USER PERSONA"})
            emit_step("step_info", {"message": "Calling LLM classifier to predict career category...\n"})
            
            predicted_category = classify_user_persona(
                json_data=user_persona,
                region=os.getenv('AWS_REGION', 'us-east-1'),
                verbose=verbose
            )
            logger.info(f"Predicted category: {predicted_category}")
            
            if predicted_category == "Unknown":
                logger.warning("Could not classify user persona, using default")
                emit_step("step_info", {"message": "⚠️  Warning: Could not classify user persona. Using 'Business & Management' as default."})
                predicted_category = "Business & Management"
        else:
            logger.info(f"Using provided predicted category: {predicted_category}")
        
        emit_step("step_success", {"message": f"Predicted Category: {predicted_category}"})
        emit_step("step_info", {"message": f"   Available roles for this category: {len(CATEGORY_ROLES.get(predicted_category, []))}"})
        logger.debug(f"Available roles for {predicted_category}: {CATEGORY_ROLES.get(predicted_category, [])}")
        
        # Step 2: Select top 3 roles based on predicted category
        emit_step("step_header", {"message": "STEP 2: SELECTING TOP 3 ROLES"})
        emit_step("step_info", {"message": f"Analyzing user profile to determine top 3 roles from '{predicted_category}' category...\n"})
        
        logger.info("STEP 2: Selecting top 3 roles")
        selector = RoleSelector(model)
        top_roles = selector.select_top_roles(user_persona, predicted_category)
        logger.info(f"Selected top 3 roles: {top_roles}")
        emit_step("step_success", {"message": f"Selected top 3 roles for debate: {', '.join(top_roles)}\n"})
        
        # Step 3: Conduct debate
        logger.info("STEP 3: Conducting debate")
        emit_step("step_header", {"message": "STEP 3: CONDUCTING DEBATE"})
        
        # Define agent personas based on category
        personas = {
            "Agent 1": "business-oriented, focusing on leadership and management skills",
            "Agent 2": "technically-minded, focusing on skills and expertise",
            "Agent 3": "creatively-inclined, focusing on innovation and problem-solving"
        }
        
        # Adjust personas based on category
        if predicted_category == "Music":
            personas = {
                "Agent 1": "musically-inclined, focusing on creative expression and artistic vision",
                "Agent 2": "technically-oriented, focusing on production and sound engineering",
                "Agent 3": "business-minded, focusing on industry connections and career growth"
            }
        elif predicted_category == "Film/TV":
            personas = {
                "Agent 1": "creatively-driven, focusing on storytelling and visual narrative",
                "Agent 2": "technically-skilled, focusing on production and post-production",
                "Agent 3": "collaborative, focusing on teamwork and industry relationships"
            }
        elif predicted_category == "VFX/Animation":
            personas = {
                "Agent 1": "artistically-focused, emphasizing creativity and visual design",
                "Agent 2": "technically-proficient, emphasizing software skills and technical expertise",
                "Agent 3": "project-oriented, emphasizing efficiency and meeting deadlines"
            }
        elif predicted_category == "Writing & Journalism":
            personas = {
                "Agent 1": "creatively-driven, focusing on storytelling and narrative structure",
                "Agent 2": "analytically-minded, focusing on research and factual accuracy",
                "Agent 3": "communication-focused, emphasizing clarity and audience engagement"
            }
        elif predicted_category == "Sport":
            personas = {
                "Agent 1": "performance-oriented, focusing on athletic excellence and training",
                "Agent 2": "strategically-minded, focusing on coaching and game analysis",
                "Agent 3": "business-focused, emphasizing career management and opportunities"
            }
        
        # Create debate agents with different personas
        agents = []
        for i, (role, (agent_name, persona_desc)) in enumerate(zip(top_roles, personas.items()), 1):
            agents.append(
                DebateAgent(
                    name=f"{agent_name}",
                    role=role,
                    model=model,
                    position=f"The user would be most successful as a {role}.",
                    persona=persona_desc
                )
            )
        
        # Conduct the debate
        logger.info(f"Starting debate with {len(agents)} agents")
        debate_results = conduct_debate(agents, user_persona, predicted_category, verbose=verbose, stream_callback=stream_callback)
        logger.info(f"Debate completed. Recommended role: {debate_results.get('moderator_review', {}).get('recommended_role', 'Unknown')}")
        
        # Return results including moderator recommendation
        return {
            "predicted_category": predicted_category,
            "selected_roles": top_roles,
            "category_roles_available": CATEGORY_ROLES.get(predicted_category, []),
            "recommended_role": debate_results["moderator_review"].get("recommended_role", ""),
            "confidence": debate_results["moderator_review"].get("confidence", 0),
            "reason": debate_results["moderator_review"].get("reason", ""),
            "pros": debate_results["moderator_review"].get("pros", []),
            "considerations": debate_results["moderator_review"].get("considerations", []),
            "debated_roles": debate_results["debated_roles"]
        }
        
    except FileNotFoundError as e:
        print(f"Error: Could not find the user persona file: {e}")
        return {"error": f"File not found: {e}"}
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in user persona file: {e}")
        return {"error": f"Invalid JSON: {e}"}
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}



if __name__ == "__main__":
    main()