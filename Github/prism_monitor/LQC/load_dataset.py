import pandas as pd

def load_dataset():
    # Load Train data
    situatedqa_temp_tr = pd.read_excel('dataset/SituatedQA_Temp.xlsx', sheet_name='Train')
    situatedqa_geo_tr = pd.read_excel('dataset/SituatedQA_GEO.xlsx', sheet_name='Train')
    clamber_tr = pd.read_excel('dataset/CLAMBER.xlsx', sheet_name='Train')
    coconot_fp_tr = pd.read_excel('dataset/CoCoNot_FP.xlsx', sheet_name='Train')
    coconot_un_tr = pd.read_excel('dataset/CoCoNot_UN.xlsx', sheet_name='Train')
    
    situatedqa_temp_tr_query = situatedqa_temp_tr['query'].tolist()
    situatedqa_geo_tr_query = situatedqa_geo_tr['query'].tolist()
    clamber_tr_query = clamber_tr['query'].tolist()
    coconot_fp_tr_query = coconot_fp_tr['query'].tolist()
    coconot_un_tr_query = coconot_un_tr['query'].tolist()
    
    situatedqa_temp_tr_label = situatedqa_temp_tr['label'].tolist()
    situatedqa_geo_tr_label = situatedqa_geo_tr['label'].tolist()
    clamber_tr_label = clamber_tr['label'].tolist()
    coconot_fp_tr_label = coconot_fp_tr['label'].tolist()
    coconot_un_tr_label = coconot_un_tr['label'].tolist()
    
    # Load Dev data
    situatedqa_temp_dev = pd.read_excel('dataset/SituatedQA_Temp.xlsx', sheet_name='Dev')
    situatedqa_geo_dev = pd.read_excel('dataset/SituatedQA_GEO.xlsx', sheet_name='Dev')
    clamber_dev = pd.read_excel('dataset/CLAMBER.xlsx', sheet_name='Dev')
    coconot_fp_dev = pd.read_excel('dataset/CoCoNot_FP.xlsx', sheet_name='Dev')
    coconot_un_dev = pd.read_excel('dataset/CoCoNot_UN.xlsx', sheet_name='Dev')
    
    situatedqa_temp_dev_query = situatedqa_temp_dev['query'].tolist()
    situatedqa_geo_dev_query = situatedqa_geo_dev['query'].tolist()
    clamber_dev_query = clamber_dev['query'].tolist()
    coconot_fp_dev_query = coconot_fp_dev['query'].tolist()
    coconot_un_dev_query = coconot_un_dev['query'].tolist()
    
    situatedqa_temp_dev_label = situatedqa_temp_dev['label'].tolist()
    situatedqa_geo_dev_label = situatedqa_geo_dev['label'].tolist()
    clamber_dev_label = clamber_dev['label'].tolist()
    coconot_fp_dev_label = coconot_fp_dev['label'].tolist()
    coconot_un_dev_label = coconot_un_dev['label'].tolist()
    
    # Load Test data
    situatedqa_temp_test = pd.read_excel('dataset/SituatedQA_Temp.xlsx', sheet_name='Test')
    situatedqa_geo_test = pd.read_excel('dataset/SituatedQA_GEO.xlsx', sheet_name='Test')
    clamber_test = pd.read_excel('dataset/CLAMBER.xlsx', sheet_name='Test')
    coconot_fp_test = pd.read_excel('dataset/CoCoNot_FP.xlsx', sheet_name='Test')
    coconot_un_test = pd.read_excel('dataset/CoCoNot_UN.xlsx', sheet_name='Test')
    
    situatedqa_temp_test_query = situatedqa_temp_test['query'].tolist()
    situatedqa_geo_test_query = situatedqa_geo_test['query'].tolist()
    clamber_test_query = clamber_test['query'].tolist()
    coconot_fp_test_query = coconot_fp_test['query'].tolist()
    coconot_un_test_query = coconot_un_test['query'].tolist()
    
    situatedqa_temp_test_label = situatedqa_temp_test['label'].tolist()
    situatedqa_geo_test_label = situatedqa_geo_test['label'].tolist()
    clamber_test_label = clamber_test['label'].tolist()
    coconot_fp_test_label = coconot_fp_test['label'].tolist()
    coconot_un_test_label = coconot_un_test['label'].tolist()
    
    query_tr = situatedqa_temp_tr_query + situatedqa_geo_tr_query + clamber_tr_query + coconot_fp_tr_query + coconot_un_tr_query
    label_tr = situatedqa_temp_tr_label + situatedqa_geo_tr_label + clamber_tr_label + coconot_fp_tr_label + coconot_un_tr_label
    
    query_dev = situatedqa_temp_dev_query + situatedqa_geo_dev_query + clamber_dev_query + coconot_fp_dev_query + coconot_un_dev_query
    label_dev = situatedqa_temp_dev_label + situatedqa_geo_dev_label + clamber_dev_label + coconot_fp_dev_label + coconot_un_dev_label
    
    query_test = situatedqa_temp_test_query + situatedqa_geo_test_query + clamber_test_query + coconot_fp_test_query + coconot_un_test_query
    label_test = situatedqa_temp_test_label + situatedqa_geo_test_label + clamber_test_label + coconot_fp_test_label + coconot_un_test_label
    
    return query_tr, label_tr, query_dev, label_dev, query_test, label_test