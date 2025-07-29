import os
from supabase import create_client
from dotenv import load_dotenv
load_dotenv()
def diagnose_supabase_connection():
    """
    Diagnose why Python can't see data that exists in Supabase dashboard
    """
    
    print("=== SUPABASE CONNECTION DIAGNOSIS ===\n")
    
    # Step 1: Check environment variables
    print("1. CHECKING ENVIRONMENT CONFIGURATION:")
    
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_KEY') or os.getenv('SUPABASE_ANON_KEY')
    service_key = os.getenv('SUPABASE_SERVICE_KEY')
    
    print(f"   SUPABASE_URL: {'✅ Set' if url else '❌ Not set'}")
    if url:
        print(f"   URL value: {url}")
        # Check if URL matches the one you expect
        if 'jvylwcpqlpcuckdhidvh' in url:
            print("   ✅ URL matches the project from your screenshot")
        else:
            print("   ⚠️  URL doesn't match expected project - this might be the issue!")
    
    print(f"   SUPABASE_KEY: {'✅ Set' if key else '❌ Not set'}")
    if key:
        print(f"   Key starts with: {key[:20]}...")
        if key.startswith('eyJ'):
            print("   ✅ Looks like a valid JWT token")
        else:
            print("   ⚠️  Key format looks unusual")
    
    print(f"   SUPABASE_SERVICE_KEY: {'✅ Set' if service_key else '❌ Not set'}")
    
    # Step 2: Test different authentication methods
    print(f"\n2. TESTING DIFFERENT AUTHENTICATION METHODS:")
    
    if url and key:
        # Test with anon key
        print(f"\n   Testing with anon key:")
        try:
            supabase_anon = create_client(url, key)
            response = supabase_anon.table('issues').select('*').limit(1).execute()
            print(f"   ✅ Anon key works: {len(response.data)} records")
            if response.data:
                print(f"   Sample record ID: {response.data[0].get('id', 'No ID')}")
        except Exception as e:
            print(f"   ❌ Anon key failed: {e}")
        
        # Test with service key (if available)
        if service_key:
            print(f"\n   Testing with service key:")
            try:
                supabase_service = create_client(url, service_key)
                response = supabase_service.table('issues').select('*').limit(1).execute()
                print(f"   ✅ Service key works: {len(response.data)} records")
                if response.data:
                    print(f"   Sample record ID: {response.data[0].get('id', 'No ID')}")
            except Exception as e:
                print(f"   ❌ Service key failed: {e}")
    
    # Step 3: Check current authentication status
    print(f"\n3. CHECKING AUTHENTICATION STATUS:")
    try:
        # Assuming you have a supabase client already initialized
        supabase = create_client(url, key) if url and key else None
        if supabase:
            user = supabase.auth.get_user()
            if user and hasattr(user, 'user') and user.user:
                print(f"   ✅ Authenticated as: {user.user.email}")
                print(f"   User ID: {user.user.id}")
                
                # Check if the authenticated user matches the one in your record
                target_user_id = "11037de8-9950-4cac-90cc-e50f7357be28"
                if user.user.id == target_user_id:
                    print(f"   ✅ User ID matches the record owner")
                else:
                    print(f"   ⚠️  User ID mismatch - this could be why you can't see the record")
                    print(f"   Record owner: {target_user_id}")
                    print(f"   Current user: {user.user.id}")
            else:
                print(f"   ❌ Not authenticated - this is likely the issue!")
                print(f"   RLS policies probably require authentication to see records")
    except Exception as e:
        print(f"   ❌ Could not check auth: {e}")
    
    # Step 4: Test specific record access
    print(f"\n4. TESTING ACCESS TO SPECIFIC RECORD:")
    target_id = "83935407-ba8f-463e-b838-75963374bf37"
    
    if url and key:
        supabase = create_client(url, key)
        
        # Test different access methods
        access_methods = [
            ("Direct select", lambda: supabase.table('issues').select('*').eq('id', target_id).execute()),
            ("Count query", lambda: supabase.table('issues').select('*', count='exact').eq('id', target_id).execute()),
            ("Select with auth", lambda: supabase.table('issues').select('*').eq('id', target_id).execute()),
        ]
        
        for method_name, method_func in access_methods:
            try:
                response = method_func()
                if response.data:
                    print(f"   ✅ {method_name}: Found record")
                    return True
                else:
                    print(f"   ❌ {method_name}: No data returned")
            except Exception as e:
                print(f"   ❌ {method_name}: Error - {e}")
    
    return False

def check_rls_policies():
    """
    Provide guidance on checking RLS policies
    """
    print(f"\n=== RLS POLICY GUIDANCE ===")
    
    print("""
To check and fix RLS policies:

1. GO TO SUPABASE DASHBOARD:
   - Navigate to Authentication > Policies
   - Look for policies on the 'issues' table

2. COMMON RLS PATTERNS THAT COULD BLOCK ACCESS:
   - Policy requires authentication: auth.uid() IS NOT NULL
   - Policy restricts to record owner: auth.uid() = user_id
   - Policy has complex conditions

3. TEMPORARY FIX FOR TESTING:
   - Temporarily disable RLS on the issues table
   - Test if your Python code can now see the records
   - Re-enable RLS after identifying the issue

4. PROPER FIX:
   - Authenticate your Python client before querying
   - Use service role key for admin operations
   - Adjust RLS policies to match your use case
""")

def suggest_immediate_solutions():
    """
    Provide immediate solutions based on diagnosis
    """
    print(f"\n=== IMMEDIATE SOLUTIONS ===")
    
    solutions = [
        "1. AUTHENTICATE YOUR PYTHON CLIENT:",
        "   supabase.auth.sign_in_with_password({",
        "       'email': 'your@email.com',",
        "       'password': 'your_password'",
        "   })",
        "",
        "2. USE SERVICE ROLE KEY (bypasses RLS):",
        "   # In your .env file:",
        "   # SUPABASE_SERVICE_KEY=your_service_role_key",
        "   supabase = create_client(url, service_key)",
        "",
        "3. TEMPORARILY DISABLE RLS:",
        "   # In Supabase dashboard:",
        "   # Table Editor > issues > Settings > Disable RLS",
        "",
        "4. CHECK YOUR .ENV FILE:",
        "   # Ensure you're connecting to the right project:",
        "   # SUPABASE_URL=https://jvylwcpqlpcuckdhidvh.supabase.co",
        "",
        "5. VERIFY USER PERMISSIONS:",
        "   # Make sure your authenticated user can access the record",
        "   # based on your RLS policies"
    ]
    
    for solution in solutions:
        print(solution)

# Usage:
diagnose_supabase_connection()
check_rls_policies()
suggest_immediate_solutions()