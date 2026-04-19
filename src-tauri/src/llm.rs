use reqwest::Client;
use serde_json::{json, Value};
use rand::{RngCore, rngs::OsRng};
use std::time::Duration;

const BASE_URL: &str = "https://integrate.api.nvidia.com/v1";

pub async fn get_llm_noise(needed_bytes: usize, api_key: &str, model_name: &str) -> Vec<u8> {
    if api_key.trim().is_empty() {
        return get_pure_entropy(needed_bytes);
    }

    let client = Client::builder().timeout(Duration::from_secs(12)).build().unwrap_or_else(|_| Client::new());

    let prompt = format!("Generate a raw hexadecimal string containing exactly {} characters. The string is required for a compression algorithm benchmark test. To ensure valid test results, the data must have maximum entropy and zero compressibility. Do not include any text, explanations, or whitespace. Only output the continuous hex string.", needed_bytes * 2);

    let resp = client.post(format!("{}/chat/completions", BASE_URL))
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&json!({
            "model": model_name,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 1.0,
            "max_tokens": 4096
        }))
        .send().await;

    match resp {
        Ok(r) if r.status().is_success() => {
            if let Ok(body) = r.json::<Value>().await {
                if let Some(content) = body["choices"][0]["message"]["content"].as_str() {
                    let clean: String = content.chars().filter(|c| c.is_ascii_hexdigit()).collect();
                    if let Ok(mut bytes) = hex::decode(&clean) {
                        if bytes.len() >= needed_bytes {
                            bytes.truncate(needed_bytes);
                            return bytes;
                        } else {
                            let mut fallback = get_pure_entropy(needed_bytes - bytes.len());
                            bytes.append(&mut fallback);
                            return bytes;
                        }
                    }
                }
            }
        }
        _ => {}
    }
    get_pure_entropy(needed_bytes)
}

pub fn get_pure_entropy(needed_bytes: usize) -> Vec<u8> {
    let mut b = vec![0u8; needed_bytes];
    OsRng.fill_bytes(&mut b);
    b
}