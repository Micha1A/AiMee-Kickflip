// src-tauri/src/crypto.rs
// API: aes 0.9.0 + cbc 0.2.0 + cipher 0.5.1
// Import path per cbc 0.2.0 official docs: `use aes::cipher::{...}`
use aes::cipher::{block_padding::Pkcs7, BlockModeEncrypt, BlockModeDecrypt, KeyIvInit};
use aes::Aes192;
use cbc::{Decryptor, Encryptor};
use pbkdf2::pbkdf2;
use pbkdf2::hmac::Hmac;
use sha2::Sha256;
use rand::{RngCore, rngs::OsRng};
use std::convert::TryInto;

pub const TARGET_SIZE: usize = 1088;
pub const SALT_SIZE: usize = 16;
pub const IV_SIZE: usize = 16;
pub const KEY_SIZE: usize = 24;        // AES-192
pub const ITERATIONS: u32 = 120_000;

/// Key Derivation Function (PBKDF2-HMAC-SHA256)
pub fn derive_key(password: &str, salt: &[u8]) -> [u8; KEY_SIZE] {
    let mut key = [0u8; KEY_SIZE];
    pbkdf2::<Hmac<Sha256>>(password.as_bytes(), salt, ITERATIONS, &mut key)
        .expect("PBKDF2 failed");
    key
}

/// AES-192-CBC Verschlüsselung + Salt + IV vorne dran
pub fn encrypt_aes192(data: &[u8], password: &str) -> Vec<u8> {
    let mut salt = [0u8; SALT_SIZE];
    OsRng.fill_bytes(&mut salt);

    let key = derive_key(password, &salt);

    let mut iv = [0u8; IV_SIZE];
    OsRng.fill_bytes(&mut iv);

    let encryptor = Encryptor::<Aes192>::new_from_slices(&key, &iv)
        .expect("Invalid key or IV length");

    let encrypted = encryptor.encrypt_padded_vec::<Pkcs7>(data);

    let mut result = Vec::with_capacity(SALT_SIZE + IV_SIZE + encrypted.len());
    result.extend_from_slice(&salt);
    result.extend_from_slice(&iv);
    result.extend_from_slice(&encrypted);

    result
}

/// AES-192-CBC Entschlüsselung
pub fn decrypt_aes192(data_blob: &[u8], password: &str) -> Result<Vec<u8>, String> {
    if data_blob.len() < SALT_SIZE + IV_SIZE {
        return Err("Data blob too short".to_string());
    }

    let salt = &data_blob[0..SALT_SIZE];
    let iv = &data_blob[SALT_SIZE..SALT_SIZE + IV_SIZE];
    let ciphertext = &data_blob[SALT_SIZE + IV_SIZE..];

    let key = derive_key(password, salt);

    let decryptor = Decryptor::<Aes192>::new_from_slices(&key, iv)
        .map_err(|e| format!("Invalid key/IV: {}", e))?;

    decryptor.decrypt_padded_vec::<Pkcs7>(ciphertext)
        .map_err(|e| format!("Decryption failed: {:?}", e))
}

/// Erstellt exakt 1088-Byte Kyber-Mimikry Container
pub fn wrap_in_kyber_shell(encrypted_data: &[u8], noise: &[u8]) -> Result<Vec<u8>, String> {
    let data_len = encrypted_data.len();
    if data_len > 65535 {
        return Err("Data too large for header (max 65535 bytes)".to_string());
    }

    let header = (data_len as u16).to_be_bytes();
    let missing = TARGET_SIZE - (2 + data_len);

    if missing > noise.len() {
        return Err("Not enough noise bytes provided".to_string());
    }

    let mut container = Vec::with_capacity(TARGET_SIZE);
    container.extend_from_slice(&header);
    container.extend_from_slice(encrypted_data);
    container.extend_from_slice(&noise[0..missing]);

    if container.len() != TARGET_SIZE {
        return Err(format!("Container size mismatch: got {}", container.len()));
    }

    Ok(container)
}

/// Extrahiert den AES-Blob aus dem 1088-Byte Container
pub fn unwrap_kyber_shell(container: &[u8]) -> Result<Vec<u8>, String> {
    if container.len() < 2 {
        return Err("Container too small".to_string());
    }

    let data_len = u16::from_be_bytes(container[0..2].try_into().unwrap()) as usize;

    if 2 + data_len > container.len() {
        return Err("Invalid length header in container".to_string());
    }

    Ok(container[2..2 + data_len].to_vec())
}