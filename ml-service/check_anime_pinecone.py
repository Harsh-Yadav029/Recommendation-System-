import os
import sys
sys.path.insert(0, 'c:/Users/harsh/Desktop/Cognizant/ml-service')
from app.core.pinecone_client import PineconeClient
from dotenv import load_dotenv

load_dotenv('c:/Users/harsh/Desktop/Cognizant/ml-service/.env')

pc = PineconeClient.get_instance()
# Check if any anime vectors exist
query_res = pc.index.query(vector=[0.0]*384, top_k=5, filter={"domain": "anime"})
for match in query_res['matches']:
    print(match.id)
