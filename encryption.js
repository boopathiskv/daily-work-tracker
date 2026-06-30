/* =====================================================
   encryption.js
   AES-GCM (256-bit) encryption helpers using Web Crypto API.
   - Key derivation: PBKDF2 / SHA-256 / 250,000 iterations
   - Random 16-byte salt + 12-byte IV per encryption
   - Output: portable JSON envelope (Base64 fields)
   - Fully offline. Zero dependencies. CSP-compliant.
   ===================================================== */

(function (global) {
    'use strict';

    /* ---------- Constants ---------- */
    const FORMAT_ID         = 'DWT-AES-GCM-1';
    const PBKDF2_ITERATIONS = 250000;
    const PBKDF2_HASH       = 'SHA-256';
    const KEY_LENGTH_BITS   = 256;
    const SALT_LENGTH_BYTES = 16;
    const IV_LENGTH_BYTES   = 12;

    /* ---------- Base64 helpers ---------- */
    function bytesToBase64(bytes) {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    function base64ToBytes(b64) {
        const binary = atob(b64);
        const len    = binary.length;
        const bytes  = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    /* ---------- Key derivation ---------- */
    async function deriveKey(password, salt) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            enc.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: PBKDF2_ITERATIONS,
                hash: PBKDF2_HASH
            },
            keyMaterial,
            { name: 'AES-GCM', length: KEY_LENGTH_BITS },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /* ---------- Public API ---------- */

    /**
     * Encrypts a plaintext string with a user-supplied password.
     * Returns a JSON-string envelope safe for export.
     */
    async function encryptText(plaintext, password) {
        if (typeof plaintext !== 'string') throw new Error('Plaintext must be a string.');
        if (typeof password !== 'string' || password.length === 0) {
            throw new Error('Encryption password is required.');
        }

        const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
        const iv   = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
        const key  = await deriveKey(password, salt);

        const enc = new TextEncoder();
        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            enc.encode(plaintext)
        );

        const envelope = {
            format:     FORMAT_ID,
            algorithm:  'AES-GCM-256',
            kdf:        'PBKDF2-SHA256',
            iterations: PBKDF2_ITERATIONS,
            salt:       bytesToBase64(salt),
            iv:         bytesToBase64(iv),
            data:       bytesToBase64(new Uint8Array(ciphertext)),
            createdAt:  new Date().toISOString()
        };
        return JSON.stringify(envelope, null, 2);
    }

    /**
     * Decrypts an encrypted envelope string back to plaintext.
     * Throws on wrong password, tampering, or invalid format.
     */
    async function decryptText(envelopeJson, password) {
        if (typeof envelopeJson !== 'string') throw new Error('Encrypted data must be a string.');
        if (typeof password !== 'string' || password.length === 0) {
            throw new Error('Decryption password is required.');
        }

        let env;
        try {
            env = JSON.parse(envelopeJson);
        } catch (e) {
            throw new Error('Encrypted file is not valid JSON.');
        }
        if (!env || env.format !== FORMAT_ID) {
            throw new Error('Unrecognized encrypted file format.');
        }
        if (!env.salt || !env.iv || !env.data) {
            throw new Error('Encrypted file is missing required fields.');
        }

        const salt = base64ToBytes(env.salt);
        const iv   = base64ToBytes(env.iv);
        const data = base64ToBytes(env.data);
        const key  = await deriveKey(password, salt);

        try {
            const plainBuf = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                data
            );
            return new TextDecoder().decode(plainBuf);
        } catch (e) {
            throw new Error('Incorrect password or the file has been modified.');
        }
    }

    /**
     * Quick detector: tells if a given text looks like an encrypted envelope.
     */
    function isEncryptedEnvelope(text) {
        if (typeof text !== 'string') return false;
        try {
            const obj = JSON.parse(text);
            return !!(obj && obj.format === FORMAT_ID && obj.salt && obj.iv && obj.data);
        } catch (e) {
            return false;
        }
    }

    /**
     * Lightweight password-strength estimator (0..4).
     */
    function passwordStrength(pwd) {
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length >= 8)  score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
        if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
        return Math.min(score, 4);
    }

    /* ---------- Expose API ---------- */
    global.DWTCrypto = {
        encryptText:         encryptText,
        decryptText:         decryptText,
        isEncryptedEnvelope: isEncryptedEnvelope,
        passwordStrength:    passwordStrength,
        FORMAT_ID:           FORMAT_ID
    };
})(window);
