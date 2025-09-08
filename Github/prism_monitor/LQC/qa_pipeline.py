from transformers import pipeline

def get_answer_from_llm(prompt, qa_model):
    gen_pipe = pipeline(
        "text-generation",
        model = qa_model,
        device_map = "auto"
    )
    response = gen_pipe(prompt, max_new_tokens=200, do_sample=True, temperature=0.5)
    response_text = response[0]['generated_text']
    return response_text


def instant_prompt(query):
    prompt = f"""
Respond to the following user query in one sentence.
Query: {query}\n
Response:
"""
    return prompt


def reflect_prompt(query):
    prompt = f"""
Answer the following query. If the query warrants additional verification, please provide a one-sentence explanations of why further verification is necessary; otherwise, deliver your best one-sentence answer.
Query: {query}\n
Response:
"""
    return prompt


def lqc_after_prompt(query, classification_label):
    if classification_label == 1:
        prompt = f"""
The following user query requires verification.
Analyze the query and explain in one sentence why further verification is necessary.
Begin your response with 'Verification required for this query.'
Query: {query}
Response:
"""
        
    elif classification_label == 0:
        prompt = f"""
Respond to the following user query in one sentence.
Query: {query}
Response:
"""    
    return prompt