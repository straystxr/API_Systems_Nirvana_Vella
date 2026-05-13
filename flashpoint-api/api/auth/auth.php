<?php
function handleAuth(string $method, string $action) {
    match ($action) {
        'register' => authRegister($method),
        'login'    => authLogin($method),
        default    => error('Auth endpoint not found', 404),
    };
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────
function authRegister(string $method) {
    if ($method !== 'POST') error('Method not allowed', 405);

    $b = body();
    $required = ['name', 'username', 'email', 'password', 'role'];
    foreach ($required as $f) {
        if (empty($b[$f])) error("Missing field: $f", 400);
    }

    $allowedRoles = ['general', 'journalist', 'verifier', 'admin'];
    if (!in_array($b['role'], $allowedRoles)) error('Invalid role. Must be: general, journalist, verifier or admin', 400);

    // Basic email format check
    if (!filter_var($b['email'], FILTER_VALIDATE_EMAIL)) error('Invalid email format', 400);

    // Password length check
    if (strlen($b['password']) < 6) error('Password must be at least 6 characters', 400);

    $db = getDB();

    // Check duplicate email
    $check = $db->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$b['email']]);
    if ($check->fetch()) error('Email already registered', 409);

    // Check duplicate username
    $check2 = $db->prepare("SELECT id FROM users WHERE username = ?");
    $check2->execute([$b['username']]);
    if ($check2->fetch()) error('Username already taken', 409);

    $hash = password_hash($b['password'], PASSWORD_BCRYPT);

    try {
        $db->beginTransaction();

        // 1. Insert user — DB auto generates int id
        $db->prepare("
            INSERT INTO users (username, display_name, email, password_hash, user_type, is_verified)
            VALUES (?, ?, ?, ?, ?, 0)
        ")->execute([$b['username'], $b['name'], $b['email'], $hash, $b['role']]);

        $userId = (int)$db->lastInsertId();

        // 2. Insert basic membership (tier_id = 1)
        $db->prepare("
            INSERT INTO memberships (user_id, tier_id)
            VALUES (?, 1)
        ")->execute([$userId]);

        $membershipId = (int)$db->lastInsertId();

        // 3. Link membership back to user
        $db->prepare("
            UPDATE users SET membership_id = ? WHERE id = ?
        ")->execute([$membershipId, $userId]);

        $db->commit();

    } catch (Exception $e) {
        $db->rollBack();
        error('Registration failed: ' . $e->getMessage(), 500);
    }

    respond([
        'message' => 'User registered successfully',
        'user'    => [
            'id'            => $userId,
            'username'      => $b['username'],
            'name'          => $b['name'],
            'email'         => $b['email'],
            'role'          => $b['role'],
            'membership'    => 'basic',
            'membership_id' => $membershipId,
        ],
    ], 201);
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Accepts either email OR username + password
function authLogin(string $method) {
    if ($method !== 'POST') error('Method not allowed', 405);

    $b = body();

    // Must have password
    if (empty($b['password'])) error('Password is required', 400);

    // Must have either email or username
    if (empty($b['email']) && empty($b['username'])) {
        error('Either email or username is required', 400);
    }

    $db = getDB();

    // Find user by email OR username
    if (!empty($b['email'])) {
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$b['email']]);
    } else {
        $stmt = $db->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
        $stmt->execute([$b['username']]);
    }

    $user = $stmt->fetch();

    // Check user exists and password matches
    if (!$user || !password_verify($b['password'], $user['password_hash'])) {
        error('Invalid credentials', 401);
    }

    // Generate Bearer token
    $token = generateToken([
        'sub'  => $user['id'],
        'name' => $user['display_name'],
        'role' => $user['user_type'],
    ]);

    respond([
        'message'      => 'Login successful',
        'access_token' => $token,
        'token_type'   => 'Bearer',
        'expires_in'   => TOKEN_EXPIRY,
        'user'         => [
            'id'            => $user['id'],
            'username'      => $user['username'],
            'name'          => $user['display_name'],
            'email'         => $user['email'],
            'role'          => $user['user_type'],
            'membership_id' => $user['membership_id'],
            'is_verified'   => (bool)$user['is_verified'],
        ],
    ]);
}