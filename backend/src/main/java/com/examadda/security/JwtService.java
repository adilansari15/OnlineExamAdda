package com.examadda.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private final SecretKey signingKey;
    private final long expirationMinutes;
    private final Clock clock;

    public JwtService(
            @Value("${app.jwt.secret:b7b4045e93e0efedad4c6319c0307945e9a8239eb102519796e26264704550b7}") String secret,
            @Value("${app.jwt.expiration-minutes:480}") long expirationMinutes,
            Clock clock) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = expirationMinutes;
        this.clock = clock;
    }

    public String generateToken(Long userId, String email, String role) {
        Instant now = Instant.now(clock);
        Instant expiry = now.plus(expirationMinutes, ChronoUnit.MINUTES);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claims(Map.of(
                        "email", email,
                        "role", role
                ))
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .clock(() -> Date.from(Instant.now(clock)))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long extractUserId(String token) {
        return Long.parseLong(extractAllClaims(token).getSubject());
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).get("email", String.class);
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public Instant extractExpiration(String token) {
        return extractAllClaims(token).getExpiration().toInstant();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            Instant expiration = claims.getExpiration().toInstant();
            return expiration.isAfter(Instant.now(clock));
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
}

