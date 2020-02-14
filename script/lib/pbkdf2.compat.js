const fs = require('fs')
const crypto = require('crypto')

/*
 * Password Hashing with PBKDF2 (http://crackstation.net/hashing-security.htm).
 * Copyright (c) 2013, Taylor Hornby
 * All rights reserved.
 * 
 * Modified to Work with Older Versions of PHP
 * Copyright (c) 2014, Kijin Sung
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, 
 * this list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation 
 * and/or other materials provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE 
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 */

// These constants may be changed without breaking existing hashes.

let PBKDF2_hash_algorithm = 'sha256',
  PBKDF2_iterations = 12000,
  PBKDF2_salt_bytes = 24,
  PBKDF2_hash_bytes = 24

exports.PBKDF2_COMPAT_HASH_ALGORITHM = PBKDF2_hash_algorithm
exports.PBKDF2_COMPAT_ITERATIONS = PBKDF2_iterations
exports.PBKDF2_COMPAT_SALT_BYTES = PBKDF2_salt_bytes
exports.PBKDF2_COMPAT_HASH_BYTES = PBKDF2_hash_bytes

// Calculates a hash from the given password.

exports.create_hash = (password, force_compat = false) => {
  // Generate the salt.

  let salt = ''

  /*
  if (function_exists('mcrypt_create_iv')) {
    $salt = base64_encode(mcrypt_create_iv(PBKDF2_COMPAT_SALT_BYTES, MCRYPT_DEV_URANDOM));
  } else */
  if (crypto.randomBytes) {
    salt = crypto.randomBytes(PBKDF2_salt_bytes).toString('base64')
  } else {
      for (let i = 0; i < PBKDF2_salt_bytes; i += 2) {
        salt.concat(Buffer.from(Math.floor(Math.random() * 65535) + '').toString('utf16le'))
      }
      salt = salt.substring(0, PBKDF2_salt_bytes)
  }

  // Determine the best supported algorithm and iteration count.

  let algo = PBKDF2_hash_algorithm.toLowerCase(),
    iterations = PBKDF2_iterations
  if(force_compat || !crypto.getHashes().includes(algo)) {
    algo = false // This flag will be detected by pbkdf2_default()
    iterations = Math.round(iterations / 5) // PHP 4 is very slow. Don't cause too much server load. // THIS IS NOT PHP
  }

  // Return format: algorithm:iterations:salt:hash

  let pbkdf2 = pbkdf2_default(algo, password, salt, iterations, PBKDF2_hash_bytes)
  let prefix = algo ? algo : 'sha1'
  return `${prefix}:${iterations}:${salt}:${Buffer.from(pbkdf2).toString('base64')}`
}

// Checks whether a password matches a previously calculated hash

function validate_password(password, hash) {
  // Split the hash into 4 parts.
  let params = hash.split(':')
  if (params.length < 4) return false

  // Recalculate the hash and compare it with the original.
  
  let pbkdf2 = Bugger.from(params[3]).toString('utf8')
  let pbkdf2_check = pbkdf2_default(params[0], password, params[2], parseInt(params[1]), pbkdf2.length)
  return slow_equals(pbkdf2, pbkdf2_check)
}

// Checks whether a hash needs upgrading.

function needs_upgrade(hash)
{
  // Get the current algorithm and iteration count.
         
  let params = hash.split(':')
  if (params.length < 4) return true
  let algo = params[0]
  let iterations = parseInt(params[1])
                             
  // Compare the current hash with the best supported options.
                                   
  if (!crypto.getHashes().has(algo)) {
    return false
  } else if (algo === PBKDF2_hash_algorithm.toLowerCase() && iterations >= PBKDF2_iterations) {
      return false
  } else {
      return true
  }
}

// Compares two strings `a` and `b` in length-constant time.

function slow_equals(a, b)
{
  let diff = a.length ^ b.length
  for(let i = 0; i < a.length && i < b.length; i++) {
    diff = diff | a[i].charCodeAt(0) ^ b[i].charCodeAt(0)
  }
  return diff === 0
}

function pbkdf2_default(algo, password, salt, count, key_length)
{
  // Sanity check.
  
  if (count <= 0 || key_length <= 0) {
    throw new Error('PBKDF2 ERROR: Invalid parameters.')
  }
  
  // Check if we should use the fallback function.
                                 
  if (!algo) return pbkdf2_fallback(password, salt, count, key_length)
  
  // Check if the selected algorithm is available.
                                                 
  algo = algo.toLowerCase()
  if (!crypto.getHashes().includes(algo)) {
    if (algo === 'sha1') {
      return pbkdf2_fallback(password, salt, count, key_length)
    } else {
        throw new Error('PBKDF2 ERROR: Hash algorithm not supported.')
    }
  }
  
  // Use built-in function if available.
  
  return crypto.pbkdf2Sync(password, salt, count, key_length, algo).toString()
}

// Fallback function using sha1() and a pure-PHP implementation of HMAC.
// The result is identical to the default function when used with SHA-1.
// But it is approximately 1.6x slower than the hash_hmac() function of PHP 5.1.2+,
// And approximately 2.3x slower than the hash_pbkdf2() function of PHP 5.5+.

function pbkdf2_fallback(password, salt, count, key_length)
{
  // Count the blocks.
  
  let hash_length = 20
  let block_count = Math.ceil(key_length / hash_length)
                   
  // Prepare the HMAC key and padding.
                           
  if (password.length > 64) {
    password = crypto.createHash('sha1').update(password).digest('hex').padEnd(64, String.fromCharCode(0))
  } else {
      password = crypto.createHash('sha1').update(password).digest('hex').padEnd(64, String.fromCharCode(0))
  }
                                                           
  let opad = String.fromCharCode(0x5C).repeat(64) ^ password
  let ipad = String.fromCharCode(0x36).repeat(64) ^ password                                                                    
  // Hash it!                                                               
  let output = ''
  let last = ''
  for (let i = 1; i <= block_count; i++) {
    last = salt + Buffer.from(i).toString('utf32be')
    let xorsum = last = Buffer.from(crypto.createHash('sha1').update(opad + Buffer.from(crypto.createHash('sha1').update(ipad + last + '').digest('hex')).toString('hex')).digest('hex')).toString('hex')
    for (let j = 1; j < count; j++) {
      last = Buffer.from(crypto.createHash('sha1').update(opad + Buffer.from(crypto.createHash('sha1').update(ipad + last + '').digest('hex')).toString('hex')).digest('hex')).toString('hex')
      xorsum ^= last
    }
    output = output + xorsum + ''
  }
  
  // Truncate and return.                         
  return output.substring(0, key_length)
}

