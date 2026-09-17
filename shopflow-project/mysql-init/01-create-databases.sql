-- mysql-init/01-create-databases.sql
--
-- What this file does:
-- Automatically creates all 5 databases the moment the MySQL container
-- starts for the very first time.
--
-- Feynman version:
-- Official MySQL Docker images have a special folder:
-- /docker-entrypoint-initdb.d/ — think of it as a "first day at the new
-- office" checklist taped to the door. On the container's FIRST startup
-- ONLY (when its data folder is empty), MySQL automatically runs every
-- .sql file it finds in that folder, in alphabetical order. We mount this
-- file there via docker-compose, so our 5 databases get created without
-- us ever typing CREATE DATABASE by hand again.
--
-- IMPORTANT: this only runs on a genuinely fresh container with no existing
-- data volume. If you've already started this MySQL container once before,
-- it will NOT re-run this script — MySQL assumes initialization already
-- happened. To force it to run again, you'd need to remove the associated
-- Docker volume first (docker compose down -v).

CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS product_db;
CREATE DATABASE IF NOT EXISTS order_db;
CREATE DATABASE IF NOT EXISTS payment_db;
CREATE DATABASE IF NOT EXISTS notification_db;
