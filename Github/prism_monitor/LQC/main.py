import torch
import pandas as pd
import os
import argparse

from sklearn.metrics import f1_score, accuracy_score
from torch.utils.data import DataLoader, TensorDataset

from load_dataset import load_dataset

from lqc import (
    apply_chat_template, 
    load_model, 
    get_hybrid_pooling, 
    train_contrastive_binary, 
    evaluate_model, 
    ContrastiveModel
)

from qa_pipeline import (
    get_answer_from_llm,
    lqc_after_prompt,
    instant_prompt,
    reflect_prompt
)

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model_name', type=str, default = 'meta-llama/Llama-3.2-1B', 
                        required=True, help='Model name for training LQC (e.g. meta-llama/Llama-3.2-1B)')
    
    parser.add_argument('--alpha', type=float, default=0.5,
                        required=False, help='Alpha for hybrid pooling')
    
    parser.add_argument('--target_layer', type=int, default=12,
                        required=False, help='Target layer to extract hidden states')
    
    parser.add_argument('--qa_model', type=str, default = 'meta-llama/Llama-3.1-8B-Instruct',
                        required=False, help='Model name for QA (e.g. meta-llama/Llama-3.1-8B-Instruct)')
    
    parser.add_argument('--method', type=str, default='lqc', choices=['lqc', 'instant', 'reflect'],
                        required=False, help='Method for QA: lqc, instant, reflect')
    
    return parser.parse_args()


def main():
    args = parse_args()
    device = "cuda" if torch.cuda.is_available() else "cpu"
    query_tr, label_tr, query_dev, label_dev, query_test, label_test = load_dataset()
    
    # LQC Model Training
    model_name = args.model_name
    tokenizer, model = load_model(model_name, device)
    num_layers = len(model.model.layers)
    input_dim = model.config.hidden_size
    alpha = args.alpha
    target_layer = args.target_layer
    
    if target_layer >= num_layers:
        ValueError(f"target_layer should be less than {num_layers}")
    elif target_layer < num_layers and target_layer > 0:
        target_layer = target_layer
    
    alpha_d = 1 - alpha
    print(f"""
        Using model: {model_name}
        target_layer: {target_layer}
        alpha: {alpha}
        Hybrid pooling vector: {alpha} * last token vector + {alpha_d} * mean pooling vector
    """)
    
    full_prompt_tr = apply_chat_template(tokenizer, query_tr)
    hidden_states_tr = get_hybrid_pooling(model, tokenizer, full_prompt_tr, target_layer, alpha)
    hidden_states_tr = hidden_states_tr.float()
    
    full_prompt_dev = apply_chat_template(tokenizer, query_dev)
    hidden_states_dev = get_hybrid_pooling(model, tokenizer, full_prompt_dev, target_layer, alpha)
    hidden_states_dev = hidden_states_dev.float()
    
    y_train = torch.LongTensor(label_tr)
    y_dev = torch.LongTensor(label_dev)
    
    batch_size = 16
    train_datset = TensorDataset(hidden_states_tr, y_train)
    dev_dataset = TensorDataset(hidden_states_dev, y_dev)
    
    train_loader = DataLoader(train_datset, batch_size=batch_size, shuffle=True)
    dev_loader = DataLoader(dev_dataset, batch_size=batch_size, shuffle=False)
    
    cont_model = ContrastiveModel(hidden_dim = input_dim, projection_dim = 128, 
                                num_labels = 2, dropout_rate = 0.3).to(device)
    
    lqc_model = train_contrastive_binary(cont_model, train_loader, dev_loader, 
                                        epochs = 10, lr = 1e-3, temperature = 0.07, device = device)
    
    evaluate_model(lqc_model, dev_loader, device = device)
    
    save_dir = 'model'
    model_name_split = model_name.split('/')[-1]
    lqc_model_name = f'lqc_model_{model_name_split}_alpha{alpha}_layer{target_layer}.pth'
    save_path = os.path.join(save_dir, lqc_model_name)
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    torch.save(lqc_model.state_dict(), save_path)
    
    cont_model.load_state_dict(torch.load(save_path, map_location=device))
    cont_model.eval()
    
    full_prompt_test = apply_chat_template(tokenizer, query_test)
    hidden_states_test = get_hybrid_pooling(model, tokenizer, full_prompt_test, target_layer, alpha)
    hidden_states_test = hidden_states_test.float()
    
    y_test = torch.LongTensor(label_test)
    test_dataset = TensorDataset(hidden_states_test, y_test)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for x_test, y_test in test_loader:
            x_test, y_test = x_test.to(device), y_test.to(device)
            _, logits = cont_model(x_test)
            preds = torch.argmax(logits, dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(y_test.cpu().numpy())
            
    accuracy = accuracy_score(all_labels, all_preds)
    f1 = f1_score(all_labels, all_preds, average='binary')
    
    print(f"Test Accuracy: {accuracy:.4f}")
    print(f"Test F1 Score: {f1:.4f}")
    
    
    # QA Pipeline
    results_df = pd.DataFrame({
        'Query': query_test,
        'True Label': label_test,
        'Predicted Label': all_preds
    })
    
    qa_method = args.method
    qa_model_name = args.qa_model
    
    if qa_method == 'lqc':
        generated_responses = []
        for idx, row in results_df.iterrows():
            query = row['Query']
            pred_label = row['Predicted Label']
            request_prompt = lqc_after_prompt(query, pred_label)
            response = get_answer_from_llm(request_prompt, qa_model_name)
            generated_responses.append(response)
        
        results_df['with LQC Response'] = generated_responses
        
    elif qa_method == 'instant':
        generated_responses = []
        for idx, row in results_df.iterrows():
            query = row['Query']
            request_prompt = instant_prompt(query)
            response = get_answer_from_llm(request_prompt, qa_model_name)
            generated_responses.append(response)
        results_df['INSTANT Response'] = generated_responses
        
    elif qa_method == 'reflect':
        generated_responses = []
        for idx, row in results_df.iterrows():
            query = row['Query']
            request_prompt = reflect_prompt(query)
            response = get_answer_from_llm(request_prompt, qa_model_name)
            generated_responses.append(response)
        results_df['REFLECT Response'] = generated_responses
    
    qa_model_name_split = qa_model_name.split('/')[-1]
    results_save_path = 'qa_results'
    qa_results_name = f'qa_results_lqc_{model_name_split}_qa_method_{qa_method}_qallm_{qa_model_name_split}.xlsx'
    qa_results_save_path = os.path.join(results_save_path, qa_results_name)
    os.makedirs(os.path.dirname(qa_results_save_path), exist_ok=True)
    results_df.to_excel(qa_results_save_path, index = False)
    
if __name__ == "__main__":
    main()