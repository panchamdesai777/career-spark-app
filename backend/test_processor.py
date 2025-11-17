import json
import boto3
import re
from typing import Dict, Any, Optional
from collections import defaultdict # Added for the merge strategy

personality_questions = {
  "user_id": "uuid001",
  "traits": [
    "emotional_resilience",
    "introversion",
    "extroversion",
    "analytical_thinking",
    "creativity",
    "risk_appetite",
    "creative_preference",
    "technical_preference",
    "organizational_preference",
    "action_preference"
  ],

  "questions": {
    "Q1": {
      "question": "When things go wrong unexpectedly, how quickly do you regain your balance? (1–5)",
      "type": "likert",
      "trait": "emotional_resilience",
      "weight": 2
    },

    "Q2": {
      "question": "After a long day, what recharges you more?",
      "type": "choice",
      "answers": {
        "Spending time alone": { "introversion": 2 },
        "Being around people": { "extroversion": 2 }
      }
    },

    "Q3": {
      "question": "Which describes you better?",
      "type": "choice",
      "answers": {
        "Logical & structured": { "analytical_thinking": 2 },
        "Intuitive & imaginative": { "creativity": 2 }
      }
    },

    "Q4": {
      "question": "How willing are you to take risks? (1–5)",
      "type": "likert",
      "trait": "risk_appetite",
      "weight": 2
    },

    "Q5": {
      "question": "What kind of work do you enjoy more?",
      "type": "choice",
      "answers": {
        "Creative": { "creative_preference": 2 },
        "Technical": { "technical_preference": 2 },
        "Organizational": { "organizational_preference": 2 },
        "Action-oriented": { "action_preference": 2 }
      }
    }
  }
}

def process_responses(personality_questions: Dict, user_responses: Dict) -> Dict:
    """
    Process user responses and map them to personality trait scores.
    
    Args:
        personality_questions: Dictionary containing questions and their scoring rules
        user_responses: Dictionary containing user's responses
        
    Returns:
        Dictionary containing processed results with questions, responses, and scores
    """
    results = {
        "user_id": user_responses.get("user_id", "unknown"),
        "questions": personality_questions,
        "responses": [],
        "trait_scores": defaultdict(int)
    }
    
    # Get the answers from user_responses
    answers = user_responses.get("answers", {})
    
    # Process each answer
    for qid, answer in answers.items():
        if qid not in personality_questions["questions"]:
            print(f"Warning: QID {qid} not found in questions mapping")
            continue
            
        question_data = personality_questions["questions"][qid]
        qtype = question_data["type"]
        question_text = question_data["question"]
        trait_scores = {}
        
        # Process based on question type
        if qtype in ["likert", "likert_reverse"]:
            try:
                value = int(answer)
                trait = question_data["trait"]
                weight = question_data.get("weight", 1)
                
                # Calculate score based on likert scale
                if 1 <= value <= 5:
                    if qtype == "likert":
                        if value >= 4:
                            score = weight
                        elif value <= 2:
                            score = -weight
                        else:
                            score = 0
                    else:  # likert_reverse
                        if value >= 4:
                            score = -weight
                        elif value <= 2:
                            score = weight
                        else:
                            score = 0
                    
                    trait_scores[trait] = score
                    results["trait_scores"][trait] += score
            except (ValueError, TypeError):
                print(f"Warning: Invalid likert value '{answer}' for QID {qid}")
                
        elif qtype == "choice":
            if answer in question_data.get("answers", {}):
                trait_scores = question_data["answers"][answer]
                for trait, score in trait_scores.items():
                    results["trait_scores"][trait] += score
            else:
                print(f"Warning: Answer '{answer}' not found for QID {qid}")
        
        # Record the scoring details
        results["responses"].append({
            "question_id": qid,
            "question": question_text,
            "user_response": answer,
            "type": qtype,
            "traits_affected": trait_scores
        })
    
    # Convert defaultdict to regular dict for JSON serialization
    results["trait_scores"] = dict(results["trait_scores"])
    
    return results

# Example usage:
if __name__ == "__main__":
    # Example user responses
    user_responses = {
        "user_id": "user123",
        "timestamp": "2023-11-15T10:00:00Z",
        "answers": {
            "Q1": 4,  # High emotional_resilience
            "Q2": "Spending time alone",  # introversion +2
            "Q3": "Logical & structured",  # analytical_thinking +2
            "Q4": 3,  # Moderate risk_appetite
            "Q5": "Creative"  # creative_preference +2
        }
    }
    
    # Process the responses
    results = process_responses(personality_questions, user_responses)
    
    # Print detailed results
    print("=== Response Analysis ===")
    for response in results["responses"]:
        print(f"\nQ: {response['question']}")
        print(f"A: {response['user_response']}")
        if response["traits_affected"]:
            print("Traits affected:", response["traits_affected"])
    
    print("\n=== Final Trait Scores ===")
    for trait, score in results["trait_scores"].items():
        print(f"{trait}: {score}")
    
    # Save full results to a file
    with open("personality_analysis.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print("\nFull results saved to personality_analysis.json")