from transformers import LlavaNextProcessor, LlavaNextForConditionalGeneration, BitsAndBytesConfig
import torch
from PIL import Image
import requests
import json
import os
import re
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

class InfrastructureDamageAssessor:
    def __init__(self, model_path=r"C:\Users\samas\llava-v1.6-mistral-7b-hf"):
        self.model_path = model_path
        self.processor = None
        self.model = None
        self._load_model()
        
    def _load_model(self):
        """Load the model and processor once during initialization"""
        print("Loading model and processor...")
        
        self.processor = LlavaNextProcessor.from_pretrained(self.model_path)
        
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16, 
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4"
        )
        
        self.model = LlavaNextForConditionalGeneration.from_pretrained(
            self.model_path,
            torch_dtype=torch.float16,
            device_map="auto",
            quantization_config=bnb_config,
            trust_remote_code=True
        )
        
        print("Model loaded successfully!")
        print("Infrastructure Damage Assessment Tool Ready")
        print("=" * 60)
    
    def _load_image_from_url(self, image_url):
        """Load image from URL"""
        try:
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            image = Image.open(requests.get(image_url, stream=True).raw)
            return image.convert("RGB")
        except Exception as e:
            print(f"Error loading image from URL: {e}")
            return None
    
    def _load_image_from_path(self, image_path):
        """Load image from local path"""
        try:
            image = Image.open(image_path)
            return image.convert("RGB")
        except Exception as e:
            print(f"Error loading image from path: {e}")
            return None
    
    def _clean_response(self, response):
        """Clean the model response from unwanted tokens and repeated content"""
        
        # Remove common instruction tokens
        unwanted_tokens = ['[INST]', '[/INST]', '<s>', '</s>', '<|im_start|>', '<|im_end|>']
        for token in unwanted_tokens:
            response = response.replace(token, '')
        
        # Remove repeated prompt content patterns
        patterns_to_remove = [
            r'You are an expert infrastructure damage assessor.*?json format as [\'"]PriorityScore[\'"] = \.',
            r'SITUATION REPORT:.*?if not at all related rate them 0',
            r'Analyze this image.*?priority score in json format',
            r'ASSESSMENT CRITERIA:.*?SCORING SCALE:.*?- 1-29: MINIMAL.*?cosmetic or very minor issues',
        ]
        
        for pattern in patterns_to_remove:
            response = re.sub(pattern, '', response, flags=re.DOTALL | re.IGNORECASE)
        
        # Clean up extra whitespace and newlines
        response = re.sub(r'\n\s*\n', '\n', response)  # Remove empty lines
        response = response.strip()
        
        return response
    
    def assess_damage(self, heading, description, image_source):
        """
        Assess infrastructure damage and return priority score
        
        Args:
            heading (str): Brief title of the damage report
            description (str): Detailed description of the situation
            image_source (str): URL or local path to damage image
            
        Returns:
            dict: JSON response with priority_score (1-100) and reasoning
        """
        
        # Load image
        if image_source.startswith(('http://', 'https://')):
            image = self._load_image_from_url(image_source)
        else:
            image = self._load_image_from_path(image_source)
            
        if image is None:
            return {
                "priority_score": 0,
                "error": "Failed to load image",
                "reasoning": "Cannot assess damage without valid image"
            }
        
        # Create shortened assessment prompt to reduce repetition
        assessment_prompt = f"""You are an expert infrastructure damage assessor. Analyze this image of city infrastructure damage and provide a priority score.

SITUATION REPORT:
Heading: {heading}
Description: {description}

ASSESSMENT CRITERIA:
- Public Safety Risk (40 points): Immediate threat to life, injury potential
- Infrastructure Criticality (25 points): Essential services affected (power, water, transport, hospitals)  
- Economic Impact (20 points): Business disruption, repair costs, affected population size
- Urgency of Response (15 points): Risk of further deterioration, weather vulnerability

SCORING SCALE:
- 90-100: CRITICAL - Immediate emergency response required, life-threatening
- 70-89: HIGH - Urgent attention needed within hours, major service disruption
- 50-69: MEDIUM - Action required within days, moderate impact
- 30-49: LOW - Can wait for scheduled maintenance, minor impact  
- 1-29: MINIMAL - Cosmetic or very minor issues

Analyze the image carefully and provide ONLY a priority score (1-100) based on the visible damage severity, type of infrastructure affected, and potential consequences. Be specific and justify your score with clear reasoning based on what you observe in the image.
image can contain things which are false or ai generated or edited u need to give them a low priority 
if not at all related rate them 0
Respond with your assessment and priority score in json format as 'PriorityScore' = ."""

        try:
            conversation = [
                {
                    "role": "user",
                    "content": [
                        {"type": "image"},
                        {"type": "text", "text": assessment_prompt}
                    ],
                },
            ]
            
            prompt = self.processor.apply_chat_template(conversation, add_generation_prompt=True)
            inputs = self.processor(
                images=image,
                text=prompt,
                return_tensors="pt"
            ).to(self.model.device)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=350,  # Reduced from 300 to get cleaner responses
                    do_sample=True,
                    temperature=0.3,
                    top_p=0.9,
                    top_k=50,
                    pad_token_id=self.processor.tokenizer.eos_token_id
                )
            
            # FIXED: Decode only the newly generated tokens, excluding the input prompt
            input_length = inputs['input_ids'].shape[1]
            answer = self.processor.decode(outputs[0][input_length:], skip_special_tokens=True).strip()
            
            # Additional cleaning
            answer = self._clean_response(answer)
            
            # Extract priority score from response
            priority_score = self._extract_priority_score(answer)
            
            return {
                "priority_score": priority_score,
                "reasoning": answer,
                "heading": heading,
                "description": description
            }
            
        except Exception as e:
            return {
                "priority_score": 0,
                "error": f"Assessment failed: {str(e)}",
                "reasoning": "Technical error during damage assessment"
            }
    
    def _extract_priority_score(self, response_text):
        """Extract numerical priority score from model response"""
        
        # First try to extract from JSON structure
        try:
            # Look for JSON structure in response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                # Clean up the JSON string - remove any trailing text
                json_str = json_str.split('```')[0]  # Remove markdown code block endings
                
                parsed_json = json.loads(json_str)
                
                # Try different JSON key variations (case-insensitive search)
                def find_score_in_dict(d):
                    for key, value in d.items():
                        key_lower = key.lower().replace(' ', '').replace('_', '')
                        if key_lower in ['priorityscore', 'priority', 'score']:
                            if isinstance(value, (int, float)):
                                score = int(value)
                                if 0 <= score <= 100:  # Allow 0 for fake/unrelated images
                                    return score
                        elif isinstance(value, dict):
                            # Recursively search nested dictionaries
                            nested_score = find_score_in_dict(value)
                            if nested_score is not None:
                                return nested_score
                    return None
                
                score = find_score_in_dict(parsed_json)
                if score is not None:
                    return score
                    
        except (json.JSONDecodeError, ValueError, KeyError) as e:
            print(f"JSON parsing error: {e}")
            pass
        
        # Look for explicit score patterns in text
        score_patterns = [
            r'"PriorityScore"[:\s]*(\d{1,3})',
            r'"PRIORITY SCORE"[:\s]*(\d{1,3})',
            r'"priority_score"[:\s]*(\d{1,3})',
            r'priority score[:\s]*(\d{1,3})',
            r'score[:\s]*(\d{1,3})',
            r'priority[:\s]*(\d{1,3})',
            r'(\d{1,3})/100',
            r'(\d{1,3})\s*(?:points|pts)',
            r'(\d{1,3})\s*(?:out of 100)',
            r'final score[:\s]*(\d{1,3})',
            r'assessment[:\s]*(\d{1,3})',
        ]
        
        for pattern in score_patterns:
            matches = re.findall(pattern, response_text, re.IGNORECASE)
            if matches:
                score = int(matches[-1])  # Take the last match (most likely the final score)
                if 0 <= score <= 100:
                    return score
        
        # If no explicit score found, analyze response content for severity indicators
        response_lower = response_text.lower()
        
        # Check for fake/unrelated content indicators first
        if any(word in response_lower for word in ['game', 'video game', 'valorant', 'virtual', 'digital', 'fake', 'ai generated', 'not related']):
            return 0
        
        if any(word in response_lower for word in ['critical', 'emergency', 'life-threatening', 'immediate danger']):
            return 95
        elif any(word in response_lower for word in ['high', 'urgent', 'severe', 'major']):
            return 75
        elif any(word in response_lower for word in ['moderate', 'medium', 'significant']):
            return 55
        elif any(word in response_lower for word in ['low', 'minor', 'small']):
            return 35
        elif any(word in response_lower for word in ['minimal', 'cosmetic', 'negligible']):
            return 15
        
        # Default fallback
        return 50

# Initialize the assessor
# assessor = InfrastructureDamageAssessor()

# Example usage function
# def assess_infrastructure_damage(heading, description, image_source):
#     """
#     Main function to assess infrastructure damage
#
#     Args:
#         heading (str): Brief title of the damage
#         description (str): Detailed description
#         image_source (str): Image URL or local path
#
#     Returns:
#         str: JSON formatted result
#     """
#     result = assessor.assess_damage(heading, description, image_source)
#     return json.dumps(result, indent=2)

# Example usage:
# if __name__ == "__main__":
#     sample_heading = "Tree fell, wall broken"
#     sample_description = ""
#     sample_image = "https://bouldercityreview.com/wp-content/uploads/2022/08/16738593_web1_BCR-Rain-Storm-JUL29-22.jpg"
#
#     result = assess_infrastructure_damage(sample_heading, sample_description, sample_image)
#     print(result)
#
#     print("Infrastructure Damage Assessment Tool is ready!")
#     print("Use: assess_infrastructure_damage(heading, description, image_source)")