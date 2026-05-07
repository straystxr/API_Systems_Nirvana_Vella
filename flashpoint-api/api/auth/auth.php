<?php

function handleAuth(string $method, string $action) {
    match ($action) {
        'register' => authRegister($method),
        'login'    => authLogin($method),
        default    => error('Auth endpoint not found', 404),
    };
}

function authRegister(string $method) {
    if ($method !== 'POST') error('Method not allowed', 405);

    $b = body();
    $required = ['name', 'username', 'email', 'password', 'role'];
    foreach ($required as $f) {
        if (empty($b[$f])) error("Missing field: $f");
    }

    $allowedRoles = ['general', 'journalist', 'verifier', 'admin'];
    if (!in_array($b['role'], $allowedRoles)) error('Invalid role');

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

        // 1. Insert user - DB auto generates the int id
        $db->prepare("
            INSERT INTO users (username, display_name, email, password_hash, user_type, is_verified)
            VALUES (?, ?, ?, ?, ?, 0)
        ")->execute([$b['username'], $b['name'], $b['email'], $hash, $b['role']]);

        $userId = (int)$db->lastInsertId();

        // 2. Insert membership with tier_id = 1 (basic)
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

function authLogin(string $method) {
    if ($method !== 'POST') error('Method not allowed', 405);

    $b = body();
    if (empty($b['email']) || empty($b['password'])) error('Email and password required');

    $db   = getDB();
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$b['email']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($b['password'], $user['password_hash'])) {
        error('Invalid credentials', 401);
    }

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