#!/bin/bash
# Cria um banco isolado para os testes de integração, com o mesmo usuário da aplicação.
set -e

mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
  CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}_test\`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
  GRANT ALL PRIVILEGES ON \`${MYSQL_DATABASE}_test\`.* TO '${MYSQL_USER}'@'%';
  FLUSH PRIVILEGES;
EOSQL
