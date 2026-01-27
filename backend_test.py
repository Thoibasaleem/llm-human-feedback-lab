import requests
import sys
import json
from datetime import datetime

class LLMFeedbackLabTester:
    def __init__(self, base_url="https://llm-eval-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.generated_response = None

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timed out after {timeout} seconds")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_generate_response(self):
        """Test AI response generation"""
        test_prompt = "Explain the concept of machine learning in simple terms."
        success, response = self.run_test(
            "Generate AI Response",
            "POST",
            "generate",
            200,
            data={"prompt": test_prompt},
            timeout=60  # Longer timeout for AI generation
        )
        
        if success and response:
            # Validate response structure
            required_fields = ['id', 'prompt', 'response', 'timestamp', 'quality_warnings']
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                print(f"❌ Missing required fields: {missing_fields}")
                return False, None
            
            # Check quality warnings functionality
            if isinstance(response.get('quality_warnings'), list):
                print(f"   Quality warnings: {len(response['quality_warnings'])} found")
                for warning in response['quality_warnings']:
                    print(f"     - {warning}")
            
            # Check response content
            if len(response['response']) > 0:
                print(f"   Response length: {len(response['response'])} characters")
                self.generated_response = response
                return True, response
            else:
                print("❌ Empty response generated")
                return False, None
        
        return False, None

    def test_create_evaluation(self, response_data):
        """Test evaluation creation"""
        if not response_data:
            print("❌ No response data available for evaluation")
            return False, None
            
        evaluation_data = {
            "response_id": response_data['id'],
            "prompt": response_data['prompt'],
            "model_response": response_data['response'],
            "evaluator_id": f"test_evaluator_{datetime.now().strftime('%H%M%S')}",
            "helpfulness": 4,
            "accuracy": 5,
            "clarity": 3,
            "has_hallucination": False,
            "has_unsafe_content": False,
            "improved_response": "This is an improved version of the response with better clarity and structure."
        }
        
        success, response = self.run_test(
            "Create Evaluation",
            "POST",
            "evaluations",
            200,
            data=evaluation_data
        )
        
        if success and response:
            # Validate evaluation response structure
            required_fields = ['id', 'response_id', 'evaluator_id', 'helpfulness', 'accuracy', 'clarity', 'timestamp']
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                print(f"❌ Missing required fields in evaluation: {missing_fields}")
                return False, None
            
            print(f"   Evaluation ID: {response['id']}")
            print(f"   Evaluator: {response['evaluator_id']}")
            return True, response
        
        return False, None

    def test_get_evaluations(self):
        """Test retrieving evaluations"""
        success, response = self.run_test(
            "Get Evaluations",
            "GET",
            "evaluations",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} evaluations")
            if len(response) > 0:
                # Check structure of first evaluation
                eval_item = response[0]
                required_fields = ['id', 'response_id', 'evaluator_id', 'helpfulness', 'accuracy', 'clarity']
                missing_fields = [field for field in required_fields if field not in eval_item]
                
                if missing_fields:
                    print(f"❌ Missing fields in evaluation item: {missing_fields}")
                    return False, []
                
                print(f"   Sample evaluation: {eval_item['evaluator_id']} - Scores: H:{eval_item['helpfulness']}, A:{eval_item['accuracy']}, C:{eval_item['clarity']}")
            
            return True, response
        
        return False, []

    def test_get_analytics(self):
        """Test analytics endpoint"""
        success, response = self.run_test(
            "Get Analytics",
            "GET",
            "analytics",
            200
        )
        
        if success and response:
            # Validate analytics response structure
            required_fields = [
                'avg_helpfulness', 'avg_accuracy', 'avg_clarity',
                'hallucination_rate', 'safety_issue_rate', 'total_evaluations',
                'avg_original_length', 'avg_improved_length', 'evaluator_stats'
            ]
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                print(f"❌ Missing required fields in analytics: {missing_fields}")
                return False, None
            
            print(f"   Total evaluations: {response['total_evaluations']}")
            print(f"   Avg scores - H:{response['avg_helpfulness']}, A:{response['avg_accuracy']}, C:{response['avg_clarity']}")
            print(f"   Issue rates - Hallucination:{response['hallucination_rate']}%, Safety:{response['safety_issue_rate']}%")
            print(f"   Evaluator count: {len(response['evaluator_stats'])}")
            
            return True, response
        
        return False, None

    def test_quality_checks(self):
        """Test quality check functionality with different prompts"""
        print("\n🔍 Testing Quality Check Features...")
        
        # Test short response warning
        short_prompt = "Say hi."
        success, response = self.run_test(
            "Quality Check - Short Response",
            "POST",
            "generate",
            200,
            data={"prompt": short_prompt},
            timeout=30
        )
        
        if success and response:
            warnings = response.get('quality_warnings', [])
            has_short_warning = any('short' in warning.lower() for warning in warnings)
            if has_short_warning:
                print("✅ Short response warning detected correctly")
            else:
                print("⚠️  Short response warning not detected (may be expected)")
        
        return success

def main():
    print("🚀 Starting LLM Human Feedback Lab API Tests")
    print("=" * 50)
    
    tester = LLMFeedbackLabTester()
    
    # Test 1: Generate AI Response
    print("\n📝 PHASE 1: Testing AI Response Generation")
    success, response_data = tester.test_generate_response()
    if not success:
        print("❌ Critical failure: Cannot generate responses. Stopping tests.")
        print(f"\n📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
        return 1
    
    # Test 2: Quality Checks
    print("\n🔍 PHASE 2: Testing Quality Check Features")
    tester.test_quality_checks()
    
    # Test 3: Create Evaluation
    print("\n📋 PHASE 3: Testing Evaluation System")
    eval_success, eval_data = tester.test_create_evaluation(response_data)
    
    # Test 4: Get Evaluations
    print("\n📚 PHASE 4: Testing Evaluation Retrieval")
    tester.test_get_evaluations()
    
    # Test 5: Analytics
    print("\n📊 PHASE 5: Testing Analytics Dashboard")
    tester.test_get_analytics()
    
    # Create a second evaluation for multi-evaluator testing
    if eval_success and response_data:
        print("\n👥 PHASE 6: Testing Multi-Evaluator Support")
        # Create second evaluation with different evaluator
        second_eval_data = {
            "response_id": response_data['id'],
            "prompt": response_data['prompt'],
            "model_response": response_data['response'],
            "evaluator_id": f"second_evaluator_{datetime.now().strftime('%H%M%S')}",
            "helpfulness": 3,
            "accuracy": 4,
            "clarity": 5,
            "has_hallucination": True,
            "has_unsafe_content": False,
            "improved_response": "Another evaluator's improved version with different perspective."
        }
        
        tester.run_test(
            "Multi-Evaluator Test",
            "POST",
            "evaluations",
            200,
            data=second_eval_data
        )
    
    # Final Results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())