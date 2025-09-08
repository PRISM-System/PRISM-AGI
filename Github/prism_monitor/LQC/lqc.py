import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import classification_report, confusion_matrix, f1_score, accuracy_score
from tqdm import tqdm
from transformers import AutoTokenizer, AutoModelForCausalLM

def load_model(model_name: str, device: str):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        low_cpu_mem_usage=True,
        torch_dtype=torch.float16,
        trust_remote_code=True
    ).to(device)

    if not hasattr(tokenizer, "chat_template") or tokenizer.chat_template is None:
        tokenizer.chat_template = (
            "{% for message in messages %}"
            "{% if message['role'] == 'system' %}SYSTEM: {{ message['content'] }}{% endif %}"
            "{% if message['role'] == 'user' %}USER: {{ message['content'] }}{% endif %}"
            "{% if message['role'] == 'assistant' %}ASSISTANT: {{ message['content'] }}{% endif %}"
            "{% endfor %}"
        )

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    return tokenizer, model


def apply_chat_template(tokenizer, texts, system_prompt=None):
    full_prompts = []
    for text in texts:
        if system_prompt:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ]
        else:
            messages = [{"role": "user", "content": text}]
        full_prompt = tokenizer.apply_chat_template(messages, tokenize=False)
        full_prompts.append(full_prompt)
    return full_prompts


def get_hidden_states(model, tokenizer, full_prompt_list, target_layer: int = 8, alpha: float = 0.5):
    model.eval()
    hidden_states_list = []
    with torch.no_grad():
        for prompt in tqdm(full_prompt_list, desc="Extracting hidden states"):
            inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True).to(model.device)
            outputs = model(**inputs, output_hidden_states=True)
            hs = outputs.hidden_states[target_layer]
            h_mean = hs.mean(dim=1).squeeze(0)
            h_last = hs[:, -1, :].squeeze(0)
            h_hybrid = alpha * h_last + (1 - alpha) * h_mean
            hidden_states_list.append(h_hybrid)
            
    return torch.stack(hidden_states_list)


def get_hybrid_pooling(model, tokenizer, full_prompt_list, target_layer: int = 8, alpha: float = 0.5):
    model.eval()
    hidden_states_list = []
    with torch.no_grad():
        for prompt in tqdm(full_prompt_list, desc="Extracting hidden states"):
            inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True).to(model.device)
            outputs = model(**inputs, output_hidden_states=True)
            hidden_states = outputs.hidden_states[target_layer]
            h_last = hidden_states[:, -1, :].squeeze(0)
            h_mean = hidden_states.mean(dim=1).squeeze(0)
            h_hybrid = alpha * h_last + (1 - alpha) * h_mean
            
            # last token vector
            if alpha == 1.0:
                vector = h_last
            # mean pooling
            elif alpha == 0.0:
                vector = h_mean
            # hybrid pooling vector
            elif 0.0 < alpha < 1.0:
                vector = h_hybrid
                
            hidden_states_list.append(vector)
            
    return torch.stack(hidden_states_list)

class ContrastiveModel(nn.Module):
    def __init__(self, hidden_dim=1024, projection_dim=128, num_labels=2, dropout_rate=0.3):
        super(ContrastiveModel, self).__init__()
        self.projector = nn.Sequential(
            nn.Linear(hidden_dim, projection_dim * 2),
            nn.SiLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(projection_dim * 2, projection_dim)
        )
        self.classifier = nn.Sequential(
            nn.Linear(projection_dim, projection_dim // 2),
            nn.SiLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(projection_dim // 2, num_labels)
        )
    
    def forward(self, x):
        z = self.projector(x)
        logits = self.classifier(z)
        return z, logits
    
    
def train_model(model, train_loader, val_loader, criterion, optimizer, scheduler=None, 
                epochs: int = 10, device="cuda", grad_clip: float = 1.0):
    best_val_acc = 0.0
    best_model_state = None

    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
        for x_batch, y_batch in train_loader:
            x_batch, y_batch = x_batch.to(device), y_batch.to(device)
            optimizer.zero_grad()
            output = model(x_batch)
            if isinstance(output, tuple):
                _, logits = output
            else:
                logits = output
            loss = criterion(logits, y_batch)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), grad_clip)
            optimizer.step()
            total_loss += loss.item()

        avg_train_loss = total_loss / len(train_loader)

        model.eval()
        correct, total = 0, 0
        with torch.no_grad():
            for x_val, y_val in val_loader:
                x_val, y_val = x_val.to(device), y_val.to(device)
                output = model(x_val)
                if isinstance(output, tuple):
                    _, logits_val = output
                else:
                    logits_val = output
                preds = torch.argmax(logits_val, dim=1)
                correct += (preds == y_val).sum().item()
                total += y_val.size(0)
        val_acc = correct / total
        if scheduler:
            scheduler.step(avg_train_loss)
        print(f"[Epoch {epoch+1}/{epochs}] Loss: {avg_train_loss:.4f}, Val Acc: {val_acc:.4f}")
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_model_state = model.state_dict()

    model.load_state_dict(best_model_state)
    return model


def contrastive_loss(z, color, temperature: float = 0.07):
    z = nn.functional.normalize(z, p=2, dim=1)
    sim = torch.matmul(z, z.T) / temperature  # (B, B)
    B = z.size(0)
    mask_not_self = ~torch.eye(B, dtype=torch.bool, device=z.device)
    pos_mask = (color.unsqueeze(1) == color.unsqueeze(0)) & mask_not_self
    exp_sim = torch.exp(sim)
    denom = (exp_sim * mask_not_self).sum(dim=1, keepdim=True) + 1e-8
    numer = (exp_sim * pos_mask).sum(dim=1, keepdim=True) + 1e-8
    loss = -torch.log(numer / denom).mean()
    return loss

def train_contrastive_binary(model, train_loader, val_loader, epochs=10, lr=1e-3, temperature=0.07, device="cuda"):
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=2)
    ce_loss_fn = nn.CrossEntropyLoss()

    best_val_acc = 0.0
    best_model_state = None

    for epoch in range(epochs):
        model.train()
        total_contrastive_loss = 0.0
        total_cls_loss = 0.0
        for x_batch, y_batch in train_loader:
            x_batch, y_batch = x_batch.to(device), y_batch.to(device)
            z, logits = model(x_batch)
            c_loss = contrastive_loss(z, y_batch, temperature)
            cls_loss = ce_loss_fn(logits, y_batch)
            loss = cls_loss + c_loss
            optimizer.zero_grad()
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            total_contrastive_loss += c_loss.item()
            total_cls_loss += cls_loss.item()

        avg_contrastive_loss = total_contrastive_loss / len(train_loader)
        avg_cls_loss = total_cls_loss / len(train_loader)
        model.eval()
        correct, total = 0, 0
        with torch.no_grad():
            for x_val, y_val in val_loader:
                x_val, y_val = x_val.to(device), y_val.to(device)
                _, logits_val = model(x_val)
                preds = torch.argmax(logits_val, dim=1)
                correct += (preds == y_val).sum().item()
                total += y_val.size(0)
        val_acc = correct / total
        scheduler.step(avg_cls_loss)
        print(f"[Epoch {epoch+1}/{epochs}] Contrastive Loss: {avg_contrastive_loss:.4f}, Cls Loss: {avg_cls_loss:.4f}, Val Acc: {val_acc:.4f}")
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_model_state = model.state_dict()
    
    model.load_state_dict(best_model_state)
    return model


def evaluate_model(model, val_loader, device="cuda"):
    model.eval()
    all_preds = []
    all_labels = []
    with torch.no_grad():
        for x_val, y_val in val_loader:
            x_val, y_val = x_val.to(device), y_val.to(device)
            output = model(x_val)
            if isinstance(output, tuple):
                _, logits = output
            else:
                logits = output
            preds = torch.argmax(logits, dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(y_val.cpu().numpy())
            
    print(classification_report(all_labels, all_preds, digits=4))
    print("Macro-F1: ", f1_score(all_labels, all_preds, average='binary'))
    print("Accuracy: ", accuracy_score(all_labels, all_preds))
    
    cm = confusion_matrix(all_labels, all_preds)