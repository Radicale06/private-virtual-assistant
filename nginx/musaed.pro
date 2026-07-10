# =============================================================================
# musaed.pro — frontend SPA (React/Vite) → 127.0.0.1:13000.
# Apex is canonical; www 301-redirects to it. Self-contained (no includes).
# =============================================================================

# ---- HTTP: ACME challenge + redirect to HTTPS ----
server {
    listen 80;
    listen [::]:80;
    server_name musaed.pro www.musaed.pro;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type "text/plain";
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# ---- HTTPS: www -> apex ----
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.musaed.pro;

    ssl_certificate     /etc/letsencrypt/live/musaed.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/musaed.pro/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozSSL:10m;
    ssl_session_tickets off;
    ssl_dhparam /etc/nginx/dhparam.pem;

    return 301 https://musaed.pro$request_uri;
}

# ---- HTTPS: apex (the app) ----
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name musaed.pro;

    ssl_certificate     /etc/letsencrypt/live/musaed.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/musaed.pro/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozSSL:10m;
    ssl_session_tickets off;
    ssl_dhparam /etc/nginx/dhparam.pem;
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 1.1.1.1 8.8.8.8 valid=300s;
    resolver_timeout 5s;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    client_max_body_size 20m;

    access_log /var/log/nginx/musaed.pro.access.log;
    error_log  /var/log/nginx/musaed.pro.error.log;

    # The frontend container is published on 127.0.0.1:13000 (see docker-compose).
    # For a production static build instead, replace this block with:
    #   root /var/www/musaed/dist;
    #   location / { try_files $uri $uri/ /index.html; }
    location / {
        proxy_pass http://127.0.0.1:13000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host  $host;
        proxy_set_header X-Forwarded-Port  $server_port;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        $http_connection;
        proxy_connect_timeout 60s;
        proxy_read_timeout    300s;
        proxy_buffering       off;
    }
}
